import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs';
import { RubiksCube3D } from './3d/CubeRenderer';
import { CubeState, StandardMove, ViewMode, PieceType, AppPage, FaceName } from './types/cube';
import { FACE_COLORS, FACE_NAMES, RubikGroupAlgebra } from './math/group-algebra';
import { CubeSolver, type SolveResult, type SolverStage } from './math/cube-solver';
import { LanguageService } from './services/language.service';
import { CubeStateService, ActiveTab } from './services/cube-state.service';
import { Controls3DComponent } from './components/cube/controls-3d/controls-3d.component';
import { Cube2DComponent } from './components/cube/cube-2d/cube-2d.component';
import { TheoryGuideModalComponent } from './components/shared/theory-guide-modal/theory-guide-modal.component';
import { OnboardingTourComponent } from './components/shared/onboarding-tour/onboarding-tour.component';
import { AlgebraHudComponent } from './components/cube/algebra-hud/algebra-hud.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Controls3DComponent,
    Cube2DComponent,
    TheoryGuideModalComponent,
    OnboardingTourComponent,
    AlgebraHudComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  readonly cubeStateService = inject(CubeStateService);

  private readonly subs = new Subscription();

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  @ViewChild('cubeContainer') cubeContainerRef!: ElementRef<HTMLDivElement>;
  readonly cubeRenderer = signal<RubiksCube3D | null>(null);

  // Delegated Reactive State Signals
  readonly cubeState = this.cubeStateService.cubeState;
  readonly previousState = this.cubeStateService.previousState;
  readonly lastMove = this.cubeStateService.lastMove;
  readonly selectedPieceType = this.cubeStateService.selectedPieceType;
  readonly selectedPieceId = this.cubeStateService.selectedPieceId;
  readonly activeSubgroupId = this.cubeStateService.activeSubgroupId;
  readonly activeTab = this.cubeStateService.activeTab;
  readonly activePage = this.cubeStateService.activePage;
  readonly viewMode = this.cubeStateService.viewMode;
  readonly net2DFaces = this.cubeStateService.net2DFaces;
  readonly explodeFactor = this.cubeStateService.explodeFactor;
  readonly animSpeed = this.cubeStateService.animSpeed;
  readonly showCycleArrows = this.cubeStateService.showCycleArrows;
  readonly isAnimating = this.cubeStateService.isAnimating;
  readonly isTheoryOpen = this.cubeStateService.isTheoryOpen;
  readonly isTourOpen = this.cubeStateService.isTourOpen;
  readonly is3DPaintMode = this.cubeStateService.is3DPaintMode;
  readonly activeBrushColor = this.cubeStateService.activeBrushColor;
  readonly faceNames = FACE_NAMES;
  readonly faceColors = FACE_COLORS;

  // Delegated Computed Signals
  readonly orbitPieces = this.cubeStateService.orbitPieces;
  readonly analysis = this.cubeStateService.analysis;
  readonly isSolved = this.cubeStateService.isSolved;
  readonly activePieceName = this.cubeStateService.activePieceName;

  // Global Solver Modal State
  readonly isSolveModalOpen = signal<boolean>(false);
  readonly solveResult = signal<SolveResult | null>(null);
  readonly activeSolveStageIndex = signal<number>(0);
  readonly currentSolveMoveIndex = signal<number>(0);
  readonly isSolveAutoPlaying = signal<boolean>(false);
  readonly solvePlaybackSpeed = signal<number>(1);
  private solveAutoPlayTimer: any = null;

  readonly activeSolveStage = computed<SolverStage | null>(() => {
    const res = this.solveResult();
    if (!res || !res.stages.length) return null;
    return res.stages[this.activeSolveStageIndex()] ?? null;
  });

  readonly solveProgressPercent = computed<number>(() => {
    const res = this.solveResult();
    if (!res || res.totalMoves === 0) return 0;
    return Math.min(100, Math.round((this.currentSolveMoveIndex() / res.totalMoves) * 100));
  });

  constructor() {
    // Synchronize current route with activePage in CubeStateService
    this.subs.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe((e) => {
          const url = e.urlAfterRedirects;
          if (url.includes('validator')) {
            this.cubeStateService.setActivePage('validator');
          } else if (url.includes('tutorial')) {
            this.cubeStateService.setActivePage('tutorial');
          } else if (url.includes('math')) {
            this.cubeStateService.setActivePage('math');
          } else {
            this.cubeStateService.setActivePage('home');
          }
          this.updateHighlights();
        })
    );

    // Reactive synchronization for 3D Highlights and Visual Overlays
    effect(() => {
      this.cubeRenderer();
      this.activePage();
      this.selectedPieceType();
      this.selectedPieceId();
      this.activeSubgroupId();
      this.activeTab();
      this.showCycleArrows();
      this.analysis();
      this.explodeFactor();

      this.updateHighlights();
    });
  }

  toggleViewMode(): void {
    const next = this.viewMode() === '3d' ? '2d' : '3d';
    this.setViewMode(next);
  }

  setViewMode(mode: ViewMode): void {
    this.cubeStateService.setViewMode(mode);
  }

  handlePieceClick(type: PieceType, id: number): void {
    if (this.activePage() !== 'math') return;
    if (type === 'corner' || type === 'edge') {
      this.cubeStateService.setSelectedPiece(type, id);
      this.updateHighlights();
    }
  }

  updateHighlights(): void {
    const renderer = this.cubeRenderer();
    if (!renderer) return;

    if (this.activePage() !== 'math') {
      renderer.setHighlight({
        selectedPieceType: undefined,
        selectedPieceId: undefined,
        orbitPieces: [],
        showCycleArrows: false,
        cycleData: [],
        explodedOffset: this.explodeFactor(),
      });
      return;
    }

    const pType = this.selectedPieceType();
    const pId = this.selectedPieceId();
    const tab = this.activeTab();
    const showArrows = this.showCycleArrows();
    const anal = this.analysis();
    const explode = this.explodeFactor();
    const orbitPieces = this.orbitPieces();

    renderer.setHighlight({
      selectedPieceType: pType,
      selectedPieceId: pId,
      orbitPieces: tab === 'orbit' ? orbitPieces : undefined,
      showCycleArrows: showArrows && tab === 'cycles',
      cycleData: anal?.cornerCycles || [],
      explodedOffset: explode,
    });
  }

  ngAfterViewInit(): void {
    if (!this.cubeContainerRef?.nativeElement) return;

    this.ngZone.runOutsideAngular(() => {
      try {
        const renderer = new RubiksCube3D(this.cubeContainerRef.nativeElement);
        renderer.onPieceClick = (pieceType, pieceId) => {
          this.ngZone.run(() => {
            if (this.activePage() !== 'math') return;
            this.cubeStateService.setSelectedPiece(pieceType, pieceId);
            this.updateHighlights();
          });
        };

        renderer.onStickerClick = (event) => {
          this.ngZone.run(() => {
            if (this.cubeStateService.is3DPaintMode()) {
              const brush = this.cubeStateService.activeBrushColor();
              const color = this.getFaceColor(brush);
              if (event.materialIndex >= 0) {
                renderer.paintStickerMesh(event.bodyMesh, event.materialIndex, color);
              }
              this.cubeStateService.paintSticker(event.face, event.row, event.col, color);
            }
          });
        };

        this.ngZone.run(() => {
          this.cubeRenderer.set(renderer);
          this.updateHighlights();
        });
      } catch (err) {
        console.warn('WebGL context unavailable or not supported:', err);
      }
    });

    // Subscribe to state service events to animate the 3D renderer
    this.subs.add(
      this.cubeStateService.moveRequest$.subscribe(({ move, onComplete }) => {
        this.animateSingleMove(move, onComplete);
      })
    );

    this.subs.add(
      this.cubeStateService.algorithmRequest$.subscribe(({ moves, onComplete }) => {
        this.animateAlgorithmMoves(moves, onComplete);
      })
    );

    this.subs.add(
      this.cubeStateService.tamperRequest$.subscribe((action) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          if (action === 'twist') {
            renderer.twistCornerMesh(0, 1);
          } else if (action === 'flip') {
            renderer.flipEdgeMesh(0);
          } else if (action === 'swap') {
            renderer.swapPiecesMesh('corner', 0, 1);
          } else if (action === 'repair') {
            renderer.resetToIdentity();
          }
        }
        this.updateHighlights();
      })
    );

    this.subs.add(
      this.cubeStateService.resetRequest$.subscribe(() => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.resetToIdentity();
          this.updateHighlights();
        }
      })
    );

    this.subs.add(
      this.cubeStateService.scrambleRequest$.subscribe((moves) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          for (const m of moves) {
            renderer.applyMoveInstant(m);
          }
          this.updateHighlights();
        }
      })
    );

    this.subs.add(
      this.cubeStateService.customStateRequest$.subscribe((state) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.applyCustomState(state);
          this.updateHighlights();
        }
      })
    );

    this.subs.add(
      this.cubeStateService.netSync$.subscribe((net) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.applyNetColors(net);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.stopSolveAutoPlay();
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.destroy();
      this.cubeRenderer.set(null);
    }
  }

  private animateSingleMove(move: StandardMove, onComplete?: () => void): void {
    const renderer = this.cubeRenderer();
    if (!renderer) {
      if (onComplete) onComplete();
      return;
    }

    this.cubeStateService.setIsAnimating(true);
    this.ngZone.runOutsideAngular(() => {
      renderer.animateMove(move, () => {
        this.ngZone.run(() => {
          this.cubeStateService.setIsAnimating(false);
          this.updateHighlights();
          if (onComplete) onComplete();
        });
      });
    });
  }

  private animateAlgorithmMoves(moves: StandardMove[], onComplete?: () => void): void {
    const renderer = this.cubeRenderer();
    if (!renderer) {
      if (onComplete) onComplete();
      return;
    }

    this.cubeStateService.setIsAnimating(true);
    let completedCount = 0;
    this.ngZone.runOutsideAngular(() => {
      moves.forEach((m) => {
        renderer.animateMove(m, () => {
          completedCount++;
          if (completedCount === moves.length) {
            this.ngZone.run(() => {
              this.cubeStateService.setIsAnimating(false);
              this.updateHighlights();
              if (onComplete) onComplete();
            });
          }
        });
      });
    });
  }

  handleApplyMove(move: StandardMove): void {
    this.cubeStateService.applyMove(move);
  }

  handleReset(): void {
    this.cubeStateService.reset();
  }

  handleScramble(): void {
    this.cubeStateService.scramble(20);
  }

  handleExplodeChange(val: number): void {
    this.cubeStateService.setExplodeFactor(val);
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.setExplode(val);
      this.updateHighlights();
    }
  }

  handleSpeedChange(val: number): void {
    this.cubeStateService.setAnimSpeed(val);
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.animationSpeed = val;
    }
  }

  handleResetCamera(): void {
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.resetCamera();
    }
  }

  setShowCycleArrows(show: boolean): void {
    this.cubeStateService.setShowCycleArrows(show);
    this.updateHighlights();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  openTheory(): void {
    this.cubeStateService.openTheory();
  }

  closeTheory(): void {
    this.cubeStateService.closeTheory();
  }

  getFaceColor(face: FaceName): string {
    return FACE_COLORS[face];
  }

  setBrushColor(face: FaceName): void {
    this.cubeStateService.setActiveBrushColor(face);
  }

  toggle3DPaintMode(): void {
    this.cubeStateService.toggle3DPaintMode();
  }

  exit3DPaintMode(): void {
    this.cubeStateService.set3DPaintMode(false);
  }

  openTour(): void {
    this.cubeStateService.openTour();
  }

  closeTour(): void {
    this.cubeStateService.closeTour();
  }

  // ==========================================
  // SOLVER MODAL ACTIONS
  // ==========================================

  openSolveModal(): void {
    const result = this.cubeStateService.solveCurrentCube();
    this.solveResult.set(result);
    this.activeSolveStageIndex.set(0);
    this.currentSolveMoveIndex.set(0);
    this.isSolveModalOpen.set(true);
  }

  closeSolveModal(): void {
    this.stopSolveAutoPlay();
    this.isSolveModalOpen.set(false);
  }

  selectSolveStage(index: number): void {
    this.activeSolveStageIndex.set(index);
  }

  stepForwardSolve(): void {
    const res = this.solveResult();
    if (!res) return;
    const idx = this.currentSolveMoveIndex();
    if (idx >= res.allMoves.length) return;

    const move = res.allMoves[idx];
    this.cubeStateService.applyMove(move);
    this.currentSolveMoveIndex.set(idx + 1);

    let countSoFar = 0;
    for (let i = 0; i < res.stages.length; i++) {
      countSoFar += res.stages[i].moves.length;
      if (idx + 1 >= countSoFar && i + 1 < res.stages.length) {
        this.activeSolveStageIndex.set(i + 1);
      }
    }
  }

  stepBackwardSolve(): void {
    const res = this.solveResult();
    if (!res) return;
    const idx = this.currentSolveMoveIndex();
    if (idx <= 0) return;

    const prevMove = res.allMoves[idx - 1];
    const inverted = RubikGroupAlgebra.invertAlgorithm(prevMove)[0] as StandardMove;
    this.cubeStateService.applyMove(inverted);
    this.currentSolveMoveIndex.set(idx - 1);

    let countSoFar = 0;
    for (let i = 0; i < res.stages.length; i++) {
      countSoFar += res.stages[i].moves.length;
      if (idx - 1 < countSoFar) {
        this.activeSolveStageIndex.set(i);
        break;
      }
    }
  }

  toggleSolveAutoPlay(): void {
    if (this.isSolveAutoPlaying()) {
      this.stopSolveAutoPlay();
    } else {
      this.startSolveAutoPlay();
    }
  }

  startSolveAutoPlay(): void {
    const res = this.solveResult();
    if (!res || this.currentSolveMoveIndex() >= res.allMoves.length) {
      return;
    }
    this.isSolveAutoPlaying.set(true);
    this.executeNextSolveAutoPlayMove();
  }

  private executeNextSolveAutoPlayMove(): void {
    if (!this.isSolveAutoPlaying()) return;
    const res = this.solveResult();
    if (!res || this.currentSolveMoveIndex() >= res.allMoves.length) {
      this.stopSolveAutoPlay();
      return;
    }

    const move = res.allMoves[this.currentSolveMoveIndex()];
    this.cubeStateService.applyMove(move, () => {
      this.currentSolveMoveIndex.update((i) => i + 1);

      let countSoFar = 0;
      for (let i = 0; i < res.stages.length; i++) {
        countSoFar += res.stages[i].moves.length;
        if (this.currentSolveMoveIndex() >= countSoFar && i + 1 < res.stages.length) {
          this.activeSolveStageIndex.set(i + 1);
        }
      }

      if (this.currentSolveMoveIndex() >= res.allMoves.length) {
        this.stopSolveAutoPlay();
        return;
      }

      const delay = Math.max(150, Math.round(500 / this.solvePlaybackSpeed()));
      this.solveAutoPlayTimer = setTimeout(() => {
        this.executeNextSolveAutoPlayMove();
      }, delay);
    });
  }

  stopSolveAutoPlay(): void {
    this.isSolveAutoPlaying.set(false);
    if (this.solveAutoPlayTimer) {
      clearTimeout(this.solveAutoPlayTimer);
      this.solveAutoPlayTimer = null;
    }
  }

  setSolvePlaybackSpeed(speed: number): void {
    this.solvePlaybackSpeed.set(speed);
  }
}
