import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CubeStateService } from '../../services/cube-state.service';
import { LanguageService } from '../../services/language.service';
import {
  RubikGroupAlgebra,
  FACE_COLORS,
  FACE_NAMES,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  type ReconstructionResult,
} from '../../math/group-algebra';
import { CubeSolver, type SolveResult, type SolverStage } from '../../math/cube-solver';
import { Net2DFaces, FaceName, CubeState, Facelet2D, StandardMove } from '../../types/cube';

export interface ColorPaletteItem {
  face: FaceName;
  nameEn: string;
  nameBg: string;
  color: string;
}

@Component({
  selector: 'app-custom-cube',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './custom-cube.component.html',
  styleUrl: './custom-cube.component.css',
})
export class CustomCubeComponent implements OnInit, OnDestroy {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);
  private readonly sub = new Subscription();

  readonly language = this.languageService.language;
  readonly t = this.languageService.t;
  readonly isBg = computed(() => this.language() === 'bg');

  // Input modes: '2d' (Net Painter) or 'pieces' (Piece by Piece Inspector)
  readonly activeMode = signal<'2d' | 'pieces'>('2d');

  // Active brush color from palette
  readonly activeColor = this.cubeStateService.activeBrushColor;
  readonly is3DPaintMode = this.cubeStateService.is3DPaintMode;

  // The editable 2D Net holding all 54 facelet stickers
  readonly editableNet = this.cubeStateService.customNet;

  // Success toast/message state
  readonly applySuccess = signal<boolean>(false);

  // Palette definition
  readonly palette: ColorPaletteItem[] = [
    { face: 'U', nameEn: 'White (Up)', nameBg: 'Бяло (U - Горе)', color: FACE_COLORS.U },
    { face: 'D', nameEn: 'Yellow (Down)', nameBg: 'Жълто (D - Долу)', color: FACE_COLORS.D },
    { face: 'F', nameEn: 'Green (Front)', nameBg: 'Зелено (F - Отпред)', color: FACE_COLORS.F },
    { face: 'B', nameEn: 'Blue (Back)', nameBg: 'Синьо (B - Отзад)', color: FACE_COLORS.B },
    { face: 'L', nameEn: 'Orange (Left)', nameBg: 'Оранжево (L - Отляво)', color: FACE_COLORS.L },
    { face: 'R', nameEn: 'Red (Right)', nameBg: 'Червено (R - Отдясно)', color: FACE_COLORS.R },
  ];

  readonly faceNames = FACE_NAMES;
  readonly faceColors = FACE_COLORS;

  // Real-time reconstruction and cubology validation
  readonly reconstruction = computed<ReconstructionResult>(() => {
    return RubikGroupAlgebra.reconstructFrom2DNet(this.editableNet());
  });

  readonly colorCounts = computed(() => this.reconstruction().colorCounts);
  readonly isValidColorCount = computed(() => this.reconstruction().isValidColorCount);
  readonly orbitValidation = computed(() => this.reconstruction().orbitValidation);
  readonly isSolvable = computed(() => !!this.orbitValidation()?.isValidOrbit);

  // ==========================================
  // STEP-BY-STEP SOLVER STATE & PLAYBACK
  // ==========================================
  readonly solveResult = signal<SolveResult | null>(null);
  readonly showSolver = signal<boolean>(false);
  readonly activeStageIndex = signal<number>(0);
  readonly currentMoveIndex = signal<number>(0);
  readonly isAutoPlaying = signal<boolean>(false);
  readonly playbackSpeed = signal<number>(1);
  readonly isCubeLoadedIn3D = signal<boolean>(false);
  private autoPlayTimer: any = null;

  readonly activeStage = computed<SolverStage | null>(() => {
    const res = this.solveResult();
    if (!res || !res.stages.length) return null;
    return res.stages[this.activeStageIndex()] ?? null;
  });

  readonly isSolved = computed<boolean>(() => {
    return this.cubeStateService.isSolved();
  });

  readonly solveProgressPercent = computed<number>(() => {
    const res = this.solveResult();
    if (!res || res.totalMoves === 0) return 0;
    const progress = Math.min(100, Math.round((this.currentMoveIndex() / res.totalMoves) * 100));
    return progress;
  });

  ngOnInit(): void {
    // Automatically enable 3D painting when entering custom cube route
    this.cubeStateService.set3DPaintMode(true);
    // Sync current net to 3D cube model
    this.cubeStateService.syncNetTo3D(this.editableNet());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.stopAutoPlay();
    this.cubeStateService.set3DPaintMode(false);
  }

  // ==========================================
  // STEP-BY-STEP SOLVER CONTROLS
  // ==========================================

  toggleSolver(): void {
    if (this.showSolver()) {
      this.showSolver.set(false);
      this.stopAutoPlay();
      return;
    }

    this.calculateAndLoadSolution();
  }

  calculateAndLoadSolution(): void {
    const res = this.reconstruction();
    if (!res.state || !res.orbitValidation?.isValidOrbit) return;

    const result = this.cubeStateService.solveState(res.state);
    this.solveResult.set(result);
    this.activeStageIndex.set(0);
    this.currentMoveIndex.set(0);
    this.showSolver.set(true);

    // Physically load the custom cube into the 3D model
    this.cubeStateService.loadCustomPhysicalCube(
      res.state,
      result.allMoves,
      this.isBg() ? 'Моето физическо кубче' : 'My Physical Cube'
    );
    this.isCubeLoadedIn3D.set(true);
  }

  reloadIn3D(): void {
    this.stopAutoPlay();
    const res = this.reconstruction();
    const sol = this.solveResult();
    if (res.state && sol) {
      this.cubeStateService.loadCustomPhysicalCube(
        res.state,
        sol.allMoves,
        this.isBg() ? 'Моето физическо кубче' : 'My Physical Cube'
      );
      this.currentMoveIndex.set(0);
      this.activeStageIndex.set(0);
    }
  }

  selectStage(index: number): void {
    this.activeStageIndex.set(index);
  }

  stepForward(): void {
    const res = this.solveResult();
    if (!res) return;
    const idx = this.currentMoveIndex();
    if (idx >= res.allMoves.length) return;

    const move = res.allMoves[idx];
    this.cubeStateService.applyMove(move);
    this.currentMoveIndex.set(idx + 1);

    // Automatically advance activeStageIndex if current move passed current stage
    let countSoFar = 0;
    for (let i = 0; i < res.stages.length; i++) {
      countSoFar += res.stages[i].moves.length;
      if (idx + 1 >= countSoFar && i + 1 < res.stages.length) {
        this.activeStageIndex.set(i + 1);
      }
    }
  }

  stepBackward(): void {
    const res = this.solveResult();
    if (!res) return;
    const idx = this.currentMoveIndex();
    if (idx <= 0) return;

    const prevMove = res.allMoves[idx - 1];
    const inverted = RubikGroupAlgebra.invertAlgorithm(prevMove)[0] as StandardMove;
    this.cubeStateService.applyMove(inverted);
    this.currentMoveIndex.set(idx - 1);

    // Automatically update stage index backward if needed
    let countSoFar = 0;
    for (let i = 0; i < res.stages.length; i++) {
      countSoFar += res.stages[i].moves.length;
      if (idx - 1 < countSoFar) {
        this.activeStageIndex.set(i);
        break;
      }
    }
  }

  toggleAutoPlay(): void {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay(): void {
    const res = this.solveResult();
    if (!res || this.currentMoveIndex() >= res.allMoves.length) {
      this.reloadIn3D();
    }

    this.isAutoPlaying.set(true);
    this.executeNextAutoPlayMove();
  }

  private executeNextAutoPlayMove(): void {
    if (!this.isAutoPlaying()) return;
    const res = this.solveResult();
    if (!res || this.currentMoveIndex() >= res.allMoves.length) {
      this.stopAutoPlay();
      return;
    }

    const move = res.allMoves[this.currentMoveIndex()];
    this.cubeStateService.applyMove(move, () => {
      this.currentMoveIndex.update((idx) => idx + 1);

      let countSoFar = 0;
      for (let i = 0; i < res.stages.length; i++) {
        countSoFar += res.stages[i].moves.length;
        if (this.currentMoveIndex() >= countSoFar && i + 1 < res.stages.length) {
          this.activeStageIndex.set(i + 1);
        }
      }

      if (this.currentMoveIndex() >= res.allMoves.length) {
        this.stopAutoPlay();
        return;
      }

      const delay = Math.max(150, Math.round(500 / this.playbackSpeed()));
      this.autoPlayTimer = setTimeout(() => {
        this.executeNextAutoPlayMove();
      }, delay);
    });
  }

  stopAutoPlay(): void {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  setSpeed(speed: number): void {
    this.playbackSpeed.set(speed);
  }

  toggle3DPaint(): void {
    this.cubeStateService.toggle3DPaintMode();
  }

  // Select brush color
  selectColor(face: FaceName): void {
    this.cubeStateService.setActiveBrushColor(face);
  }

  // Paint single facelet
  paintFacelet(face: FaceName, r: number, c: number): void {
    this.cubeStateService.paintSticker(face, r, c);
    this.applySuccess.set(false);
  }

  // Reset to solved state colors
  resetToSolved(): void {
    this.cubeStateService.resetCustomNetToSolved();
    this.applySuccess.set(false);
  }

  // Clear non-center stickers to blank neutral grey
  clearToBlank(): void {
    this.cubeStateService.clearCustomNetToBlank();
    this.applySuccess.set(false);
  }

  // Preset loader
  loadPreset(preset: 'solved' | 'scramble' | 'twist' | 'flip' | 'swap' | 'superflip'): void {
    let state: CubeState;

    switch (preset) {
      case 'solved':
        state = RubikGroupAlgebra.createIdentityState();
        break;
      case 'scramble': {
        const moves = RubikGroupAlgebra.parseAlgorithm(
          "R U R' U' R' F R2 U' R' U' R U R' F'"
        );
        state = RubikGroupAlgebra.applyAlgorithm(RubikGroupAlgebra.createIdentityState(), moves);
        break;
      }
      case 'twist': {
        const idState = RubikGroupAlgebra.createIdentityState();
        state = RubikGroupAlgebra.simulateCornerTwist(idState, 0, 1);
        break;
      }
      case 'flip': {
        const idState = RubikGroupAlgebra.createIdentityState();
        state = RubikGroupAlgebra.simulateEdgeFlip(idState, 0);
        break;
      }
      case 'swap': {
        const idState = RubikGroupAlgebra.createIdentityState();
        state = RubikGroupAlgebra.simulatePieceSwap(idState);
        break;
      }
      case 'superflip': {
        const superflipMoves = RubikGroupAlgebra.parseAlgorithm(
          "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"
        );
        state = RubikGroupAlgebra.applyAlgorithm(RubikGroupAlgebra.createIdentityState(), superflipMoves);
        break;
      }
    }

    const net = RubikGroupAlgebra.compute2DNet(state);
    this.cubeStateService.setCustomNet(net);
    this.applySuccess.set(false);
  }

  // Piece-by-piece manipulation: twist corner in place
  twistCornerInPlace(cornerId: number, delta: number): void {
    const res = this.reconstruction();
    if (!res.state) return;

    const nextState = RubikGroupAlgebra.simulateCornerTwist(res.state, cornerId, delta);
    const net = RubikGroupAlgebra.compute2DNet(nextState);
    this.cubeStateService.setCustomNet(net);
    this.applySuccess.set(false);
  }

  // Piece-by-piece manipulation: flip edge in place
  flipEdgeInPlace(edgeId: number): void {
    const res = this.reconstruction();
    if (!res.state) return;

    const nextState = RubikGroupAlgebra.simulateEdgeFlip(res.state, edgeId);
    const net = RubikGroupAlgebra.compute2DNet(nextState);
    this.cubeStateService.setCustomNet(net);
    this.applySuccess.set(false);
  }

  // Apply reconstructed state to global 3D cube service
  applyToCube(): void {
    const res = this.reconstruction();
    if (!res.state) return;

    this.cubeStateService.setCustomCubeState(
      res.state,
      this.isBg() ? 'Въведено Физическо Кубче' : 'Physical Cube Custom Input'
    );

    this.applySuccess.set(true);
    setTimeout(() => {
      this.applySuccess.set(false);
    }, 4000);
  }

  // Helper to get corners with names for piece-by-piece mode
  readonly cornerPiecesList = computed(() => {
    const res = this.reconstruction();
    if (!res.state) return [];
    return res.state.corners.map((c) => ({
      ...c,
      initialDef: INITIAL_CORNERS[c.id],
      twistName: c.orientation === 0 ? '0° (OK)' : c.orientation === 1 ? '+120°' : '+240°',
    }));
  });

  // Helper to get edges with names for piece-by-piece mode
  readonly edgePiecesList = computed(() => {
    const res = this.reconstruction();
    if (!res.state) return [];
    return res.state.edges.map((e) => ({
      ...e,
      initialDef: INITIAL_EDGES[e.id],
      flipName: e.orientation === 0 ? (this.isBg() ? 'Нормален (0)' : 'Correct (0)') : (this.isBg() ? 'Обърнат (1)' : 'Flipped (1)'),
    }));
  });
}
