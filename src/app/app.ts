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
import { RubiksCube3D } from './3d/CubeRenderer';
import { 
  createInitialCubeState, 
  createDefault2DNet,
  analyzeTransformation, 
  computeOrbit, 
  SUBGROUP_PRESETS,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  isStateIdentity,
  parseAlgorithm,
  applyMove
} from './math/rubikGroup';
import { CubeState, StandardMove, MoveAnalysis, ViewMode, Net2DFaces, PieceType, AppPage } from './types/cube';
import { LanguageService } from './services/language.service';
import { Controls3DComponent } from './components/cube/controls-3d/controls-3d.component';
import { Cube2DComponent } from './components/cube/cube-2d/cube-2d.component';
import { MathConceptsComponent, ActiveTab } from './components/math-concepts/math-concepts.component';
import { TheoryGuideModalComponent } from './components/shared/theory-guide-modal/theory-guide-modal.component';
import { OrbitValidatorComponent } from './components/orbit-validator/orbit-validator.component';
import { CubeTutorialComponent } from './components/cube-tutorial/cube-tutorial.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Controls3DComponent,
    Cube2DComponent,
    MathConceptsComponent,
    TheoryGuideModalComponent,
    OrbitValidatorComponent,
    CubeTutorialComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  private ngZone = inject(NgZone);
  private languageService = inject(LanguageService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  @ViewChild('cubeContainer') cubeContainerRef!: ElementRef<HTMLDivElement>;
  readonly cubeRenderer = signal<RubiksCube3D | null>(null);

  // Core Cube State
  readonly cubeState = signal<CubeState>(createInitialCubeState());
  readonly previousState = signal<CubeState>(createInitialCubeState());
  readonly lastMove = signal<string>('');

  // Interaction State
  readonly selectedPieceType = signal<'corner' | 'edge'>('corner');
  readonly selectedPieceId = signal<number>(0);
  readonly activeSubgroupId = signal<string>('full');
  readonly activeTab = signal<ActiveTab>('orbit');

  // Navigation Page
  readonly activePage = signal<AppPage>('math');

  // Visual & View Mode Settings
  readonly viewMode = signal<ViewMode>(
    (typeof localStorage !== 'undefined' && (localStorage.getItem('rubik_view_mode') as ViewMode)) || '3d'
  );
  readonly net2DFaces = signal<Net2DFaces>(createDefault2DNet());
  readonly explodeFactor = signal<number>(0);
  readonly animSpeed = signal<number>(0.22);
  readonly showCycleArrows = signal<boolean>(true);
  readonly isAnimating = signal<boolean>(false);
  readonly isTheoryOpen = signal<boolean>(false);

  // Derived state
  readonly orbitPieces = computed<{ type: 'corner' | 'edge'; id: number }[]>(() => {
    const pType = this.selectedPieceType();
    const pId = this.selectedPieceId();
    const subgroupId = this.activeSubgroupId();
    const activeSubgroup =
      SUBGROUP_PRESETS.find((s) => s.id === subgroupId) || SUBGROUP_PRESETS[0];

    const orbit = computeOrbit(pType, pId, activeSubgroup.generators);
    return orbit.orbitPositions.map((pos) => ({
      type: pType,
      id: pos,
    }));
  });

  readonly analysis = computed<MoveAnalysis | null>(() => {
    return analyzeTransformation(this.previousState(), this.cubeState(), this.lastMove());
  });

  readonly isSolved = computed<boolean>(() => {
    return isStateIdentity(this.cubeState(), createInitialCubeState());
  });

  readonly activePieceName = computed<string>(() => {
    return this.selectedPieceType() === 'corner'
      ? INITIAL_CORNERS[this.selectedPieceId()]?.name || 'UFL'
      : INITIAL_EDGES[this.selectedPieceId()]?.name || 'UF';
  });

  constructor() {
    // Reactive sync for 3D Highlights
    effect(() => {
      // Register all signal dependencies
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
    this.viewMode.set(mode);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('rubik_view_mode', mode);
      } catch {}
    }
  }

  update2DNet(): void {
    const renderer = this.cubeRenderer();
    if (renderer) {
      this.net2DFaces.set(renderer.get2DNet());
    }
  }

  handlePieceClick(type: PieceType, id: number): void {
    if (this.activePage() !== 'math') return;
    if (type === 'corner' || type === 'edge') {
      this.selectedPieceType.set(type);
      this.selectedPieceId.set(id);
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
            this.selectedPieceType.set(pieceType);
            this.selectedPieceId.set(pieceId);
            this.updateHighlights();
          });
        };

        this.ngZone.run(() => {
          this.cubeRenderer.set(renderer);
          this.updateHighlights();
          this.update2DNet();
        });
      } catch (err) {
        console.warn('WebGL context unavailable or not supported:', err);
      }
    });
  }

  ngOnDestroy(): void {
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.destroy();
      this.cubeRenderer.set(null);
    }
  }

  handleApplyMove(move: StandardMove): void {
    const renderer = this.cubeRenderer();
    if (!renderer) return;

    this.isAnimating.set(true);
    this.previousState.set(this.cubeState());
    this.lastMove.set(move);

    this.ngZone.runOutsideAngular(() => {
      renderer.animateMove(move, () => {
        this.ngZone.run(() => {
          const nextState = renderer.getCubeState();
          this.cubeState.set(nextState);
          this.isAnimating.set(false);
          this.updateHighlights();
          this.update2DNet();
        });
      });
    });
  }

  handleApplyAlgorithm(params: { algo: string; onComplete?: () => void } | string): void {
    const algoStr = typeof params === 'string' ? params : params.algo;
    const onComplete = typeof params === 'string' ? undefined : params.onComplete;

    const moves = parseAlgorithm(algoStr);
    if (moves.length === 0) return;

    const renderer = this.cubeRenderer();
    if (!renderer) return;

    this.isAnimating.set(true);
    this.previousState.set(this.cubeState());
    this.lastMove.set(algoStr);

    let completedCount = 0;
    this.ngZone.runOutsideAngular(() => {
      moves.forEach((m) => {
        renderer.animateMove(m, () => {
          completedCount++;
          if (completedCount === moves.length) {
            this.ngZone.run(() => {
              const nextState = renderer.getCubeState();
              this.cubeState.set(nextState);
              this.isAnimating.set(false);
              this.updateHighlights();
              this.update2DNet();
              if (onComplete) onComplete();
            });
          }
        });
      });
    });
  }

  handleReset(): void {
    const renderer = this.cubeRenderer();
    if (!renderer) return;

    renderer.resetToIdentity();
    const initial = renderer.getCubeState();
    this.previousState.set(this.cubeState());
    this.cubeState.set(initial);
    this.lastMove.set('e (Identity)');
    this.updateHighlights();
    this.update2DNet();
  }

  handleScramble(): void {
    const renderer = this.cubeRenderer();
    if (!renderer) return;

    const faces: StandardMove[] = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scrambleMoves: StandardMove[] = [];

    for (let i = 0; i < 20; i++) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      scrambleMoves.push(`${face}${mod}` as StandardMove);
    }

    this.previousState.set(this.cubeState());
    for (const m of scrambleMoves) {
      renderer.applyMoveInstant(m);
    }
    const nextState = renderer.getCubeState();
    this.cubeState.set(nextState);
    this.lastMove.set('Scramble (20 turns)');
    this.updateHighlights();
    this.update2DNet();
  }

  handleExplodeChange(val: number): void {
    this.explodeFactor.set(val);
    const renderer = this.cubeRenderer();
    if (renderer) {
      renderer.setExplode(val);
      this.updateHighlights();
    }
  }

  handleSpeedChange(val: number): void {
    this.animSpeed.set(val);
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

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
  }

  setActiveTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    this.updateHighlights();
  }

  setSelectedPiece(event: { type: 'corner' | 'edge'; id: number }): void {
    this.selectedPieceType.set(event.type);
    this.selectedPieceId.set(event.id);
    this.updateHighlights();
  }

  setActiveSubgroup(id: string): void {
    this.activeSubgroupId.set(id);
    this.updateHighlights();
  }

  setShowCycleArrows(show: boolean): void {
    this.showCycleArrows.set(show);
    this.updateHighlights();
  }

  setActivePage(page: AppPage): void {
    this.activePage.set(page);
    this.updateHighlights();
  }

  handleOrbitStateChange(event: { state: CubeState; action: 'twist' | 'flip' | 'swap' | 'repair' }): void {
    this.cubeState.set(event.state);
    const renderer = this.cubeRenderer();
    if (renderer) {
      if (event.action === 'twist') {
        renderer.twistCornerMesh(0, 1);
      } else if (event.action === 'flip') {
        renderer.flipEdgeMesh(0);
      } else if (event.action === 'swap') {
        renderer.swapPiecesMesh('corner', 0, 1);
      } else if (event.action === 'repair' || isStateIdentity(event.state)) {
        renderer.resetToIdentity();
      }
    }
    this.lastMove.set(event.action ? `Simulated ${event.action}` : 'Custom Orbit');
    this.updateHighlights();
    this.update2DNet();
  }

  openTheory(): void {
    this.isTheoryOpen.set(true);
  }

  closeTheory(): void {
    this.isTheoryOpen.set(false);
  }
}
