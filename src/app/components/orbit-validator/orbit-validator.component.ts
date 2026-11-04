import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CubeState } from '../../types/cube';
import { LanguageService } from '../../services/language.service';
import { 
  validateSolutionOrbit, 
  OrbitValidationResult, 
  simulateCornerTwist, 
  simulateEdgeFlip, 
  simulatePieceSwap, 
  repairToValidOrbit 
} from '../../math/rubikGroup';
import { MathViewComponent } from '../shared/math-view/math-view.component';

@Component({
  selector: 'app-orbit-validator',
  standalone: true,
  imports: [CommonModule, MathViewComponent],
  templateUrl: './orbit-validator.component.html',
})
export class OrbitValidatorComponent {
  private languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  cubeState = input.required<CubeState>();
  isAnimating = input<boolean>(false);

  stateChange = output<{ state: CubeState; action: 'twist' | 'flip' | 'swap' | 'repair' }>();

  readonly val = computed<OrbitValidationResult>(() => {
    return validateSolutionOrbit(this.cubeState());
  });

  readonly cosetList = Array.from({ length: 12 }, (_, i) => ({ idx: i }));

  onSimulateCornerTwist(): void {
    const next = simulateCornerTwist(this.cubeState(), 0, 1);
    this.stateChange.emit({ state: next, action: 'twist' });
  }

  onSimulateEdgeFlip(): void {
    const next = simulateEdgeFlip(this.cubeState(), 0);
    this.stateChange.emit({ state: next, action: 'flip' });
  }

  onSimulatePieceSwap(): void {
    const next = simulatePieceSwap(this.cubeState());
    this.stateChange.emit({ state: next, action: 'swap' });
  }

  onRepair(): void {
    const next = repairToValidOrbit(this.cubeState());
    this.stateChange.emit({ state: next, action: 'repair' });
  }
}
