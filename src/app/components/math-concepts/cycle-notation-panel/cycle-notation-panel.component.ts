import { Component, ChangeDetectionStrategy, inject, input, output, computed } from '@angular/core';
import { MathViewComponent } from '../../shared/math-view/math-view.component';
import { MoveAnalysis, DisjointCycle } from '../../../types/cube';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-cycle-notation-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MathViewComponent],
  templateUrl: './cycle-notation-panel.component.html',
})
export class CycleNotationPanelComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  analysis = input<MoveAnalysis | null>(null);
  lastMove = input<string>('');
  showCycleArrows = input<boolean>(true);

  toggleCycleArrows = output<boolean>();

  private formatCycles(cycles: DisjointCycle[]): string {
    if (!cycles || cycles.length === 0) return '';
    return cycles
      .map((c) => `(${c.elements.join('\\to ')})`)
      .join('\\; ');
  }

  readonly cornerCycleStr = computed(() => {
    const a = this.analysis();
    return a ? this.formatCycles(a.cornerCycles) : '';
  });

  readonly edgeCycleStr = computed(() => {
    const a = this.analysis();
    return a ? this.formatCycles(a.edgeCycles) : '';
  });
}
