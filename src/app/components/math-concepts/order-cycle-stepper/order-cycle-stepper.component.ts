import { Component, inject, input, output, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { computeElementOrder } from '../../../math/rubikGroup';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-order-cycle-stepper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-cycle-stepper.component.html',
})
export class OrderCycleStepperComponent implements OnDestroy {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  isSolved = input<boolean>(true);
  isAnimating = input<boolean>(false);

  applyAlgorithm = output<{ algo: string; onComplete?: () => void }>();

  readonly selectedAlgo = signal<string>("R U R' U'");
  readonly order = signal<number>(6);
  readonly currentStep = signal<number>(0);
  readonly isAutoPlaying = signal<boolean>(false);

  private timer: any = null;

  readonly presets = computed(() => {
    const lang = this.language();
    return [
      { name: 'R² U²', alg: "R2 U2", order: 6 },
      { name: lang === 'bg' ? 'Суне' : 'Sune', alg: "R U R' U R U2 R'", order: 6 },
      { name: lang === 'bg' ? 'Слайс M’ U' : "Slice M' U", alg: "M' U", order: 56 },
      { name: 'R U (ord=105)', alg: "R U", order: 105 },
      { name: lang === 'bg' ? 'Суперфлип' : 'Superflip', alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2", order: 2 },
    ];
  });

  readonly progressPercent = computed(() => {
    const ord = this.order();
    const step = this.currentStep();
    return Math.min(100, Math.round((step / ord) * 100));
  });

  constructor() {
    effect(() => {
      const auto = this.isAutoPlaying();
      const anim = this.isAnimating();
      const algo = this.selectedAlgo();
      const ord = this.order();

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (auto && !anim) {
        this.timer = setTimeout(() => {
          this.applyAlgorithm.emit({
            algo,
            onComplete: () => {
              const next = this.currentStep() + 1;
              if (next >= ord) {
                this.isAutoPlaying.set(false);
                this.currentStep.set(0);
              } else {
                this.currentStep.set(next);
              }
            }
          });
        }, 350);
      }
    });
  }

  selectPreset(alg: string): void {
    this.selectedAlgo.set(alg);
    const ord = computeElementOrder(alg);
    this.order.set(ord);
    this.currentStep.set(0);
    this.isAutoPlaying.set(false);
  }

  onAlgoInputChange(val: string): void {
    this.selectedAlgo.set(val);
    const ord = computeElementOrder(val);
    this.order.set(ord);
    this.currentStep.set(0);
    this.isAutoPlaying.set(false);
  }

  handleStepOnce(): void {
    if (this.isAnimating()) return;
    this.applyAlgorithm.emit({
      algo: this.selectedAlgo(),
      onComplete: () => {
        this.currentStep.update((s) => (s + 1) % this.order());
      }
    });
  }

  toggleAutoPlay(): void {
    this.isAutoPlaying.update((v) => !v);
  }

  handleResetCounter(): void {
    this.currentStep.set(0);
    this.isAutoPlaying.set(false);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
