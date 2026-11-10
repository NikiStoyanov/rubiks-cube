import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  signal,
  computed,
  inject,
  OnInit,
  effect,
} from '@angular/core';
import { CubeStateService } from '../../services/cube-state.service';
import { LanguageService } from '../../services/language.service';
import { SoundService } from '../../services/sound.service';

export interface TimerSolve {
  id: string;
  timeMs: number;
  formatted: string;
  date: string;
  scramble: string;
}

export type TimerPhase = 'idle' | 'inspection' | 'holding' | 'ready' | 'running' | 'stopped';

@Component({
  selector: 'app-speed-timer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './speed-timer.component.html',
  styleUrl: './speed-timer.component.css',
  host: {
    '(window:keydown)': 'onKeyDown($event)',
    '(window:keyup)': 'onKeyUp($event)',
  },
})
export class SpeedTimerComponent implements OnInit {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);
  private readonly soundService = inject(SoundService);
  private readonly destroyRef = inject(DestroyRef);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly isSolved = this.cubeStateService.isSolved;

  // WCA Settings
  readonly useInspection = signal<boolean>(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('rubik_timer_inspection') === 'true'
      : true
  );

  // Timer State
  readonly phase = signal<TimerPhase>('idle');
  readonly currentScramble = signal<string>('');
  readonly elapsedMs = signal<number>(0);
  readonly inspectionRemaining = signal<number>(15);
  readonly solves = signal<TimerSolve[]>([]);

  private animFrameId: number | null = null;
  private holdTimeout: ReturnType<typeof setTimeout> | null = null;
  private inspectionInterval: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private isSpaceHeld = false;

  constructor() {
    // Auto-stop timer when 3D cube reaches solved state while running
    effect(() => {
      const solved = this.isSolved();
      if (solved && this.phase() === 'running') {
        this.stopTimer();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  ngOnInit(): void {
    this.loadSolves();
    this.generateNewScramble();
  }

  private cleanup(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.holdTimeout) clearTimeout(this.holdTimeout);
    if (this.inspectionInterval) clearInterval(this.inspectionInterval);
  }

  // ==========================================
  // WCA SCRAMBLE GENERATOR
  // ==========================================
  generateNewScramble(): void {
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const length = 20;
    const moves: string[] = [];
    let lastFace = '';

    for (let i = 0; i < length; i++) {
      let face = faces[Math.floor(Math.random() * faces.length)];
      while (face === lastFace) {
        face = faces[Math.floor(Math.random() * faces.length)];
      }
      lastFace = face;
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(face + mod);
    }

    this.currentScramble.set(moves.join(' '));
  }

  applyScrambleTo3D(): void {
    const sc = this.currentScramble();
    if (!sc) return;
    this.cubeStateService.applyAlgorithm(sc);
  }

  toggleInspection(): void {
    const next = !this.useInspection();
    this.useInspection.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rubik_timer_inspection', String(next));
    }
  }

  // ==========================================
  // TIMER CONTROLLER LOGIC
  // ==========================================
  startHold(): void {
    const curPhase = this.phase();
    if (curPhase === 'running') {
      this.stopTimer();
      return;
    }

    if (curPhase === 'idle' || curPhase === 'stopped') {
      if (this.useInspection()) {
        this.startInspection();
        return;
      }
    }

    if (curPhase === 'inspection' || (!this.useInspection() && (curPhase === 'idle' || curPhase === 'stopped'))) {
      this.phase.set('holding');
      this.holdTimeout = setTimeout(() => {
        if (this.phase() === 'holding') {
          this.phase.set('ready');
          this.soundService.playTurnSound();
        }
      }, 350);
    }
  }

  releaseHold(): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }

    if (this.phase() === 'ready') {
      if (this.inspectionInterval) {
        clearInterval(this.inspectionInterval);
        this.inspectionInterval = null;
      }
      this.startRunning();
    } else if (this.phase() === 'holding') {
      // Released too early before 350ms
      if (this.useInspection() && this.inspectionRemaining() > 0) {
        this.phase.set('inspection');
      } else {
        this.phase.set('idle');
      }
    }
  }

  private startInspection(): void {
    this.phase.set('inspection');
    this.inspectionRemaining.set(15);
    if (this.inspectionInterval) clearInterval(this.inspectionInterval);

    this.inspectionInterval = setInterval(() => {
      this.inspectionRemaining.update((v) => {
        if (v <= 1) {
          if (this.inspectionInterval) {
            clearInterval(this.inspectionInterval);
            this.inspectionInterval = null;
          }
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  private startRunning(): void {
    this.startTime = performance.now();
    this.phase.set('running');

    const update = () => {
      if (this.phase() !== 'running') return;
      const now = performance.now();
      this.elapsedMs.set(now - this.startTime);
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  stopTimer(): void {
    if (this.phase() !== 'running') return;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const finalTimeMs = performance.now() - this.startTime;
    this.elapsedMs.set(finalTimeMs);
    this.phase.set('stopped');

    this.recordSolve(finalTimeMs);
  }

  private recordSolve(timeMs: number): void {
    const formatted = this.formatTime(timeMs);
    const newSolve: TimerSolve = {
      id: Date.now().toString(),
      timeMs,
      formatted,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scramble: this.currentScramble(),
    };

    const updated = [newSolve, ...this.solves()];
    this.solves.set(updated);
    this.saveSolves(updated);
    this.generateNewScramble();
  }

  // ==========================================
  // FORMATTING & STATISTICS
  // ==========================================
  formatTime(ms: number): string {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hundredths = Math.floor((ms % 1000) / 10);

    const secStr = minutes > 0 ? seconds.toString().padStart(2, '0') : seconds.toString();
    const hunStr = hundredths.toString().padStart(2, '0');

    if (minutes > 0) {
      return `${minutes}:${secStr}.${hunStr}`;
    }
    return `${secStr}.${hunStr}`;
  }

  readonly bestTime = computed<string>(() => {
    const list = this.solves();
    if (list.length === 0) return '—';
    const minMs = Math.min(...list.map((s) => s.timeMs));
    return this.formatTime(minMs);
  });

  readonly ao5 = computed<string>(() => {
    const list = this.solves();
    if (list.length < 5) return '—';
    const last5 = list.slice(0, 5).map((s) => s.timeMs);
    // Sort, drop fastest and slowest, average middle 3
    last5.sort((a, b) => a - b);
    const middle3 = last5.slice(1, 4);
    const avg = middle3.reduce((a, b) => a + b, 0) / 3;
    return this.formatTime(avg);
  });

  readonly ao12 = computed<string>(() => {
    const list = this.solves();
    if (list.length < 12) return '—';
    const last12 = list.slice(0, 12).map((s) => s.timeMs);
    last12.sort((a, b) => a - b);
    const middle10 = last12.slice(1, 11);
    const avg = middle10.reduce((a, b) => a + b, 0) / 10;
    return this.formatTime(avg);
  });

  deleteSolve(id: string): void {
    const updated = this.solves().filter((s) => s.id !== id);
    this.solves.set(updated);
    this.saveSolves(updated);
  }

  clearHistory(): void {
    if (confirm(this.language() === 'bg' ? 'Сигурни ли сте, че искате да изтриете всички времена?' : 'Are you sure you want to clear solve history?')) {
      this.solves.set([]);
      this.saveSolves([]);
    }
  }

  private loadSolves(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('rubik_timer_solves');
      if (raw) {
        this.solves.set(JSON.parse(raw));
      }
    } catch {
      // Fallback
    }
  }

  private saveSolves(list: TimerSolve[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('rubik_timer_solves', JSON.stringify(list));
    } catch {
      // Quota or disabled
    }
  }

  // ==========================================
  // KEYBOARD & MOUSE EVENT LISTENERS
  // ==========================================
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      if (!this.isSpaceHeld) {
        this.isSpaceHeld = true;
        this.startHold();
      }
    } else if (this.phase() === 'running') {
      // Any key stops timer when running
      this.stopTimer();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      this.isSpaceHeld = false;
      this.releaseHold();
    }
  }
}

