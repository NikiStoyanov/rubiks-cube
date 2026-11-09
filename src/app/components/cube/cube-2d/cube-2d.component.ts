import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceName, Facelet2D, Net2DFaces, PieceType, StandardMove } from '../../../types/cube';
import { LanguageService } from '../../../services/language.service';
import { FACE_COLORS } from '../../../math/rubikGroup';

@Component({
  selector: 'app-cube-2d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cube-2d.component.html',
  styleUrl: './cube-2d.component.css',
})
export class Cube2DComponent {
  private languageService = inject(LanguageService);
  readonly language = this.languageService.language;
  readonly t = this.languageService.t;
  readonly faceColorMap = FACE_COLORS;

  net = input<Net2DFaces | null>(null);
  selectedPieceType = input<PieceType>('corner');
  selectedPieceId = input<number>(0);
  orbitPieces = input<{ type: 'corner' | 'edge'; id: number }[]>([]);
  isAnimating = input<boolean>(false);
  active = input<boolean>(true);
  showHighlights = input<boolean>(true);

  pieceClick = output<{ type: PieceType; id: number }>();
  faceMove = output<StandardMove>();

  getFaceColor(face: string): string {
    const f = face as FaceName;
    return this.faceColorMap[f] || '#94a3b8';
  }

  getFaceGrid(face: string): Facelet2D[][] {
    const f = face as FaceName;
    const netData = this.net();
    if (netData && netData[f]) {
      return netData[f];
    }

    // Default solved 3x3 fallback
    const rows: Facelet2D[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: Facelet2D[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({
          face: f,
          row: r,
          col: c,
          color: this.getFaceColor(f),
          pieceType: r === 1 && c === 1 ? 'center' : (r === 1 || c === 1 ? 'edge' : 'corner'),
          pieceId: 0,
        });
      }
      rows.push(row);
    }
    return rows;
  }

  getFaceLabel(face: string): string {
    const isBg = this.language() === 'bg';
    switch (face) {
      case 'U': return isBg ? 'Горе' : 'Up';
      case 'D': return isBg ? 'Долу' : 'Down';
      case 'F': return isBg ? 'Предна' : 'Front';
      case 'B': return isBg ? 'Задна' : 'Back';
      case 'L': return isBg ? 'Лява' : 'Left';
      case 'R': return isBg ? 'Дясна' : 'Right';
      default: return face;
    }
  }

  getCWTitle(face: string): string {
    const isBg = this.language() === 'bg';
    return isBg ? `${face} (по часовника)` : `${face} (Clockwise)`;
  }

  getCCWTitle(face: string): string {
    const isBg = this.language() === 'bg';
    return isBg ? `${face}' (обратно на часовника)` : `${face}' (Counter-Clockwise)`;
  }

  isStickerSelected(sticker: Facelet2D): boolean {
    if (!this.showHighlights() || sticker.pieceType === 'center') return false;
    return sticker.pieceType === this.selectedPieceType() && sticker.pieceId === this.selectedPieceId();
  }

  isStickerInOrbit(sticker: Facelet2D): boolean {
    if (!this.showHighlights() || sticker.pieceType === 'center') return false;
    return this.orbitPieces().some((p) => p.type === sticker.pieceType && p.id === sticker.pieceId);
  }

  getStickerClasses(sticker: Facelet2D): string {
    if (this.isStickerSelected(sticker)) {
      return 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-md shadow-cyan-500/50 z-20';
    }
    if (this.isStickerInOrbit(sticker)) {
      return 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-100 shadow-sm shadow-amber-400/40 z-10';
    }
    return 'hover:scale-105 hover:ring-1 hover:ring-white/40 active:scale-95';
  }

  getStickerTooltip(sticker: Facelet2D): string {
    const isBg = this.language() === 'bg';
    if (sticker.pieceType === 'center') {
      return `${isBg ? 'Център' : 'Center'} ${sticker.face}`;
    }
    const typeLabel = sticker.pieceType === 'corner'
      ? (isBg ? 'Връх' : 'Corner')
      : (isBg ? 'Ръб' : 'Edge');
    return `${typeLabel} #${sticker.pieceId} (${sticker.name || ''})`;
  }

  onStickerClick(sticker: Facelet2D): void {
    if (this.showHighlights() && sticker.pieceType !== 'center') {
      this.pieceClick.emit({
        type: sticker.pieceType,
        id: sticker.pieceId,
      });
    }
  }

  onFaceRotateCW(face: string): void {
    const move = face as StandardMove;
    this.faceMove.emit(move);
  }

  onFaceRotateCCW(face: string): void {
    const move = `${face}'` as StandardMove;
    this.faceMove.emit(move);
  }
}
