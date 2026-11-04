import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathViewComponent } from '../../shared/math-view/math-view.component';
import {
  INITIAL_CORNERS,
  INITIAL_EDGES,
  applyMove,
  createInitialCubeState
} from '../../../math/rubikGroup';
import { StandardMove } from '../../../types/cube';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-stabilizer-inspector',
  standalone: true,
  imports: [CommonModule, MathViewComponent],
  templateUrl: './stabilizer-inspector.component.html',
})
export class StabilizerInspectorComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  selectedPieceType = input<'corner' | 'edge'>('corner');
  selectedPieceId = input<number>(0);
  isAnimating = input<boolean>(false);

  applyMove = output<StandardMove>();

  readonly pieceName = computed(() => {
    return this.selectedPieceType() === 'corner'
      ? INITIAL_CORNERS[this.selectedPieceId()]?.name || 'UFL'
      : INITIAL_EDGES[this.selectedPieceId()]?.name || 'UF';
  });

  readonly orbitSize = computed(() => this.selectedPieceType() === 'corner' ? 8 : 12);
  readonly orientedOrbitSize = computed(() => 24);

  readonly posStabilizerFormula = computed(() => {
    const p = this.pieceName();
    return `|\\mathrm{Stab}_G(\\mathrm{${p}})| = \\frac{|G|}{|\\mathrm{Orb}(\\mathrm{${p}})|} = \\frac{|G|}{${this.orbitSize()}}`;
  });

  readonly orientedStabilizerFormula = computed(() => {
    return `|\\mathrm{Stab}_G(x_{\\mathrm{oriented}})| = \\frac{|G|}{${this.orientedOrbitSize()}}`;
  });

  readonly candidateMoves: StandardMove[] = [
    'U', "U'", 'U2',
    'D', "D'", 'D2',
    'L', "L'", 'L2',
    'R', "R'", 'R2',
    'F', "F'", 'F2',
    'B', "B'", 'B2',
    'M', 'E', 'S',
  ];

  readonly generatorCheck = computed(() => {
    const pType = this.selectedPieceType();
    const pId = this.selectedPieceId();
    const initialState = createInitialCubeState();

    return this.candidateMoves.map((m) => {
      const next = applyMove(initialState, m);
      const fixesPos =
        pType === 'corner'
          ? next.corners[pId].pos === pId
          : next.edges[pId].pos === pId;
      const fixesOrientation =
        pType === 'corner'
          ? fixesPos && next.corners[pId].orientation === 0
          : fixesPos && next.edges[pId].orientation === 0;

      return {
        move: m,
        fixesPos,
        fixesOrientation,
      };
    });
  });
}
