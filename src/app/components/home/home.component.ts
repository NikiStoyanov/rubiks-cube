import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CubeStateService } from '../../services/cube-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);
  readonly cubeStateService = inject(CubeStateService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  onScramble(): void {
    this.cubeStateService.scramble(20);
  }

  onReset(): void {
    this.cubeStateService.reset();
  }

  onOpenTheory(): void {
    this.cubeStateService.openTheory();
  }

  onOpenTour(): void {
    this.cubeStateService.openTour();
  }
}

