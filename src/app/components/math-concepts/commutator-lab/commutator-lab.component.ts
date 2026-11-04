import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MathViewComponent } from '../../shared/math-view/math-view.component';
import { 
  makeCommutator, 
  makeConjugate, 
  invertAlgorithm 
} from '../../../math/rubikGroup';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-commutator-lab',
  standalone: true,
  imports: [CommonModule, FormsModule, MathViewComponent],
  templateUrl: './commutator-lab.component.html',
})
export class CommutatorLabComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  isAnimating = input<boolean>(false);
  applyAlgorithm = output<string>();

  readonly algoA = signal<string>('R');
  readonly algoB = signal<string>('U');
  readonly mode = signal<'commutator' | 'conjugate'>('commutator');

  readonly commutatorStr = computed(() => makeCommutator(this.algoA(), this.algoB()));
  readonly conjugateStr = computed(() => makeConjugate(this.algoA(), this.algoB()));
  readonly invA = computed(() => invertAlgorithm(this.algoA()));
  readonly invB = computed(() => invertAlgorithm(this.algoB()));

  readonly formulaPrefix = computed(() => {
    return this.mode() === 'commutator'
      ? '[A, B] = A \\cdot B \\cdot A^{-1} \\cdot B^{-1} ='
      : 'A \\cdot B \\cdot A^{-1} =';
  });

  readonly presets = computed(() => {
    const lang = this.language();
    return [
      { label: lang === 'bg' ? 'Секси ход [R, U]' : 'Sexy Move [R, U]', a: 'R', b: 'U', type: 'commutator' as const },
      { label: lang === 'bg' ? '3-Цикъл върхове [R, U’ L’ U]' : 'Corner 3-Cycle [R, U’ L’ U]', a: 'R', b: "U' L' U", type: 'commutator' as const },
      { label: lang === 'bg' ? '3-Цикъл ръбове [M’, U2]' : 'Edge 3-Cycle [M’, U2]', a: "M'", b: 'U2', type: 'commutator' as const },
      { label: lang === 'bg' ? 'A-Perm Конюгат' : 'A-Perm Conjugate', a: "R2", b: "D2 R' U' R D2 R' U R'", type: 'conjugate' as const },
    ];
  });

  setMode(m: 'commutator' | 'conjugate'): void {
    this.mode.set(m);
  }

  selectPreset(p: { a: string; b: string; type: 'commutator' | 'conjugate' }): void {
    this.algoA.set(p.a);
    this.algoB.set(p.b);
    this.mode.set(p.type);
  }

  handleApply(): void {
    if (this.mode() === 'commutator') {
      this.applyAlgorithm.emit(this.commutatorStr());
    } else {
      this.applyAlgorithm.emit(this.conjugateStr());
    }
  }
}
