import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SoundService } from './sound.service';
import {
  CubeState,
  StandardMove,
  MoveAnalysis,
  ViewMode,
  Net2DFaces,
  PieceType,
  AppPage,
  SubgroupPreset,
  FaceName,
} from '../types/cube';
import {
  RubikGroupAlgebra,
  type OrbitValidationResult,
  type CauchyTheoremWitness,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  SUBGROUP_PRESETS,
  FACE_COLORS,
  FACE_NAMES,
} from '../math/group-algebra';
import { CubeSolver, type SolveResult, type SolverStage } from '../math/cube-solver';

export type ActiveTab = 'orbit' | 'stabilizer' | 'cycles' | 'commutator' | 'order' | 'subgroups';

export interface MoveExecutionEvent {
  move: StandardMove;
  isSequence?: boolean;
}

/**
 * Modern Reactive State Management Service for Rubik's Cube.
 * Acts as the Single Source of Truth using Angular Signals.
 * UI components only read from this service and dispatch actions without calculating permutations.
 */
@Injectable({
  providedIn: 'root',
})
export class CubeStateService {
  readonly soundService = inject(SoundService);

  // ==========================================
  // CORE STATE SIGNALS
  // ==========================================
  readonly cubeState = signal<CubeState>(RubikGroupAlgebra.createIdentityState());
  readonly previousState = signal<CubeState>(RubikGroupAlgebra.createIdentityState());
  readonly lastMove = signal<string>('e (Identity)');
  readonly moveHistory = signal<string[]>([]);
  readonly redoHistory = signal<string[]>([]);
  readonly isAnimating = signal<boolean>(false);

  // ==========================================
  // INTERACTION & NAVIGATION SIGNALS
  // ==========================================
  readonly selectedPieceType = signal<'corner' | 'edge'>('corner');
  readonly selectedPieceId = signal<number>(0);
  readonly activeSubgroupId = signal<string>('full');
  readonly activeTab = signal<ActiveTab>('orbit');
  readonly activePage = signal<AppPage>('home');

