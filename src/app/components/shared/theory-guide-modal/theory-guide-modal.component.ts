import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { MathViewComponent } from '../math-view/math-view.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-theory-guide-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MathViewComponent],
  templateUrl: './theory-guide-modal.component.html',
  styleUrl: './theory-guide-modal.component.css',
})
export class TheoryGuideModalComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  isOpen = input<boolean>(false);
  close = output<void>();
}
