import { Injectable, signal, computed } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {
  CubeState,
  StandardMove,
  MoveAnalysis,
  ViewMode,
  Net2DFaces,
  PieceType,
  AppPage,
  SubgroupPreset,
} from '../types/cube';
import {
  RubikGroupAlgebra,
  type OrbitValidationResult,
  type CauchyTheoremWitness,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  SUBGROUP_PRESETS,
} from '../math/group-algebra';

export type ActiveTab = 'orbit' | 'stabilizer' | 'cycles' | 'order' | 'subgroups';

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
  // ==========================================
  // CORE STATE SIGNALS
  // ==========================================
  readonly cubeState = signal<CubeState>(RubikGroupAlgebra.createIdentityState());
  readonly previousState = signal<CubeState>(RubikGroupAlgebra.createIdentityState());
  readonly lastMove = signal<string>('e (Identity)');
  readonly moveHistory = signal<string[]>([]);
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

  // ==========================================
  // REACTIVE COMPUTED SIGNALS (DERIVED STATE)
  // ==========================================

  /**
   * Evaluates if the current cube matches the solved state identity e in G.
   */
  readonly isSolved = computed<boolean>(() => {
    return RubikGroupAlgebra.isIdentity(this.cubeState());
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
  applyMove(move: StandardMove): void {
    const current = this.cubeState();
    const next = RubikGroupAlgebra.applyMove(current, move);

    this.previousState.set(current);
    this.cubeState.set(next);
    this.lastMove.set(move);
    this.moveHistory.update((h) => [...h, move]);

    this.moveRequestSubject.next({ move });
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
    this.resetRequestSubject.next();
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
}
