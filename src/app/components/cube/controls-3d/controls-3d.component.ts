import { Component, ChangeDetectionStrategy, inject, input, output, computed } from '@angular/core';
import { StandardMove } from '../../../types/cube';
import { LanguageService } from '../../../services/language.service';
import { CubeStateService } from '../../../services/cube-state.service';

@Component({
  selector: 'app-controls-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './controls-3d.component.html',
  styleUrl: './controls-3d.component.css',
})
export class Controls3DComponent {
  private languageService = inject(LanguageService);
  readonly cubeStateService = inject(CubeStateService);
  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly Math = Math;

  explodeFactor = input<number>(0);
  animSpeed = input<number>(0.22);
  showCycleArrows = input<boolean>(true);
  isAnimating = input<boolean>(false);

  move = output<StandardMove>();
  reset = output<void>();
  scramble = output<void>();
  solve = output<void>();
  share = output<void>();
  openSettings = output<void>();
  explodeChange = output<number>();
  speedChange = output<number>();
  toggleCycleArrows = output<boolean>();
  resetCamera = output<void>();

  readonly isSolved = this.cubeStateService.isSolved;
  readonly moveHistory = this.cubeStateService.moveHistory;
  readonly redoHistory = this.cubeStateService.redoHistory;
  readonly recentMoves = computed(() => this.moveHistory().slice(-14));

  readonly sliceMoves: StandardMove[] = ['M', 'E', 'S'];

  onUndo(): void {
    this.cubeStateService.undoLastMove();
  }

  onRedo(): void {
    this.cubeStateService.redoLastMove();
  }

  readonly faces = computed(() => {
    const lang = this.language();
    return [
      { name: 'U' as StandardMove, label: lang === 'bg' ? 'U (Горе)' : 'U (Up)', color: 'bg-yellow-500 text-slate-900 border-yellow-400' },
      { name: 'D' as StandardMove, label: lang === 'bg' ? 'D (Долу)' : 'D (Down)', color: 'bg-slate-200 text-slate-900 border-slate-300' },
      { name: 'F' as StandardMove, label: lang === 'bg' ? 'F (Предна)' : 'F (Front)', color: 'bg-emerald-600 text-white border-emerald-500' },
      { name: 'B' as StandardMove, label: lang === 'bg' ? 'B (Задна)' : 'B (Back)', color: 'bg-blue-600 text-white border-blue-500' },
      { name: 'L' as StandardMove, label: lang === 'bg' ? 'L (Лява)' : 'L (Left)', color: 'bg-orange-600 text-white border-orange-500' },
      { name: 'R' as StandardMove, label: lang === 'bg' ? 'R (Дясна)' : 'R (Right)', color: 'bg-red-600 text-white border-red-500' },
    ];
  });

  onMoveClick(m: StandardMove): void {
    this.move.emit(m);
  }

  onInverseMove(name: string): void {
    this.move.emit((name + "'") as StandardMove);
  }

  onDoubleMove(name: string): void {
    this.move.emit((name + "2") as StandardMove);
  }

  onExplodeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.explodeChange.emit(val);
  }

  onSpeedInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.speedChange.emit(val);
  }
}
