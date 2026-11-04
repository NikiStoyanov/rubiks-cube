import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MathViewComponent } from '../math-view/math-view.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-theory-guide-modal',
  standalone: true,
  imports: [CommonModule, MathViewComponent],
  templateUrl: './theory-guide-modal.component.html',
})
export class TheoryGuideModalComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  isOpen = input<boolean>(false);
  close = output<void>();
}
