import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CubeStateService } from '../../../services/cube-state.service';
import { LanguageService } from '../../../services/language.service';
import { RubikGroupAlgebra } from '../../../math/group-algebra';
import { SolveResult, SolverStage } from '../../../math/cube-solver';
import { StandardMove } from '../../../types/cube';

@Component({
  selector: 'app-solve-modal',
  imports: [RouterLink],
  templateUrl: './solve-modal.component.html',
  styleUrl: './solve-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolveModalComponent {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input.required<boolean>();
  readonly close = output<void>();
  readonly scramble = output<void>();

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly isSolved = this.cubeStateService.isSolved;

  readonly solveResult = signal<SolveResult | null>(null);
  readonly activeSolveStageIndex = signal<number>(0);
  readonly currentSolveMoveIndex = signal<number>(0);
  readonly isSolveAutoPlaying = signal<boolean>(false);
  readonly solvePlaybackSpeed = signal<number>(1);
  readonly speeds = [0.5, 1, 1.5, 2] as const;

  private solveAutoPlayTimer: ReturnType<typeof setTimeout> | null = null;

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
    effect(() => {
      if (this.isOpen()) {
        untracked(() => {
          const result = this.cubeStateService.solveCurrentCube();
          this.solveResult.set(result);
          this.activeSolveStageIndex.set(0);
          this.currentSolveMoveIndex.set(0);
        });
      } else {
        untracked(() => this.stopSolveAutoPlay());
      }
    });

    this.destroyRef.onDestroy(() => this.stopSolveAutoPlay());
  }

  onClose(): void {
    this.stopSolveAutoPlay();
    this.close.emit();
  }

  onScrambleAndClose(): void {
    this.scramble.emit();
    this.onClose();
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
    this.syncStageWithMoveIndex(res, idx + 1);
  }

  stepBackwardSolve(): void {
    const res = this.solveResult();
    if (!res) return;
    const idx = this.currentSolveMoveIndex();
    if (idx <= 0) return;

    const prevMove = res.allMoves[idx - 1];
    const inverted = RubikGroupAlgebra.invertAlgorithm(prevMove).split(' ')[0] as StandardMove;
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
      const nextIdx = this.currentSolveMoveIndex() + 1;
      this.currentSolveMoveIndex.set(nextIdx);
      this.syncStageWithMoveIndex(res, nextIdx);

      if (nextIdx >= res.allMoves.length) {
        this.stopSolveAutoPlay();
        return;
      }

      const delay = Math.max(150, Math.round(500 / this.solvePlaybackSpeed()));
      this.solveAutoPlayTimer = setTimeout(() => {
        this.executeNextSolveAutoPlayMove();
      }, delay);
    });
  }

  private syncStageWithMoveIndex(res: SolveResult, moveIdx: number): void {
    let countSoFar = 0;
    for (let i = 0; i < res.stages.length; i++) {
      countSoFar += res.stages[i].moves.length;
      if (moveIdx >= countSoFar && i + 1 < res.stages.length) {
        this.activeSolveStageIndex.set(i + 1);
      }
    }
  }

  stopSolveAutoPlay(): void {
    this.isSolveAutoPlaying.set(false);
    if (this.solveAutoPlayTimer !== null) {
      clearTimeout(this.solveAutoPlayTimer);
      this.solveAutoPlayTimer = null;
    }
  }

  setSolvePlaybackSpeed(speed: number): void {
    this.solvePlaybackSpeed.set(speed);
  }
}

