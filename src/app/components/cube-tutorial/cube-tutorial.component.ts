import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { CubeStateService } from '../../services/cube-state.service';
import {
  TUTORIAL_STEPS,
  TutorialStep,
  TutorialCase,
  RubikGroupAlgebra,
} from '../../math/group-algebra';
import { CubeSolver, type SolveResult, type SolverStage } from '../../math/cube-solver';
import { StandardMove } from '../../types/cube';

export interface NotationGuideItem {
  code: StandardMove;
  nameBg: string;
  nameEn: string;
  descBg: string;
  descEn: string;
  badge: string;
}

@Component({
  selector: 'app-cube-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cube-tutorial.component.html',
  styleUrl: './cube-tutorial.component.css',
})
export class CubeTutorialComponent implements OnDestroy {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);

  readonly language = this.languageService.language;
  readonly t = this.languageService.t;
  readonly isAnimating = this.cubeStateService.isAnimating;

  readonly steps = TUTORIAL_STEPS;
  readonly currentStepIndex = signal<number>(0);
  readonly selectedCaseIndex = signal<number>(0);
  readonly currentMoveIndex = signal<number>(0);

  readonly isStepExecuting = signal<boolean>(false);
  readonly completedSteps = signal<Set<number>>(new Set());
  readonly showMathNote = signal<boolean>(false);

  // Advanced learning tools
  readonly isAutoPlaying = signal<boolean>(false);
  readonly playbackSpeed = signal<number>(1);
  readonly isPracticeMode = signal<boolean>(false);
  readonly showNotationGuide = signal<boolean>(false);
  readonly showSolver = signal<boolean>(false);
  readonly solveResult = signal<SolveResult | null>(null);
  readonly practiceFeedback = signal<{ success: boolean; message: string } | null>(null);

  private autoPlayTimer: any = null;

  // Notation reference catalog for Rubik's cube Singmaster notation
  readonly notationList: NotationGuideItem[] = [
    {
      code: 'R',
      nameBg: 'Дясна страна (Right)',
      nameEn: 'Right Face',
      descBg: 'Завъртане на дясната страна по часовниковата стрелка на 90° (нагоре).',
      descEn: 'Clockwise 90° rotation of the right layer (upwards).',
      badge: 'R',
    },
    {
      code: "R'",
      nameBg: 'Дясна обратна (R Prime)',
      nameEn: 'Right Inverted (Prime)',
      descBg: 'Завъртане на дясната страна обратно на часовниковата стрелка (надолу).',
      descEn: 'Counter-clockwise 90° rotation of the right layer (downwards).',
      badge: "R'",
    },
    {
      code: 'U',
      nameBg: 'Горна страна (Up)',
      nameEn: 'Up Face',
      descBg: 'Завъртане на горната страна по часовниковата стрелка (наляво).',
      descEn: 'Clockwise 90° rotation of top layer (leftwards).',
      badge: 'U',
    },
    {
      code: "U'",
      nameBg: 'Горна обратна (U Prime)',
      nameEn: 'Up Inverted (Prime)',
      descBg: 'Завъртане на горната страна обратно на часовника (надясно).',
      descEn: 'Counter-clockwise 90° rotation of top layer (rightwards).',
      badge: "U'",
    },
    {
      code: 'F',
      nameBg: 'Предна страна (Front)',
      nameEn: 'Front Face',
      descBg: 'Завъртане на лицевата страна по посока на часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of front face facing you.',
      badge: 'F',
    },
    {
      code: "F'",
      nameBg: 'Предна обратна (F Prime)',
      nameEn: 'Front Inverted (Prime)',
      descBg: 'Завъртане на лицевата страна обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of front face.',
      badge: "F'",
    },
    {
      code: 'L',
      nameBg: 'Лява страна (Left)',
      nameEn: 'Left Face',
      descBg: 'Завъртане на лявата страна по часовниковата стрелка (надолу).',
      descEn: 'Clockwise 90° rotation of the left layer (downwards).',
      badge: 'L',
    },
    {
      code: "L'",
      nameBg: 'Лява обратна (L Prime)',
      nameEn: 'Left Inverted (Prime)',
      descBg: 'Завъртане на лявата страна обратно на часовника (нагоре).',
      descEn: 'Counter-clockwise 90° rotation of the left layer (upwards).',
      badge: "L'",
    },
    {
      code: 'D',
      nameBg: 'Долна страна (Down)',
      nameEn: 'Down Face',
      descBg: 'Завъртане на долната основа по часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of bottom layer.',
      badge: 'D',
    },
    {
      code: "D'",
      nameBg: 'Долна обратна (D Prime)',
      nameEn: 'Down Inverted (Prime)',
      descBg: 'Завъртане на долната основа обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of bottom layer.',
      badge: "D'",
    },
    {
      code: 'B',
      nameBg: 'Задна страна (Back)',
      nameEn: 'Back Face',
      descBg: 'Завъртане на задната страна по часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of back layer.',
      badge: 'B',
    },
    {
      code: "B'",
      nameBg: 'Задна обратна (B Prime)',
      nameEn: 'Back Inverted (Prime)',
      descBg: 'Завъртане на задната страна обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of back layer.',
      badge: "B'",
    },
    {
      code: 'U2',
      nameBg: 'Горна двойна (U2)',
      nameEn: 'Up Double Turn (180°)',
      descBg: 'Завъртане на горния слой на 180 градуса (2 пъти U).',
      descEn: 'Half-turn 180° rotation of top face.',
      badge: 'U2',
    },
    {
      code: 'R2',
      nameBg: 'Дясна двойна (R2)',
      nameEn: 'Right Double Turn (180°)',
      descBg: 'Завъртане на десния слой на 180 градуса (2 пъти R).',
      descEn: 'Half-turn 180° rotation of right face.',
      badge: 'R2',
    },
    {
      code: 'F2',
      nameBg: 'Предна двойна (F2)',
      nameEn: 'Front Double Turn (180°)',
      descBg: 'Завъртане на предния слой на 180 градуса (2 пъти F).',
      descEn: 'Half-turn 180° rotation of front face.',
      badge: 'F2',
    },
  ];

  // Quick move buttons for interactive manual practice
  readonly manualMoveKeys: StandardMove[] = [
    'R', "R'", 'U', "U'", 'F', "F'", 'L', "L'", 'D', "D'", 'B', "B'", 'R2', 'U2', 'F2',
  ];

  get isBg(): boolean {
    return this.language() === 'bg';
  }

  readonly currentStep = computed<TutorialStep>(() => {
    return this.steps[this.currentStepIndex()] || this.steps[0];
  });

  readonly currentCase = computed<TutorialCase | null>(() => {
    const cases = this.currentStep().cases;
    if (!cases || cases.length === 0) return null;
    return cases[this.selectedCaseIndex()] || cases[0];
  });

  readonly activeAlgorithm = computed<string>(() => {
    const activeCase = this.currentCase();
    return activeCase ? activeCase.algorithm : this.currentStep().algorithm;
  });

  readonly currentStepMoves = computed<StandardMove[]>(() => {
    return this.activeAlgorithm()
      .split(' ')
      .filter(Boolean) as StandardMove[];
  });

  readonly progressPercent = computed<number>(() => {
    return Math.round(((this.currentStepIndex() + 1) / this.steps.length) * 100);
  });

  readonly isStepCompleted = computed<boolean>(() => {
    return this.currentMoveIndex() >= this.currentStepMoves().length && this.currentStepMoves().length > 0;
  });

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.stopAutoPlay();
      this.currentStepIndex.update((i) => i - 1);
      this.selectedCaseIndex.set(0);
      this.currentMoveIndex.set(0);
      this.showMathNote.set(false);
      this.practiceFeedback.set(null);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.stopAutoPlay();
      this.currentStepIndex.update((i) => i + 1);
      this.selectedCaseIndex.set(0);
      this.currentMoveIndex.set(0);
      this.showMathNote.set(false);
      this.practiceFeedback.set(null);
    }
  }

  selectStep(index: number): void {
    this.stopAutoPlay();
    this.currentStepIndex.set(index);
    this.selectedCaseIndex.set(0);
    this.currentMoveIndex.set(0);
    this.showMathNote.set(false);
    this.practiceFeedback.set(null);
  }

  selectCase(index: number): void {
    this.stopAutoPlay();
    this.selectedCaseIndex.set(index);
    this.currentMoveIndex.set(0);
    this.practiceFeedback.set(null);
  }

  toggleMathNote(): void {
    this.showMathNote.update((v) => !v);
  }

  toggleNotationGuide(): void {
    this.showNotationGuide.update((v) => !v);
  }

  togglePracticeMode(): void {
    this.isPracticeMode.update((v) => !v);
    this.practiceFeedback.set(null);
  }

  toggleSolver(): void {
    if (this.showSolver()) {
      this.showSolver.set(false);
      return;
    }
    const res = this.cubeStateService.solveCurrentCube();
    this.solveResult.set(res);
    this.showSolver.set(true);
  }

  jumpToStage(stageNumber: number): void {
    this.showSolver.set(false);
    this.selectStep(stageNumber - 1);
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed.set(speed);
  }

  /**
   * Set up the exact practice position on the 3D cube for the selected case/step.
   * Resets 3D cube and physically applies the setup moves instantly.
   */
  setupPracticeCase(): void {
    this.stopAutoPlay();
    const curCase = this.currentCase();
    const curStep = this.currentStep();

    // Priority: case setupMoves -> step setupAlgorithm -> algebraic inverse of algorithm
    const setupSeq =
      curCase?.setupMoves ||
      curStep.setupAlgorithm ||
      RubikGroupAlgebra.invertAlgorithm(this.activeAlgorithm());

    const label = this.isBg
      ? `Позиция: ${curCase ? curCase.nameBg : curStep.titleBg}`
      : `Setup: ${curCase ? curCase.name : curStep.title}`;

    this.cubeStateService.setupPracticePosition(setupSeq, label);
    this.currentMoveIndex.set(0);

    this.practiceFeedback.set({
      success: true,
      message: this.isBg
        ? '🎯 Позицията за упражнение е заредена на 3D куба! Натиснете "Следващ ход" (⏭️) или пуснете авто-плей (▶️).'
        : '🎯 Practice position loaded on 3D cube! Click "Next Move" (⏭️) or play auto-play (▶️).',
    });
  }

  /**
   * Execute the next single move in the step's algorithm sequence.
   */
  executeNextMove(): void {
    if (this.isAnimating()) return;
    const moves = this.currentStepMoves();
    const curIdx = this.currentMoveIndex();

    if (curIdx >= moves.length) {
      this.practiceFeedback.set({
        success: true,
        message: this.isBg
          ? '🎉 Всички ходове за тази ситуация са изпълнени!'
          : '🎉 All moves for this case have been executed!',
      });
      return;
    }

    const move = moves[curIdx];
    this.cubeStateService.applyMove(move, () => {
      const nextIdx = curIdx + 1;
      this.currentMoveIndex.set(nextIdx);

      if (nextIdx >= moves.length) {
        this.completedSteps.update((set) => {
          const next = new Set(set);
          next.add(this.currentStepIndex());
          return next;
        });

        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? '✨ Браво! Алгоритъмът беше завършен успешно. Натиснете "Следваща стъпка"!'
            : '✨ Great job! Algorithm completed successfully. Proceed to next step!',
        });
      }
    });
  }

  /**
   * Undo/revert the previous move in the sequence.
   */
  executePrevMove(): void {
    if (this.isAnimating()) return;
    const curIdx = this.currentMoveIndex();
    if (curIdx <= 0) return;

    const moves = this.currentStepMoves();
    const move = moves[curIdx - 1];
    const invertedMove = RubikGroupAlgebra.invertAlgorithm(move) as StandardMove;

    this.cubeStateService.applyMove(invertedMove, () => {
      this.currentMoveIndex.update((i) => Math.max(0, i - 1));
      this.practiceFeedback.set(null);
    });
  }

  /**
   * Toggle auto-play through the algorithm.
   */
  toggleAutoPlay(): void {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.currentMoveIndex() >= this.currentStepMoves().length) {
      this.setupPracticeCase();
      setTimeout(() => this.runAutoPlayStep(), 350);
    } else {
      this.runAutoPlayStep();
    }
    this.isAutoPlaying.set(true);
  }

  private runAutoPlayStep(): void {
    if (!this.isAutoPlaying()) return;

    if (this.currentMoveIndex() >= this.currentStepMoves().length) {
      this.stopAutoPlay();
      return;
    }

    const moves = this.currentStepMoves();
    const move = moves[this.currentMoveIndex()];

    this.cubeStateService.applyMove(move, () => {
      const nextIdx = this.currentMoveIndex() + 1;
      this.currentMoveIndex.set(nextIdx);

      if (nextIdx >= moves.length) {
        this.completedSteps.update((set) => new Set(set).add(this.currentStepIndex()));
        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? '✨ Алгоритъмът завърши с успех!'
            : '✨ Algorithm finished successfully!',
        });
        this.stopAutoPlay();
      } else if (this.isAutoPlaying()) {
        const delay = Math.round(550 / this.playbackSpeed());
        this.autoPlayTimer = setTimeout(() => {
          this.runAutoPlayStep();
        }, delay);
      }
    });
  }

  stopAutoPlay(): void {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  /**
   * Execute entire algorithm at once with 3D animation.
   */
  onExecuteAlgorithm(): void {
    const stepIdx = this.currentStepIndex();
    const algo = this.activeAlgorithm();
    this.isStepExecuting.set(true);
    this.stopAutoPlay();

    this.cubeStateService.applyAlgorithm({
      algo,
      onComplete: () => {
        this.isStepExecuting.set(false);
        this.currentMoveIndex.set(this.currentStepMoves().length);
        this.completedSteps.update((set) => {
          const next = new Set(set);
          next.add(stepIdx);
          return next;
        });
        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? 'Алгоритъмът беше приложен напълно върху 3D куба!'
            : 'Algorithm executed completely on the 3D cube!',
        });
      },
    });
  }

  /**
   * Handle user clicking a manual move button in "Опитай сам" mode.
   */
  onManualMove(move: StandardMove): void {
    if (this.isAnimating()) return;

    const moves = this.currentStepMoves();
    const expectedMove = moves[this.currentMoveIndex()];

    this.cubeStateService.applyMove(move, () => {
      if (move === expectedMove) {
        const nextIdx = this.currentMoveIndex() + 1;
        this.currentMoveIndex.set(nextIdx);

        if (nextIdx >= moves.length) {
          this.completedSteps.update((set) => new Set(set).add(this.currentStepIndex()));
          this.practiceFeedback.set({
            success: true,
            message: this.isBg
              ? '🎉 БРАВО! Изпълнихте целия алгоритъм самостоятелно без грешка!'
              : '🎉 AWESOME! You successfully executed the entire algorithm on your own!',
          });
        } else {
          this.practiceFeedback.set({
            success: true,
            message: this.isBg
              ? `✓ Верен ход ${move}! Следващ ход: ${moves[nextIdx]}`
              : `✓ Correct move ${move}! Next move: ${moves[nextIdx]}`,
          });
        }
      } else {
        this.practiceFeedback.set({
          success: false,
          message: this.isBg
            ? `⚠️ Натиснахте ${move}, а очакваният ход по алгоритъма беше ${expectedMove || 'друг'}. Можете да натиснете "⏮️ Отмени" или да презаредите позицията.`
            : `⚠️ You played ${move}, but expected move was ${expectedMove || 'different'}. Click "⏮️ Undo" or reload case.`,
        });
      }
    });
  }

  /**
   * Directly test a notation move from the Notation Guide.
   */
  testNotationMove(move: StandardMove): void {
    this.cubeStateService.applyMove(move);
  }

  onReset(): void {
    this.stopAutoPlay();
    this.currentMoveIndex.set(0);
    this.practiceFeedback.set(null);
    this.cubeStateService.reset();
  }
}
