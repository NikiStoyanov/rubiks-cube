import { Component, ChangeDetectionStrategy, inject, input, output, computed } from '@angular/core';
import { MathViewComponent } from '../../shared/math-view/math-view.component';
import {
  INITIAL_CORNERS,
  INITIAL_EDGES,
  RubikGroupAlgebra,
  SUBGROUP_PRESETS,
} from '../../../math/group-algebra';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-orbit-visualizer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MathViewComponent],
  templateUrl: './orbit-visualizer.component.html',
})
export class OrbitVisualizerComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly subgroupPresets = SUBGROUP_PRESETS;

  selectedPieceType = input<'corner' | 'edge'>('corner');
  selectedPieceId = input<number>(0);
  activeSubgroupId = input<string>('full');

  selectPiece = output<{ type: 'corner' | 'edge'; id: number }>();
  selectSubgroup = output<string>();

  readonly currentPieceName = computed(() => {
    return this.selectedPieceType() === 'corner'
      ? INITIAL_CORNERS[this.selectedPieceId()]?.name || 'UFL'
      : INITIAL_EDGES[this.selectedPieceId()]?.name || 'UF';
  });

  readonly orbitTheoremFormula = computed(() => {
    const piece = this.currentPieceName();
    return `|H| = |\\mathrm{Orb}_H(\\text{${piece}})| \\times |\\mathrm{Stab}_H(\\text{${piece}})|`;
  });

  readonly activeSubgroup = computed(() => {
    const id = this.activeSubgroupId();
    return SUBGROUP_PRESETS.find((s) => s.id === id) || SUBGROUP_PRESETS[0];
  });

  readonly orbitData = computed(() => {
    return RubikGroupAlgebra.computeOrbit(
      this.selectedPieceType(),
      this.selectedPieceId(),
      this.activeSubgroup().generators
    );
  });

  readonly availablePieces = computed(() => {
    return this.selectedPieceType() === 'corner' ? INITIAL_CORNERS : INITIAL_EDGES;
  });

  readonly isTransitive = computed(() => {
    const totalPositions = this.selectedPieceType() === 'corner' ? 8 : 12;
    return this.orbitData().orbitPositions.length === totalPositions;
  });

  isPieceInOrbit(id: number): boolean {
    return this.orbitData().orbitPositions.includes(id);
  }

  onTypeClick(type: 'corner' | 'edge'): void {
    this.selectPiece.emit({ type, id: 0 });
  }

  onPieceClick(id: number): void {
    this.selectPiece.emit({ type: this.selectedPieceType(), id });
  }

  onSubgroupChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectSubgroup.emit(id);
  }
}