  // ==========================================
  // VIEW & VISUAL SETTINGS SIGNALS
  // ==========================================
  readonly viewMode = signal<ViewMode>(
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('rubik_view_mode') as ViewMode)) ||
      '3d'
  );
  readonly explodeFactor = signal<number>(0);
  readonly animSpeed = signal<number>(0.22);
  readonly showCycleArrows = signal<boolean>(true);
  readonly isTheoryOpen = signal<boolean>(false);
  readonly isTourOpen = signal<boolean>(
    typeof localStorage !== 'undefined' && !localStorage.getItem('rubik_tour_seen')
  );
  readonly is3DPaintMode = signal<boolean>(false);
  readonly activeBrushColor = signal<FaceName>('U');
  readonly customNet = signal<Net2DFaces>(
    RubikGroupAlgebra.compute2DNet(RubikGroupAlgebra.createIdentityState())
  );

  // ==========================================
  // 3D ANIMATION DISPATCH STREAM (RxJS Subject)
  // ==========================================
  private readonly moveRequestSubject = new Subject<{
    move: StandardMove;
    onComplete?: () => void;
  }>();

  private readonly algorithmRequestSubject = new Subject<{
    moves: StandardMove[];
    onComplete?: () => void;
  }>();

  private readonly tamperRequestSubject = new Subject<'twist' | 'flip' | 'swap' | 'repair'>();
  private readonly resetRequestSubject = new Subject<void>();
  private readonly scrambleRequestSubject = new Subject<StandardMove[]>();
  private readonly customStateRequestSubject = new Subject<CubeState>();
  private readonly netSyncSubject = new Subject<Net2DFaces>();
  private readonly stickerPaintRequestSubject = new Subject<{
    face: FaceName;
    row: number;
    col: number;
    color: string;
  }>();

  readonly moveRequest$: Observable<{ move: StandardMove; onComplete?: () => void }> =
    this.moveRequestSubject.asObservable();
  readonly algorithmRequest$: Observable<{ moves: StandardMove[]; onComplete?: () => void }> =
    this.algorithmRequestSubject.asObservable();
  readonly tamperRequest$: Observable<'twist' | 'flip' | 'swap' | 'repair'> =
    this.tamperRequestSubject.asObservable();
  readonly resetRequest$: Observable<void> =
    this.resetRequestSubject.asObservable();
  readonly scrambleRequest$: Observable<StandardMove[]> =
    this.scrambleRequestSubject.asObservable();
  readonly customStateRequest$: Observable<CubeState> =
    this.customStateRequestSubject.asObservable();
  readonly netSync$: Observable<Net2DFaces> =
    this.netSyncSubject.asObservable();
  readonly stickerPaintRequest$: Observable<{
    face: FaceName;
    row: number;
    col: number;
    color: string;
  }> = this.stickerPaintRequestSubject.asObservable();

  // ==========================================
  // REACTIVE COMPUTED SIGNALS (DERIVED STATE)
  // ==========================================

  /**
   * Evaluates if the current cube matches the solved state identity e in G.
   */
  readonly isSolved = computed<boolean>(() => {
    return RubikGroupAlgebra.isIdentity(this.cubeState());
  });

  readonly isSolvable = computed<boolean>(() => {
    return this.orbitValidation().isValidOrbit;
  });

  /**
   * Permutation transformation analysis for the last applied move.
   */
  readonly analysis = computed<MoveAnalysis | null>(() => {
    const last = this.lastMove();
    if (!last || last === 'e (Identity)') return null;
    return RubikGroupAlgebra.analyzeTransformation(
      this.previousState(),
      this.cubeState(),
      last
    );
  });

  /**
   * Orbit of the currently selected piece under active subgroup generators:
   * Orb_H(x) = { h * x | h in H }
   */
  readonly orbitPieces = computed<{ type: 'corner' | 'edge'; id: number }[]>(() => {
    const pType = this.selectedPieceType();
    const pId = this.selectedPieceId();
    const subgroupId = this.activeSubgroupId();
    const activeSubgroup =
      SUBGROUP_PRESETS.find((s: SubgroupPreset) => s.id === subgroupId) || SUBGROUP_PRESETS[0];

    const orbit = RubikGroupAlgebra.computeOrbit(pType, pId, activeSubgroup.generators);
    return orbit.orbitPositions.map((pos) => ({
      type: pType,
      id: pos,
    }));
  });

  /**
   * Name of the active selected piece (e.g. "UFL" or "UF").
   */
  readonly activePieceName = computed<string>(() => {
    return this.selectedPieceType() === 'corner'
      ? INITIAL_CORNERS[this.selectedPieceId()]?.name || 'UFL'
      : INITIAL_EDGES[this.selectedPieceId()]?.name || 'UF';
  });

  /**
   * Pure reactive 2D net unfolded layout computed directly from algebraic state.
   */
  readonly net2DFaces = computed<Net2DFaces>(() => {
    return RubikGroupAlgebra.compute2DNet(this.cubeState());
  });

  /**
   * Orbit solvability validator: verifies corner twist sum, edge flip sum, and parity.
   */
  readonly orbitValidation = computed<OrbitValidationResult>(() => {
    return RubikGroupAlgebra.validateSolutionOrbit(this.cubeState());
  });

  /**
   * Cauchy's Theorem Witness verification for the current lastMove (if valid algorithm).
   */
  readonly cauchyAnalysis = computed<CauchyTheoremWitness | null>(() => {
    const move = this.lastMove();
    if (!move || move === 'e (Identity)' || move.startsWith('Simulated') || move.startsWith('Scramble')) {
      return null;
    }
    return RubikGroupAlgebra.verifyCauchyTheorem(move);
  });

  // ==========================================
  // STATE MUTATING ACTIONS (PURE ALGEBRA)
  // ==========================================

  /**
   * Apply a standard move algebraically and emit animation event.
   */
  applyMove(move: StandardMove, onComplete?: () => void): void {
    const current = this.cubeState();
    const next = RubikGroupAlgebra.applyMove(current, move);

    this.previousState.set(current);
    this.cubeState.set(next);
    this.lastMove.set(move);
    this.moveHistory.update((h) => [...h, move]);
    this.redoHistory.set([]);

    const isSlice = move === 'M' || move === 'E' || move === 'S';
    this.soundService.playTurnSound(isSlice);

    const wasSolved = RubikGroupAlgebra.isIdentity(current);
    const isNowSolved = RubikGroupAlgebra.isIdentity(next);
    if (!wasSolved && isNowSolved) {
      this.soundService.playSolvedFanfare();
    }

    this.moveRequestSubject.next({ move, onComplete });
  }

  /**
   * Undo the last applied move by inverting it and storing it in redoHistory.
   */
  undoLastMove(): void {
    const history = this.moveHistory();
    if (history.length === 0) return;

    const last = history[history.length - 1];
    const invertedStr = RubikGroupAlgebra.invertAlgorithm(last);
    const invertedMoves = RubikGroupAlgebra.parseAlgorithm(invertedStr);

    if (invertedMoves.length === 1) {
      const invMove = invertedMoves[0];
      const current = this.cubeState();
      const next = RubikGroupAlgebra.applyMove(current, invMove);

      this.previousState.set(current);
      this.cubeState.set(next);
      this.lastMove.set(invMove);
      this.moveHistory.update((h) => h.slice(0, -1));
      this.redoHistory.update((r) => [last, ...r]);

      const isSlice = invMove === 'M' || invMove === 'E' || invMove === 'S';
      this.soundService.playTurnSound(isSlice);
      this.moveRequestSubject.next({ move: invMove });
    } else if (invertedMoves.length > 1) {
      const current = this.cubeState();
      const next = RubikGroupAlgebra.applyAlgorithm(current, invertedMoves);

      this.previousState.set(current);
      this.cubeState.set(next);
      this.lastMove.set(invertedStr);
      this.moveHistory.update((h) => h.slice(0, -1));
      this.redoHistory.update((r) => [last, ...r]);

      this.soundService.playTurnSound(false);
      this.algorithmRequestSubject.next({ moves: invertedMoves });
    }
  }

  /**
   * Redo the most recently undone move or algorithm.
   */
  redoLastMove(): void {
    const redo = this.redoHistory();
    if (redo.length === 0) return;

    const nextEntry = redo[0];
    const remainingRedo = redo.slice(1);
    const parsedMoves = RubikGroupAlgebra.parseAlgorithm(nextEntry);

    if (parsedMoves.length === 1) {
      this.applyMove(parsedMoves[0]);
      this.redoHistory.set(remainingRedo);
    } else if (parsedMoves.length > 1) {
      this.applyAlgorithm(nextEntry);
      this.redoHistory.set(remainingRedo);
    }
  }

  /**
   * Apply a sequence of moves (algorithm) algebraically and trigger animation.
   */
  applyAlgorithm(
    params: { algo: string; onComplete?: () => void } | string
  ): void {
    const algoStr = typeof params === 'string' ? params : params.algo;
    const onComplete = typeof params === 'string' ? undefined : params.onComplete;

    const moves = RubikGroupAlgebra.parseAlgorithm(algoStr);
    if (moves.length === 0) return;

    const current = this.cubeState();
    const next = RubikGroupAlgebra.applyAlgorithm(current, moves);

    this.previousState.set(current);
    this.cubeState.set(next);
    this.lastMove.set(algoStr);
    this.moveHistory.update((h) => [...h, algoStr]);
    this.redoHistory.set([]);

    this.algorithmRequestSubject.next({
      moves,
      onComplete,
    });
  }

  /**
   * Reset cube to solved identity state e in G.
   */
  reset(): void {
    const current = this.cubeState();
    const identity = RubikGroupAlgebra.createIdentityState();

    this.previousState.set(current);
    this.cubeState.set(identity);
    this.lastMove.set('e (Identity)');
    this.moveHistory.set([]);
    this.redoHistory.set([]);
    this.resetRequestSubject.next();
  }

  /**
   * Directly sets a custom physical CubeState (from physical piece input or 2D net painter).
   */
  setCustomCubeState(state: CubeState, label = 'Physical Cube Input'): void {
    const current = this.cubeState();
    this.previousState.set(current);
    this.cubeState.set(RubikGroupAlgebra.cloneState(state));
    this.lastMove.set(label);
    this.moveHistory.update((h) => [...h, label]);
    this.customStateRequestSubject.next(state);
  }

  /**
   * Sets up a practice situation on the cube starting cleanly from identity.
   * Resets 3D renderer to solved state, then applies the setup moves instantly.
   */
  setupPracticePosition(algoOrMoves: string | readonly StandardMove[], label = 'Practice Setup'): void {
    const moves = typeof algoOrMoves === 'string'
      ? RubikGroupAlgebra.parseAlgorithm(algoOrMoves)
      : [...algoOrMoves];
    const identity = RubikGroupAlgebra.createIdentityState();
    const nextState = RubikGroupAlgebra.applyAlgorithm(identity, moves);

    this.previousState.set(identity);
    this.cubeState.set(nextState);
    this.lastMove.set(label);
    this.moveHistory.set(moves);

    // Reset 3D renderer to identity, then apply the setup moves instantly
    this.resetRequestSubject.next();
    this.scrambleRequestSubject.next(moves);
  }

  /**
   * Solves a cube state (or current state) using human LBL / CFOP stages.
   */
  solveState(state: CubeState): SolveResult {
    return CubeSolver.solve(state);
  }

  solveCurrentCube(): SolveResult {
    return CubeSolver.solve(this.cubeState());
  }

  /**
   * Loads a custom physical cube state into the 3D model with physical mesh coordinates,
   * so that subsequent face turns animate smoothly.
   */
  loadCustomPhysicalCube(state: CubeState, solutionMoves: readonly StandardMove[], label = 'Моето кубче'): void {
    const scrambleMoves = RubikGroupAlgebra.invertAlgorithm(solutionMoves);
    this.setupPracticePosition(scrambleMoves, label);
  }

  toggle3DPaintMode(): void {
    this.is3DPaintMode.update((v) => !v);
  }

  set3DPaintMode(enabled: boolean): void {
    this.is3DPaintMode.set(enabled);
  }

  setActiveBrushColor(color: FaceName): void {
    this.activeBrushColor.set(color);
  }

  paintSticker(face: FaceName, row: number, col: number, colorOverride?: string): void {
    const brush = this.activeBrushColor();
    const color = colorOverride || FACE_COLORS[brush];

    this.customNet.update((net) => {
      const copy: Net2DFaces = {
        U: net.U.map((r) => r.map((c) => ({ ...c }))),
        D: net.D.map((r) => r.map((c) => ({ ...c }))),
        F: net.F.map((r) => r.map((c) => ({ ...c }))),
        B: net.B.map((r) => r.map((c) => ({ ...c }))),
        L: net.L.map((r) => r.map((c) => ({ ...c }))),
        R: net.R.map((r) => r.map((c) => ({ ...c }))),
      };

      if (copy[face]?.[row]?.[col]) {
        copy[face][row][col].color = color;
      }
      return copy;
    });

    // Broadcast both the updated net to 3D and notify listeners
    this.netSyncSubject.next(this.customNet());
    this.stickerPaintRequestSubject.next({ face, row, col, color });
  }

  setCustomNet(net: Net2DFaces): void {
    this.customNet.set(net);
    this.netSyncSubject.next(net);
  }

  /**
   * Updates all 9 stickers of a single face on the custom 2D net (e.g. from Webcam Scanner),
   * keeping the center (1, 1) locked to its canonical face color.
   */
  setFaceStickers(face: FaceName, colors: string[][]): void {
    this.customNet.update((net) => {
      const copy: Net2DFaces = {
        U: net.U.map((r) => r.map((c) => ({ ...c }))),
        D: net.D.map((r) => r.map((c) => ({ ...c }))),
        F: net.F.map((r) => r.map((c) => ({ ...c }))),
        B: net.B.map((r) => r.map((c) => ({ ...c }))),
        L: net.L.map((r) => r.map((c) => ({ ...c }))),
        R: net.R.map((r) => r.map((c) => ({ ...c }))),
      };

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 1) {
            copy[face][r][c].color = FACE_COLORS[face];
          } else if (colors[r]?.[c]) {
            copy[face][r][c].color = colors[r][c];
          }
        }
      }
      return copy;
    });

    this.netSyncSubject.next(this.customNet());
  }

  resetCustomNetToSolved(): void {
    const solvedNet = RubikGroupAlgebra.compute2DNet(RubikGroupAlgebra.createIdentityState());
    this.setCustomNet(solvedNet);
  }

  clearCustomNetToBlank(): void {
    const blankColor = '#334155';
    const net = this.customNet();
    const copy: Net2DFaces = {
      U: net.U.map((r) => r.map((c) => ({ ...c }))),
      D: net.D.map((r) => r.map((c) => ({ ...c }))),
      F: net.F.map((r) => r.map((c) => ({ ...c }))),
      B: net.B.map((r) => r.map((c) => ({ ...c }))),
      L: net.L.map((r) => r.map((c) => ({ ...c }))),
      R: net.R.map((r) => r.map((c) => ({ ...c }))),
    };

    for (const fn of FACE_NAMES) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (r !== 1 || c !== 1) {
            copy[fn][r][c].color = blankColor;
          }
        }
      }
    }
    this.setCustomNet(copy);
  }

  syncNetTo3D(net: Net2DFaces): void {
    this.customNet.set(net);
    this.netSyncSubject.next(net);
  }

  /**
   * Scramble the cube algebraically by applying random generator turns.
   */
  scramble(turnCount = 20): StandardMove[] {
    const faces: StandardMove[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scrambleMoves: StandardMove[] = [];

    for (let i = 0; i < turnCount; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      scrambleMoves.push(`${face}${mod}` as StandardMove);
    }

    const current = this.cubeState();
    let next = current;
    for (const m of scrambleMoves) {
      next = RubikGroupAlgebra.applyMove(next, m);
    }

    this.previousState.set(current);
    this.cubeState.set(next);
    this.lastMove.set(`Scramble (${turnCount} turns)`);
    this.moveHistory.set(scrambleMoves);
    this.scrambleRequestSubject.next(scrambleMoves);

    return scrambleMoves;
  }

  /**
   * Tamper with the cube state for Orbit / Coset Validation inspection.
   */
  tamperState(action: 'twist' | 'flip' | 'swap' | 'repair'): void {
    const current = this.cubeState();
    let next: CubeState;

    switch (action) {
      case 'twist':
        next = RubikGroupAlgebra.simulateCornerTwist(current, 0, 1);
        break;
      case 'flip':
        next = RubikGroupAlgebra.simulateEdgeFlip(current, 0);
        break;
      case 'swap':
        next = RubikGroupAlgebra.simulatePieceSwap(current);
        break;
      case 'repair':
        next = RubikGroupAlgebra.repairToValidOrbit(current);
        break;
    }

    this.previousState.set(current);
    this.cubeState.set(next);
    this.lastMove.set(`Simulated ${action}`);
    this.tamperRequestSubject.next(action);
  }

  // ==========================================
  // INTERACTION DISPATCHERS
  // ==========================================

  setSelectedPiece(type: 'corner' | 'edge', id: number): void {
    this.selectedPieceType.set(type);
    this.selectedPieceId.set(id);
  }

  setActiveSubgroup(id: string): void {
    this.activeSubgroupId.set(id);
  }

  setActiveTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  setActivePage(page: AppPage): void {
    this.activePage.set(page);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('rubik_view_mode', mode);
      } catch {}
    }
  }

  setExplodeFactor(val: number): void {
    this.explodeFactor.set(val);
  }

  setAnimSpeed(val: number): void {
    this.animSpeed.set(val);
  }

  setShowCycleArrows(show: boolean): void {
    this.showCycleArrows.set(show);
  }

  setIsAnimating(animating: boolean): void {
    this.isAnimating.set(animating);
  }

  openTheory(): void {
    this.isTheoryOpen.set(true);
  }

  closeTheory(): void {
    this.isTheoryOpen.set(false);
  }

  openTour(): void {
    this.isTourOpen.set(true);
  }

  closeTour(): void {
    this.isTourOpen.set(false);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('rubik_tour_seen', 'true');
      } catch {}
    }
  }

  // ==========================================
  // STATE SERIALIZATION & URL SHARING
  // ==========================================

  /**
   * Serializes current cube state into a compact 54-character string of face names (U, D, F, B, L, R).
   * Order: U (9), D (9), F (9), B (9), L (9), R (9).
   */
  get54FaceletString(state: CubeState = this.cubeState()): string {
    const net = RubikGroupAlgebra.compute2DNet(state);
    let result = '';

    const colorToFace = (color: string): FaceName => {
      const col = color.toLowerCase();
      for (const fn of FACE_NAMES) {
        if (FACE_COLORS[fn].toLowerCase() === col) return fn;
      }
      return 'U';
    };

    for (const fn of FACE_NAMES) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const stickerColor = net[fn][r][c].color;
          result += colorToFace(stickerColor);
        }
      }
    }
    return result;
  }

  /**
   * Reconstructs 2D Net from a 54-character facelet string.
   */
  parse54FaceletString(str: string): Net2DFaces | null {
    if (!str || str.length !== 54) return null;
    const clean = str.toUpperCase().trim();
    const validLetters = new Set(['U', 'D', 'F', 'B', 'L', 'R']);
    for (const ch of clean) {
      if (!validLetters.has(ch)) return null;
    }

    const net = RubikGroupAlgebra.compute2DNet(RubikGroupAlgebra.createIdentityState());
    let idx = 0;
    for (const fn of FACE_NAMES) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const faceLetter = clean[idx++] as FaceName;
          net[fn][r][c].color = FACE_COLORS[faceLetter];
        }
      }
    }
    return net;
  }

  /**
   * Generates a complete shareable URL containing the current cube state.
   */
  getShareUrl(): string {
    if (typeof window === 'undefined') return '';
    try {
      const url = new URL(window.location.href);
      const stateStr = this.get54FaceletString();
      url.searchParams.set('state', stateStr);

      const history = this.moveHistory();
      if (history.length > 0) {
        const cleanMoves: string[] = [];
        for (const item of history) {
          const parsed = RubikGroupAlgebra.parseAlgorithm(item);
          cleanMoves.push(...parsed);
        }
        if (cleanMoves.length > 0) {
          url.searchParams.set('moves', cleanMoves.join('_'));
        }
      }
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Loads state from query parameters if present in the given URL (or current location).
   */
  loadStateFromUrl(urlStr?: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const url = new URL(urlStr || window.location.href);
      const movesParam = url.searchParams.get('moves');
      const stateParam = url.searchParams.get('state');

      // 1. Try loading via move sequence if provided
      if (movesParam) {
        const moves = RubikGroupAlgebra.parseAlgorithm(movesParam.replace(/_/g, ' '));
        if (moves.length > 0) {
          this.setupPracticePosition(moves, 'Споделено разбъркване');
          return true;
        }
      }

      // 2. Try loading via 54-facelet representation
      if (stateParam && stateParam.length === 54) {
        const net = this.parse54FaceletString(stateParam);
        if (net) {
          const recon = RubikGroupAlgebra.reconstructFrom2DNet(net);
          if (recon.success && recon.state) {
            if (recon.orbitValidation?.isValidOrbit) {
              const sol = CubeSolver.solve(recon.state);
              this.loadCustomPhysicalCube(recon.state, sol.allMoves, 'Споделено кубче');
            } else {
              this.setCustomNet(net);
              this.setCustomCubeState(recon.state, 'Споделено кубче');
            }
            return true;
          }
        }
      }
    } catch {
      return false;
    }
    return false;
  }
}
