import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TUTORIAL_STEPS, TutorialStep } from '../../math/rubikGroup';

@Component({
  selector: 'app-cube-tutorial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cube-tutorial.component.html',
})
export class CubeTutorialComponent {
  private languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  isAnimating = input<boolean>(false);

  applyAlgorithm = output<string>();
  reset = output<void>();

  readonly steps = TUTORIAL_STEPS;
  readonly currentStepIndex = signal<number>(0);

  get isBg(): boolean {
    return this.language() === 'bg';
  }

  readonly currentStep = computed<TutorialStep>(() => {
    return this.steps[this.currentStepIndex()] || this.steps[0];
  });

  readonly currentStepMoves = computed<string[]>(() => {
    return this.currentStep().algorithm.split(' ').filter(Boolean);
  });

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update((i) => i - 1);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update((i) => i + 1);
    }
  }

  onExecuteAlgorithm(): void {
    this.applyAlgorithm.emit(this.currentStep().algorithm);
  }
}
