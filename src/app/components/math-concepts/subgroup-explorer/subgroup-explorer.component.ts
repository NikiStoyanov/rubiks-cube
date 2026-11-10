import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { MathViewComponent } from '../../shared/math-view/math-view.component';
import {
  SUBGROUP_PRESETS,
  ALGORITHM_PRESETS,
} from '../../../math/group-algebra';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-subgroup-explorer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MathViewComponent],
  templateUrl: './subgroup-explorer.component.html',
})
export class SubgroupExplorerComponent {
  private languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;

  activeSubgroupId = input<string>('full');
  isAnimating = input<boolean>(false);

  selectSubgroup = output<string>();
  applyAlgorithm = output<string>();

  readonly subgroupPresets = SUBGROUP_PRESETS;
  readonly algorithmPresets = ALGORITHM_PRESETS;
}
