import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-shortcuts-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        (click)="close.emit()"
      >
        <div
          class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-5"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="12" x="3" y="6" rx="2" />
                  <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-white">{{ t().shortcutsModalTitle }}</h2>
                <p class="text-xs text-slate-400">{{ t().shortcutsModalDesc }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="text-slate-400 hover:text-white text-xl px-2 py-1 leading-none"
            >
              &times;
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <!-- Faces -->
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wide">{{
                t().shortcutsFaces
              }}</span>
              <div class="flex flex-wrap gap-1.5 mt-1">
                @for (faceKey of faceKeys; track faceKey) {
                  <kbd
                    class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-amber-300 font-bold"
                    >{{ faceKey }}</kbd
                  >
                }
              </div>
            </div>

            <!-- Inverses / Primes -->
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wide">{{
                t().shortcutsPrimes
              }}</span>
              <div class="flex items-center gap-1.5 mt-1">
                <kbd
                  class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-slate-300 font-bold"
                  >Shift</kbd
                >
                <span class="text-slate-400 text-xs">+</span>
                <kbd
                  class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-emerald-300 font-bold"
                  >Key</kbd
                >
                <span class="text-xs text-slate-400 ml-1 font-mono">(R', U', ...)</span>
              </div>
            </div>

            <!-- Slices -->
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-purple-400 uppercase tracking-wide">{{
                t().shortcutsSlices
              }}</span>
              <div class="flex flex-wrap gap-1.5 mt-1">
                @for (sliceKey of sliceKeys; track sliceKey) {
                  <kbd
                    class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-purple-300 font-bold"
                    >{{ sliceKey }}</kbd
                  >
                }
              </div>
            </div>

            <!-- Undo & Modals -->
            <div class="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-rose-400 uppercase tracking-wide">{{
                t().shortcutsUndo
              }}</span>
              <div class="flex items-center gap-2 mt-1">
                <kbd
                  class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-rose-300 font-bold"
                  >Z</kbd
                >
                <span class="text-xs text-slate-400">/</span>
                <kbd
                  class="px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-rose-300 font-bold"
                  >Ctrl+Z</kbd
                >
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-end border-t border-slate-800">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShortcutsModalComponent {
  private readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  readonly isOpen = input.required<boolean>();
  readonly close = output<void>();

  readonly faceKeys = ['R', 'L', 'U', 'D', 'F', 'B'] as const;
  readonly sliceKeys = ['M', 'E', 'S'] as const;
}

