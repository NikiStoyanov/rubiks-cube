import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { CubeStateService } from '../../services/cube-state.service';
import { TUTORIAL_STEPS, TutorialStep } from '../../math/rubikGroup';

@Component({
  selector: 'app-cube-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cube-tutorial.component.html',
  styleUrl: './cube-tutorial.component.css',
})
export class CubeTutorialComponent {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);

  readonly language = this.languageService.language;
  readonly isAnimating = this.cubeStateService.isAnimating;

  readonly steps = TUTORIAL_STEPS;
  readonly currentStepIndex = signal<number>(0);

  // Interactive Guided Tour Mode state
  readonly isGuidedMode = signal<boolean>(true);
  readonly isStepExecuting = signal<boolean>(false);
  readonly completedSteps = signal<Set<number>>(new Set());
  readonly showMathNote = signal<boolean>(false);

  get isBg(): boolean {
    return this.language() === 'bg';
  }

  readonly currentStep = computed<TutorialStep>(() => {
    return this.steps[this.currentStepIndex()] || this.steps[0];
  });

  readonly currentStepMoves = computed<string[]>(() => {
    return this.currentStep().algorithm.split(' ').filter(Boolean);
  });

  readonly progressPercent = computed<number>(() => {
    return Math.round(((this.currentStepIndex() + 1) / this.steps.length) * 100);
  });

  startGuidedMode(index?: number): void {
    if (typeof index === 'number') {
      this.currentStepIndex.set(index);
    }
    this.isGuidedMode.set(true);
    this.showMathNote.set(false);
  }

  closeGuidedMode(): void {
    this.isGuidedMode.set(false);
  }

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update((i) => i - 1);
      this.showMathNote.set(false);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update((i) => i + 1);
      this.showMathNote.set(false);
    }
  }

  toggleMathNote(): void {
    this.showMathNote.update((v) => !v);
  }

  onExecuteAlgorithm(): void {
    const stepIdx = this.currentStepIndex();
    const algo = this.currentStep().algorithm;
    this.isStepExecuting.set(true);

    this.cubeStateService.applyAlgorithm({
      algo,
      onComplete: () => {
        this.isStepExecuting.set(false);
        this.completedSteps.update((set) => {
          const next = new Set(set);
          next.add(stepIdx);
          return next;
        });
      },
    });
  }

  onReset(): void {
    this.cubeStateService.reset();
  }
}
