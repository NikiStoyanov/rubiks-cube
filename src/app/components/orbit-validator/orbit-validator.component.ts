import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { CubeStateService } from '../../services/cube-state.service';
import {
  validateSolutionOrbit,
  OrbitValidationResult,
} from '../../math/rubikGroup';
import { MathViewComponent } from '../shared/math-view/math-view.component';

@Component({
  selector: 'app-orbit-validator',
  standalone: true,
  imports: [CommonModule, MathViewComponent],
  templateUrl: './orbit-validator.component.html',
  styleUrl: './orbit-validator.component.css',
})
export class OrbitValidatorComponent {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);

  readonly language = this.languageService.language;
  readonly t = this.languageService.t;
  readonly cubeState = this.cubeStateService.cubeState;
  readonly isAnimating = this.cubeStateService.isAnimating;

  readonly val = computed<OrbitValidationResult>(() => {
    return validateSolutionOrbit(this.cubeState());
  });

  readonly cosetList = Array.from({ length: 12 }, (_, i) => ({ idx: i }));

  onSimulateCornerTwist(): void {
    this.cubeStateService.tamperState('twist');
  }

  onSimulateEdgeFlip(): void {
    this.cubeStateService.tamperState('flip');
  }

  onSimulatePieceSwap(): void {
    this.cubeStateService.tamperState('swap');
  }

  onRepair(): void {
    this.cubeStateService.tamperState('repair');
  }
}
