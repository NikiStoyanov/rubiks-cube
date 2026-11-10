import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RubiksCube3D } from './3d/CubeRenderer';
import { FaceName, PieceType, StandardMove, ViewMode } from './types/cube';
import { FACE_COLORS, FACE_NAMES } from './math/group-algebra';
import { LanguageService } from './services/language.service';
import { CubeStateService } from './services/cube-state.service';
import { SoundService } from './services/sound.service';
import { ToastService } from './services/toast.service';
import { Controls3DComponent } from './components/cube/controls-3d/controls-3d.component';
import { Cube2DComponent } from './components/cube/cube-2d/cube-2d.component';
import { AlgebraHudComponent } from './components/cube/algebra-hud/algebra-hud.component';
import { TheoryGuideModalComponent } from './components/shared/theory-guide-modal/theory-guide-modal.component';
import { OnboardingTourComponent } from './components/shared/onboarding-tour/onboarding-tour.component';
import { SolveModalComponent } from './components/shared/solve-modal/solve-modal.component';
import { ShareModalComponent } from './components/shared/share-modal/share-modal.component';
import { ShortcutsModalComponent } from './components/shared/shortcuts-modal/shortcuts-modal.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Controls3DComponent,
    Cube2DComponent,
    AlgebraHudComponent,
    TheoryGuideModalComponent,
    OnboardingTourComponent,
    SolveModalComponent,
    ShareModalComponent,
    ShortcutsModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleGlobalKeyDown($event)',
  },
})
export class App implements AfterViewInit {
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  readonly cubeStateService = inject(CubeStateService);
  readonly soundService = inject(SoundService);
  readonly toastService = inject(ToastService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly toastMessage = this.toastService.message;

  readonly cubeContainerRef = viewChild<ElementRef<HTMLDivElement>>('cubeContainer');
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
  readonly isSolvable = this.cubeStateService.isSolvable;
  readonly activePieceName = this.cubeStateService.activePieceName;

  // Modal Visibility Signals
  readonly isSolveModalOpen = signal<boolean>(false);
  readonly isShortcutsModalOpen = signal<boolean>(false);
  readonly isShareModalOpen = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        const url = e.urlAfterRedirects;
        if (url.includes('validator')) {
          this.cubeStateService.setActivePage('validator');
        } else if (url.includes('tutorial')) {
          this.cubeStateService.setActivePage('tutorial');
        } else if (url.includes('math')) {
          this.cubeStateService.setActivePage('math');
        } else if (url.includes('custom')) {
          this.cubeStateService.setActivePage('custom');
        } else if (url.includes('timer')) {
          this.cubeStateService.setActivePage('timer');
        } else {
          this.cubeStateService.setActivePage('home');
        }
        this.updateHighlights();
      });

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

    if (typeof window !== 'undefined') {
      const loaded = this.cubeStateService.loadStateFromUrl();
      if (loaded) {
        setTimeout(() => {
          this.toastService.show(this.t().shareLoadedNotification);
        }, 500);
      }
    }

    this.destroyRef.onDestroy(() => {
      const renderer = this.cubeRenderer();
      if (renderer) {
        renderer.destroy();
        this.cubeRenderer.set(null);
      }
    });
  }

  ngAfterViewInit(): void {
    const container = this.cubeContainerRef()?.nativeElement;
    if (!container) return;

    this.ngZone.runOutsideAngular(() => {
      try {
        const renderer = new RubiksCube3D(container);
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

    this.cubeStateService.moveRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ move, onComplete }) => {
        this.animateSingleMove(move, onComplete);
      });

    this.cubeStateService.algorithmRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ moves, onComplete }) => {
        this.animateAlgorithmMoves(moves, onComplete);
      });

    this.cubeStateService.tamperRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => {
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
      });

    this.cubeStateService.resetRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.resetToIdentity();
          this.updateHighlights();
        }
      });

    this.cubeStateService.scrambleRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((moves) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          for (const m of moves) {
            renderer.applyMoveInstant(m);
          }
          this.updateHighlights();
        }
      });

    this.cubeStateService.customStateRequest$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.applyCustomState(state);
          this.updateHighlights();
        }
      });

    this.cubeStateService.netSync$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((net) => {
        const renderer = this.cubeRenderer();
        if (renderer) {
          renderer.applyNetColors(net);
        }
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

  private animateSingleMove(move: StandardMove, onComplete?: () => void): void {
    const renderer = this.cubeRenderer();
    if (!renderer) {
      onComplete?.();
      return;
    }

    this.cubeStateService.setIsAnimating(true);
    this.ngZone.runOutsideAngular(() => {
      renderer.animateMove(move, () => {
        this.ngZone.run(() => {
          this.cubeStateService.setIsAnimating(false);
          this.updateHighlights();
          onComplete?.();
        });
      });
    });
  }

  private animateAlgorithmMoves(moves: StandardMove[], onComplete?: () => void): void {
    const renderer = this.cubeRenderer();
    if (!renderer) {
      onComplete?.();
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
              onComplete?.();
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
    this.cubeRenderer()?.resetCamera();
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

  openSolveModal(): void {
    this.isSolveModalOpen.set(true);
  }

  closeSolveModal(): void {
    this.isSolveModalOpen.set(false);
  }

  toggleSound(): void {
    this.soundService.toggleMute();
  }

  openShortcutsModal(): void {
    this.isShortcutsModalOpen.set(true);
  }

  closeShortcutsModal(): void {
    this.isShortcutsModalOpen.set(false);
  }

  toggleShortcutsModal(): void {
    this.isShortcutsModalOpen.update((v) => !v);
  }

  openShareModal(): void {
    this.isShareModalOpen.set(true);
  }

  closeShareModal(): void {
    this.isShareModalOpen.set(false);
  }

  handleGlobalKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable)
    ) {
      return;
    }

    if (event.key === 'Escape') {
      if (this.isShareModalOpen()) {
        this.closeShareModal();
        return;
      }
      if (this.isShortcutsModalOpen()) {
        this.closeShortcutsModal();
        return;
      }
      if (this.isSolveModalOpen()) {
        this.closeSolveModal();
        return;
      }
      if (this.isTheoryOpen()) {
        this.cubeStateService.closeTheory();
        return;
      }
      if (this.isTourOpen()) {
        this.cubeStateService.closeTour();
        return;
      }
    }

    if (event.key === '?' || (event.shiftKey && event.key === '/')) {
      event.preventDefault();
      this.toggleShortcutsModal();
      return;
    }

    if (this.activePage() === 'timer' && (event.code === 'Space' || event.key === ' ')) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z')) {
      event.preventDefault();
      this.cubeStateService.undoLastMove();
      return;
    }

    if (!event.ctrlKey && !event.altKey && !event.metaKey) {
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        this.cubeStateService.undoLastMove();
        return;
      }

      const keyUpper = event.key.toUpperCase();
      const validFaces = ['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S'];
      if (validFaces.includes(keyUpper)) {
        event.preventDefault();
        const move = event.shiftKey ? `${keyUpper}'` : keyUpper;
        this.cubeStateService.applyMove(move as StandardMove);
      }
    }
  }
}
