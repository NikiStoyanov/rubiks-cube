import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CubeStateService } from '../../../services/cube-state.service';
import { LanguageService } from '../../../services/language.service';
import { MathViewComponent } from '../../shared/math-view/math-view.component';

@Component({
  selector: 'app-algebra-hud',
  standalone: true,
  imports: [CommonModule, MathViewComponent],
  templateUrl: './algebra-hud.component.html',
  styleUrl: './algebra-hud.component.css',
})
export class AlgebraHudComponent {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  readonly lastMove = this.cubeStateService.lastMove;
  readonly analysis = this.cubeStateService.analysis;
  readonly isSolved = this.cubeStateService.isSolved;
  readonly orbitPieces = this.cubeStateService.orbitPieces;
  readonly selectedPieceType = this.cubeStateService.selectedPieceType;
  readonly activePieceName = this.cubeStateService.activePieceName;
  readonly activeSubgroupId = this.cubeStateService.activeSubgroupId;

  readonly isExpanded = signal<boolean>(true);

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }

  readonly currentMoveTex = computed<string>(() => {
    const m = this.lastMove();
    if (!m || m.includes('Identity')) return 'g = e';
    if (m.includes('Scramble')) return 'g \\in \\mathcal{G}';
    if (m.includes('Simulated')) return '\\sigma \\notin \\mathcal{G}';
    return `g = \\text{${m}}`;
  });

  readonly orderText = computed<number>(() => {
    const anal = this.analysis();
    if (this.isSolved() || !anal) return 1;
    return anal.order;
  });

  readonly cornerCyclesFormatted = computed<string>(() => {
    const anal = this.analysis();
    if (!anal || anal.cornerCycles.length === 0) {
      return '(e) Identity';
    }
    return anal.cornerCycles
      .map((c) => `(${c.elements.join(' \\to ')})`)
      .join(' ');
  });

  readonly edgeCyclesFormatted = computed<string>(() => {
    const anal = this.analysis();
    if (!anal || anal.edgeCycles.length === 0) {
      return '(e) Identity';
    }
    return anal.edgeCycles
      .map((c) => `(${c.elements.join(' \\to ')})`)
      .join(' ');
  });

  readonly humanExplanation = computed<string>(() => {
    const m = this.lastMove();
    const lang = this.language();

    if (this.isSolved() || m.includes('Identity')) {
      return this.t().hudIdentityExplain;
    }
    if (m.length <= 2 && ['U', 'D', 'L', 'R', 'F', 'B'].includes(m[0])) {
      return this.t().hudSingleTurnExplain;
    }
    if (m.includes("'") || m.includes(' ') || m.includes('[')) {
      return this.t().hudCommutatorExplain;
    }
    return this.t().hudGeneralExplain;
  });
}
