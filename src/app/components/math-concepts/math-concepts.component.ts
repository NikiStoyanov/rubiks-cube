import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { CubeStateService, ActiveTab } from '../../services/cube-state.service';
import { StandardMove } from '../../types/cube';
import { OrbitVisualizerComponent } from './orbit-visualizer/orbit-visualizer.component';
import { StabilizerInspectorComponent } from './stabilizer-inspector/stabilizer-inspector.component';
import { CycleNotationPanelComponent } from './cycle-notation-panel/cycle-notation-panel.component';
import { OrderCycleStepperComponent } from './order-cycle-stepper/order-cycle-stepper.component';
import { SubgroupExplorerComponent } from './subgroup-explorer/subgroup-explorer.component';

export type { ActiveTab };

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
  styleUrl: './math-concepts.component.css',
})
export class MathConceptsComponent {
  private readonly languageService = inject(LanguageService);
  readonly cubeStateService = inject(CubeStateService);

  readonly t = this.languageService.t;

  readonly selectedPieceType = this.cubeStateService.selectedPieceType;
  readonly selectedPieceId = this.cubeStateService.selectedPieceId;
  readonly activeSubgroupId = this.cubeStateService.activeSubgroupId;
  readonly analysis = this.cubeStateService.analysis;
  readonly lastMove = this.cubeStateService.lastMove;
  readonly showCycleArrows = this.cubeStateService.showCycleArrows;
  readonly isSolved = this.cubeStateService.isSolved;
  readonly isAnimating = this.cubeStateService.isAnimating;

  readonly activeTab = this.cubeStateService.activeTab;

  setActiveTab(tab: ActiveTab): void {
    this.cubeStateService.setActiveTab(tab);
  }

  handleSelectPiece(event: { type: 'corner' | 'edge'; id: number }): void {
    this.cubeStateService.setSelectedPiece(event.type, event.id);
  }

  handleSelectSubgroup(id: string): void {
    this.cubeStateService.setActiveSubgroup(id);
  }

  handleApplyMove(move: StandardMove): void {
    this.cubeStateService.applyMove(move);
  }

  handleApplyAlgorithm(algo: { algo: string; onComplete?: () => void } | string): void {
    this.cubeStateService.applyAlgorithm(algo);
  }

  handleToggleCycleArrows(show: boolean): void {
    this.cubeStateService.setShowCycleArrows(show);
  }
}
