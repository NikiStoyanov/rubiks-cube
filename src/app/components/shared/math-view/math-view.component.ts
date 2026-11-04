import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import katex from 'katex';

export function normalizeMathLatex(input: string): string {
  if (!input) return '';
  let s = input;
  // Fix escape characters if JS string literals swallowed backslashes
  s = s.replace(/\text\b/g, '\\text');
  s = s.replace(/\frac\b/g, '\\frac');
  s = s.replace(/\times\b/g, '\\times');
  s = s.replace(/\vdots\b/g, '\\vdots');
  // Normalize operator names safely
  s = s.replace(/\\?operatorname\s*\{?Orb\}?/g, '\\mathrm{Orb}');
  s = s.replace(/\\?operatorname\s*\{?Stab\}?/g, '\\mathrm{Stab}');
  s = s.replace(/\\?mathrm\s*\{?Orb\}?/g, '\\mathrm{Orb}');
  s = s.replace(/\\?mathrm\s*\{?Stab\}?/g, '\\mathrm{Stab}');
  return s;
}

@Component({
  selector: 'app-math-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="(block() ? 'block my-1 text-center max-w-full overflow-x-auto overflow-y-visible py-0.5 ' : 'inline align-middle ') + className()"
      [innerHTML]="html()"
    ></span>
  `
})
export class MathViewComponent {
  math = input.required<string>();
  block = input<boolean>(false);
  className = input<string>('');

  readonly html = computed(() => {
    const raw = this.math();
    const sanitized = normalizeMathLatex(raw);
    try {
      return katex.renderToString(sanitized, {
        displayMode: this.block(),
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (e) {
      console.error('KaTeX error:', e);
      return `<span class="text-amber-400 font-mono">${raw}</span>`;
    }
  });
}
