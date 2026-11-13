import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CubeStateService } from '../../../services/cube-state.service';
import { LanguageService } from '../../../services/language.service';
import { ShareService } from '../../../services/share.service';
import { ToastService } from '../../../services/toast.service';
import { RubikGroupAlgebra } from '../../../math/group-algebra';

@Component({
  selector: 'app-share-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
        (click)="close.emit()"
      >
        <div
          class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col gap-4"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div
                class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-white">{{ t().shareModalTitle }}</h2>
                <p class="text-xs text-slate-400">{{ t().shareModalDesc }}</p>
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

          <!-- State Status Pill -->
          <div
            class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
          >
            <div class="flex items-center gap-2">
              @if (isSolved()) {
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="text-xs font-semibold text-emerald-400">{{ t().shareStatusSolved }}</span>
              } @else if (isSolvable()) {
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span class="text-xs font-semibold text-cyan-300">{{ t().shareStatusSolvable }}</span>
              } @else {
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span class="text-xs font-semibold text-amber-300">{{ t().shareStatusInvalid }}</span>
              }
            </div>
            <span class="text-xs font-mono text-slate-400">{{ lastMove() }}</span>
          </div>

          <!-- Section 1: Direct URL Link -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between"
            >
              <span>{{ t().shareDirectLink }}</span>
              @if (isLinkCopied()) {
                <span class="text-emerald-400 font-bold normal-case tracking-normal text-xs animate-fade-in"
                  >✓ {{ t().shareLinkCopied }}</span
                >
              }
            </label>
            <div class="flex items-center gap-2">
              <input
                type="text"
                readonly
                [value]="shareUrl()"
                (click)="selectInput($event)"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 select-all truncate"
              />
              <button
                type="button"
                (click)="copyShareLink()"
                class="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
              >
                @if (isLinkCopied()) {
                  <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>✓</span>
                } @else {
                  <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>{{ t().shareCopyLink }}</span>
                }
              </button>
            </div>
          </div>

          <!-- Section 2: Scramble / Move notation (if moves were made) -->
          @if (shareMoves()) {
            <div class="flex flex-col gap-1.5">
              <label
                class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between"
              >
                <span>{{ t().shareScrambleTitle }}</span>
                @if (isMovesCopied()) {
                  <span class="text-emerald-400 font-bold normal-case tracking-normal text-xs animate-fade-in"
                    >✓ {{ t().shareLinkCopied }}</span
                  >
                }
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  readonly
                  [value]="shareMoves()"
                  (click)="selectInput($event)"
                  class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 select-all truncate"
                />
                <button
                  type="button"
                  (click)="copyMoves()"
                  class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition shrink-0"
                >
                  {{ t().shareCopyScramble }}
                </button>
              </div>
            </div>
          }

          <!-- Section 3: 54-facelet code (Facelets) -->
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between"
            >
              <span>{{ t().shareFaceletsTitle }}</span>
              @if (isFaceletsCopied()) {
                <span class="text-emerald-400 font-bold normal-case tracking-normal text-xs animate-fade-in"
                  >✓ {{ t().shareLinkCopied }}</span
                >
              }
            </label>
            <div class="flex items-center gap-2">
              <input
                type="text"
                readonly
                [value]="shareFaceletStr()"
                (click)="selectInput($event)"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-400 focus:outline-none select-all truncate"
              />
              <button
                type="button"
                (click)="copyFacelets()"
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition shrink-0"
              >
                {{ t().shareCopyFacelets }}
              </button>
            </div>
          </div>

          <!-- Section 4: Social and Native Apps Share -->
          <div class="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <a
                [href]="whatsAppShareUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-900 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>💬</span>
                <span>{{ t().shareViaWhatsApp }}</span>
              </a>

              <a
                [href]="telegramShareUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-lg bg-sky-950/70 border border-sky-700/60 text-sky-400 hover:bg-sky-900 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>✈️</span>
                <span>{{ t().shareViaTelegram }}</span>
              </a>

              <a
                [href]="xShareUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>𝕏</span>
                <span>{{ t().shareViaX }}</span>
              </a>
            </div>

            @if (canNativeShare()) {
              <button
                type="button"
                (click)="shareViaNative()"
                class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span>{{ t().shareNativeBtn }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ShareModalComponent {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);
  private readonly shareService = inject(ShareService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input.required<boolean>();
  readonly close = output<void>();

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly isSolved = this.cubeStateService.isSolved;
  readonly isSolvable = this.cubeStateService.isSolvable;
  readonly lastMove = this.cubeStateService.lastMove;
  readonly canNativeShare = this.shareService.canNativeShare;

  readonly isLinkCopied = signal<boolean>(false);
  readonly isMovesCopied = signal<boolean>(false);
  readonly isFaceletsCopied = signal<boolean>(false);

  readonly shareUrl = computed<string>(() => {
    this.isOpen();
    this.cubeStateService.cubeState();
    return this.cubeStateService.getShareUrl();
  });

  readonly shareFaceletStr = computed<string>(() => {
    return this.cubeStateService.get54FaceletString(this.cubeStateService.cubeState());
  });

  readonly shareMoves = computed<string>(() => {
    const history = this.cubeStateService.moveHistory();
    const cleanMoves: string[] = [];
    for (const item of history) {
      const parsed = RubikGroupAlgebra.parseAlgorithm(item);
      cleanMoves.push(...parsed);
    }
    return cleanMoves.join(' ');
  });

  readonly whatsAppShareUrl = computed<string>(() =>
    this.shareService.getWhatsAppShareUrl(this.shareUrl(), this.language())
  );

  readonly telegramShareUrl = computed<string>(() =>
    this.shareService.getTelegramShareUrl(this.shareUrl(), this.language())
  );

  readonly xShareUrl = computed<string>(() =>
    this.shareService.getXShareUrl(this.shareUrl(), this.language())
  );

  selectInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    target?.select();
  }

  async copyShareLink(): Promise<void> {
    const url = this.shareUrl();
    if (!url) return;
    await this.shareService.copyToClipboard(url);
    this.isLinkCopied.set(true);
    this.toastService.show(this.t().shareLinkCopied);
    setTimeout(() => this.isLinkCopied.set(false), 2500);
  }

  async copyMoves(): Promise<void> {
    const moves = this.shareMoves();
    if (!moves) return;
    await this.shareService.copyToClipboard(moves);
    this.isMovesCopied.set(true);
    this.toastService.show(this.t().shareLinkCopied);
    setTimeout(() => this.isMovesCopied.set(false), 2500);
  }

  async copyFacelets(): Promise<void> {
    const facelets = this.shareFaceletStr();
    if (!facelets) return;
    await this.shareService.copyToClipboard(facelets);
    this.isFaceletsCopied.set(true);
    this.toastService.show(this.t().shareLinkCopied);
    setTimeout(() => this.isFaceletsCopied.set(false), 2500);
  }

  async shareViaNative(): Promise<void> {
    await this.shareService.shareViaNative(this.shareUrl(), this.language());
  }
}

