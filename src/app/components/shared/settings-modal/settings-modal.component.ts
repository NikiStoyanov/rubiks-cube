import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { CubeStateService } from '../../../services/cube-state.service';
import { SoundService } from '../../../services/sound.service';
import { ToastService } from '../../../services/toast.service';
import { ViewMode } from '../../../types/cube';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        (click)="close.emit()"
      >
        <div
          class="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{{ t().settingsTitle }}</span>
                  <span class="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Preferences
                  </span>
                </h2>
                <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">{{ t().settingsSubtitle }}</p>
              </div>
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xl leading-none"
              [title]="t().settingsCloseBtn"
            >
              &times;
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 overflow-y-auto flex flex-col gap-5 text-sm custom-scrollbar">

            <!-- 1. Rotation & Animation Speed (Бързина на въртене) -->
            <section class="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-white">{{ t().settingsMotionSection }}</h3>
                    <p class="text-xs text-slate-400">{{ t().settingsMotionDesc }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                    {{ currentSpeedLabel() }} ({{ Math.round((animSpeed() / 0.45) * 100) }}%)
                  </span>
                </div>
              </div>

              <!-- Speed Presets -->
              <div class="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  (click)="setPresetSpeed(0.08)"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex items-center justify-center gap-1.5"
                  [class]="animSpeed() <= 0.12 ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm' : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-850'"
                >
                  <span>🐢</span>
                  <span>{{ t().settingsSpeedSlow }}</span>
                </button>
                <button
                  type="button"
                  (click)="setPresetSpeed(0.22)"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex items-center justify-center gap-1.5"
                  [class]="animSpeed() > 0.12 && animSpeed() <= 0.3 ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm' : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-850'"
                >
                  <span>⚡</span>
                  <span>{{ t().settingsSpeedNormal }}</span>
                </button>
                <button
                  type="button"
                  (click)="setPresetSpeed(0.42)"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center flex items-center justify-center gap-1.5"
                  [class]="animSpeed() > 0.3 ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm' : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-850'"
                >
                  <span>🚀</span>
                  <span>{{ t().settingsSpeedFast }}</span>
                </button>
              </div>

              <!-- Continuous Speed Slider -->
              <div class="flex items-center gap-3 pt-1">
                <span class="text-xs text-slate-400 font-mono">0.05</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  [value]="animSpeed()"
                  (input)="onSpeedInput($event)"
                  class="flex-1 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span class="text-xs text-slate-400 font-mono">0.45</span>

                <!-- Quick Test Turn Button -->
                <button
                  type="button"
                  (click)="triggerTestMove()"
                  class="ml-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
                  [title]="t().settingsTestMoveBtn"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  <span>{{ t().settingsTestMoveBtn }}</span>
                </button>
              </div>
            </section>

            <!-- 2. Interface Language (Език) -->
            <section class="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m5 8 6 6" />
                    <path d="m4 14 6-6 2-3" />
                    <path d="M2 5h12" />
                    <path d="M7 2h1" />
                    <path d="m22 22-5-10-5 10" />
                    <path d="M14 18h6" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">{{ t().settingsLanguageSection }}</h3>
                  <p class="text-xs text-slate-400">{{ language() === 'bg' ? 'Текущ език: Български' : 'Current Language: English' }}</p>
                </div>
              </div>

              <!-- Two Segmented Language Cards -->
              <div class="grid grid-cols-2 gap-3 pt-1">
                <!-- Bulgarian -->
                <button
                  type="button"
                  (click)="setLanguage('bg')"
                  class="flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer"
                  [class]="language() === 'bg'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">🇧🇬</span>
                    <div>
                      <div class="font-bold text-xs sm:text-sm">Български</div>
                      <div class="text-[0.65rem] text-slate-400 font-mono">BG (Роден език)</div>
                    </div>
                  </div>
                  @if (language() === 'bg') {
                    <div class="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  }
                </button>

                <!-- English -->
                <button
                  type="button"
                  (click)="setLanguage('en')"
                  class="flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer"
                  [class]="language() === 'en'
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">🇬🇧</span>
                    <div>
                      <div class="font-bold text-xs sm:text-sm">English</div>
                      <div class="text-[0.65rem] text-slate-400 font-mono">EN (International)</div>
                    </div>
                  </div>
                  @if (language() === 'en') {
                    <div class="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  }
                </button>
              </div>
            </section>

            <!-- 3. Audio & Sound FX (Звуци) -->
            <section class="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-lg flex items-center justify-center"
                    [class]="!soundService.isMuted() ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-slate-700/40 border border-slate-600/40 text-slate-400'"
                  >
                    @if (!soundService.isMuted()) {
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="22" x2="16" y1="9" y2="15" />
                        <line x1="16" x2="22" y1="9" y2="15" />
                      </svg>
                    }
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-white">{{ t().settingsAudioSection }}</h3>
                    <p class="text-xs text-slate-400">{{ t().settingsAudioDesc }}</p>
                  </div>
                </div>

                <!-- On/Off Switch Button -->
                <button
                  type="button"
                  (click)="toggleSound()"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                  [class]="!soundService.isMuted()
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'"
                >
                  <span class="w-2 h-2 rounded-full" [class]="!soundService.isMuted() ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'"></span>
                  <span>{{ !soundService.isMuted() ? t().soundOn : t().soundOff }}</span>
                </button>
              </div>

              <!-- Test Sound Button -->
              <div class="flex items-center justify-between pt-1 border-t border-slate-700/40 text-xs">
                <span class="text-slate-400">{{ t().settingsAudioToggle }}</span>
                <button
                  type="button"
                  (click)="testSound()"
                  class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                  [title]="t().settingsAudioTestLabel"
                >
                  <svg class="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span>{{ t().settingsAudioTest }}</span>
                </button>
              </div>
            </section>

            <!-- 4. 3D Visualization & View Mode (3D Визуализация и Изглед) -->
            <section class="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-4">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">{{ t().settingsViewSection }}</h3>
                  <p class="text-xs text-slate-400">{{ t().cycleVectorsToggle }}, {{ t().explodedView }} & {{ t().viewModeSetting }}</p>
                </div>
              </div>

              <!-- Cycle Vectors Toggle -->
              <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <div>
                  <div class="font-medium text-xs text-slate-200">{{ t().cycleVectorsToggle }}</div>
                  <div class="text-[0.68rem] text-slate-400">{{ t().settingsCycleArrowsDesc }}</div>
                </div>
                <button
                  type="button"
                  (click)="toggleCycleArrows()"
                  class="w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0"
                  [class]="showCycleArrows() ? 'bg-indigo-600' : 'bg-slate-700'"
                >
                  <div
                    class="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out"
                    [class]="showCycleArrows() ? 'translate-x-5' : 'translate-x-0'"
                  ></div>
                </button>
              </div>

              <!-- Exploded View Slider -->
              <div class="flex flex-col gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <div class="flex items-center justify-between text-xs">
                  <div>
                    <span class="font-medium text-slate-200">{{ t().explodedView }}</span>
                    <span class="text-[0.68rem] text-slate-400 block">{{ t().settingsExplodedDesc }}</span>
                  </div>
                  <span class="font-mono text-cyan-400 font-bold text-xs bg-slate-850 px-2 py-0.5 rounded border border-slate-700">
                    {{ Math.round(explodeFactor() * 100) }}%
                  </span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-[0.7rem] text-slate-500 font-mono">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    [value]="explodeFactor()"
                    (input)="onExplodeInput($event)"
                    class="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span class="text-[0.7rem] text-slate-500 font-mono">100%</span>
                </div>
              </div>

              <!-- View Mode Preference (3D vs 2D Net) -->
              <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <div>
                  <div class="font-medium text-xs text-slate-200">{{ t().viewModeSetting }}</div>
                  <div class="text-[0.68rem] text-slate-400">3D WebGL vs 2D Net</div>
                </div>
                <div class="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    (click)="setViewMode('3d')"
                    class="px-2.5 py-1 rounded text-xs font-semibold transition-all"
                    [class]="viewMode() === '3d' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'"
                  >
                    3D
                  </button>
                  <button
                    type="button"
                    (click)="setViewMode('2d')"
                    class="px-2.5 py-1 rounded text-xs font-semibold transition-all"
                    [class]="viewMode() === '2d' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'"
                  >
                    2D
                  </button>
                </div>
              </div>
            </section>

            <!-- 5. Keyboard Shortcuts Quick Link -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
              <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded bg-slate-700/60 flex items-center justify-center text-slate-300">
                  <kbd class="font-mono text-xs font-bold">?</kbd>
                </div>
                <div>
                  <div class="font-medium text-slate-200">{{ t().shortcutsHelpBtn }}</div>
                  <div class="text-slate-400 text-[0.68rem]">{{ t().shortcutsModalDesc }}</div>
                </div>
              </div>
              <button
                type="button"
                (click)="openShortcuts.emit()"
                class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 hover:border-slate-400 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>{{ t().shortcutsModalTitle }}</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0">
            <button
              type="button"
              (click)="resetDefaults()"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>{{ t().settingsResetDefaults }}</span>
            </button>

            <button
              type="button"
              (click)="close.emit()"
              class="px-5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-900/30"
            >
              {{ t().settingsCloseBtn }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.6);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 9999px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  `,
})
export class SettingsModalComponent {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);
  readonly soundService = inject(SoundService);
  private readonly toastService = inject(ToastService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly animSpeed = this.cubeStateService.animSpeed;
  readonly explodeFactor = this.cubeStateService.explodeFactor;
  readonly showCycleArrows = this.cubeStateService.showCycleArrows;
  readonly viewMode = this.cubeStateService.viewMode;
  readonly Math = Math;

  isOpen = input<boolean>(false);
  close = output<void>();
  openShortcuts = output<void>();
  testMove = output<void>();

  currentSpeedLabel(): string {
    const spd = this.animSpeed();
    if (spd > 0.3) return this.t().speedFast;
    if (spd < 0.12) return this.t().speedSlow;
    return this.t().speedMed;
  }

  setPresetSpeed(spd: number): void {
    this.cubeStateService.setAnimSpeed(spd);
  }

  onSpeedInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.cubeStateService.setAnimSpeed(val);
  }

  onExplodeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.cubeStateService.setExplodeFactor(val);
  }

  toggleCycleArrows(): void {
    this.cubeStateService.setShowCycleArrows(!this.showCycleArrows());
  }

  setViewMode(mode: ViewMode): void {
    this.cubeStateService.setViewMode(mode);
  }

  setLanguage(lang: 'bg' | 'en'): void {
    this.languageService.setLanguage(lang);
  }

  toggleSound(): void {
    this.soundService.toggleMute();
  }

  testSound(): void {
    this.soundService.playTurnSound(false, true);
  }

  triggerTestMove(): void {
    this.testMove.emit();
  }

  resetDefaults(): void {
    this.cubeStateService.resetSettingsToDefault();
    this.soundService.setMuted(false);
    this.toastService.show(this.t().settingsResetSuccess);
  }
}

