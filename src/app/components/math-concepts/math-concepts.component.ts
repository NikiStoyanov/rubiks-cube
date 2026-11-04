import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { MoveAnalysis, PieceType, StandardMove } from '../../types/cube';
import { OrbitVisualizerComponent } from './orbit-visualizer/orbit-visualizer.component';
import { StabilizerInspectorComponent } from './stabilizer-inspector/stabilizer-inspector.component';
import { CycleNotationPanelComponent } from './cycle-notation-panel/cycle-notation-panel.component';
import { OrderCycleStepperComponent } from './order-cycle-stepper/order-cycle-stepper.component';
import { SubgroupExplorerComponent } from './subgroup-explorer/subgroup-explorer.component';

export type ActiveTab = 'orbit' | 'stabilizer' | 'cycles' | 'order' | 'subgroups';

@Component({
  selector: 'app-math-concepts',
  standalone: true,
  imports: [
    CommonModule,
    OrbitVisualizerComponent,
    StabilizerInspectorComponent,
    CycleNotationPanelComponent,
    OrderCycleStepperComponent,
    SubgroupExplorerComponent,
  ],
  templateUrl: './math-concepts.component.html',
})
export class MathConceptsComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  selectedPieceType = input.required<'corner' | 'edge'>();
  selectedPieceId = input.required<number>();
  activeSubgroupId = input.required<string>();
  analysis = input<MoveAnalysis | null>(null);
  lastMove = input<string>('');
  showCycleArrows = input<boolean>(true);
  isSolved = input<boolean>(true);
  isAnimating = input<boolean>(false);

  selectPiece = output<{ type: 'corner' | 'edge'; id: number }>();
  selectSubgroup = output<string>();
  applyMove = output<StandardMove>();
  applyAlgorithm = output<{ algo: string; onComplete?: () => void } | string>();
  toggleCycleArrows = output<boolean>();
  tabChange = output<ActiveTab>();

  readonly activeTab = signal<ActiveTab>('orbit');

  setActiveTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    this.tabChange.emit(tab);
  }
}
