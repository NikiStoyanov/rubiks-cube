import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CubeStateService } from './cube-state.service';
import { RubikGroupAlgebra, FACE_COLORS } from '../math/group-algebra';

describe('CubeStateService (Reactive Signals & Separation of Concerns)', () => {
  let service: CubeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CubeStateService],
    });
    service = TestBed.inject(CubeStateService);
  });

  it('initializes with identity state e and isSolved = true', () => {
    expect(service.isSolved()).toBe(true);
    expect(service.lastMove()).toBe('e (Identity)');
    expect(RubikGroupAlgebra.isIdentity(service.cubeState())).toBe(true);
  });

  it('reactively updates cubeState, previousState, and isSolved on applyMove', () => {
    expect(service.isSolved()).toBe(true);

    service.applyMove('R');

    expect(service.isSolved()).toBe(false);
    expect(service.lastMove()).toBe('R');
    expect(RubikGroupAlgebra.isIdentity(service.previousState())).toBe(true);
    expect(RubikGroupAlgebra.isIdentity(service.cubeState())).toBe(false);
    expect(service.moveHistory()).toEqual(['R']);

    // Computed analysis signal should reactively reflect the R move
    const analysis = service.analysis();
    expect(analysis).not.toBeNull();
    expect(analysis?.move).toBe('R');
    expect(analysis?.order).toBe(4); // ord(R) = 4
  });

  it('returns to solved state when applying inverse move', () => {
    service.applyMove('U');
    expect(service.isSolved()).toBe(false);

    service.applyMove("U'");
    expect(service.isSolved()).toBe(true);
    expect(service.moveHistory()).toEqual(['U', "U'"]);
  });

  it('executes algorithms and updates state', () => {
    service.applyAlgorithm("R U R' U'");
    expect(service.isSolved()).toBe(false);
    expect(service.lastMove()).toBe("R U R' U'");

    // Cauchy analysis computed signal should react
    const cauchy = service.cauchyAnalysis();
    expect(cauchy).not.toBeNull();
    expect(cauchy?.order).toBe(6);
    expect(cauchy?.primeDivisors).toEqual([2, 3]);
  });

  it('resets state to identity e cleanly', () => {
    service.applyMove('F');
    service.applyMove('B');
    expect(service.isSolved()).toBe(false);

    service.reset();
    expect(service.isSolved()).toBe(true);
    expect(service.lastMove()).toBe('e (Identity)');
    expect(service.moveHistory()).toEqual([]);
  });

  it('scrambles the cube with specified turn count', () => {
    const scrambleMoves = service.scramble(15);
    expect(scrambleMoves.length).toBe(15);
    expect(service.lastMove()).toContain('Scramble (15 turns)');
    expect(service.moveHistory().length).toBe(15);
    expect(service.isSolved()).toBe(false);
  });

  it('reactively updates 2D net unfolded layout when cube moves', () => {
    const initialNet = service.net2DFaces();
    expect(initialNet.U[1][1].face).toBe('U');

    service.applyMove('F');
    const updatedNet = service.net2DFaces();
    expect(updatedNet).toBeDefined();
    // After F turn, U layer facelets adjacent to F (row 2) change color
    expect(updatedNet.U[2][1].color).not.toBe(initialNet.U[2][1].color);
  });

  it('reactively computes orbit pieces based on active subgroup and selected piece', () => {
    service.setSelectedPiece('corner', 0);
    service.setActiveSubgroup('full');
    expect(service.orbitPieces().length).toBe(8);

    // Klein 4 subgroup <R2, U2> has a smaller orbit
    service.setActiveSubgroup('klein4');
    expect(service.orbitPieces().length).toBeLessThan(8);
  });

  it('handles state tampering and updates orbitValidation reactively', () => {
    expect(service.orbitValidation().isValidOrbit).toBe(true);

    service.tamperState('twist');
    expect(service.orbitValidation().isValidOrbit).toBe(false);
    expect(service.orbitValidation().isCornerTwistValid).toBe(false);

    service.tamperState('repair');
    expect(service.orbitValidation().isValidOrbit).toBe(true);
  });

  it('emits animation request via RxJS stream when applyMove is called', () => {
    let emittedMove = '';
    const sub = service.moveRequest$.subscribe((req) => {
      emittedMove = req.move;
    });

    service.applyMove('L');
    expect(emittedMove).toBe('L');
    sub.unsubscribe();
  });

  it('allows painting stickers directly on customNet and broadcasts netSync', () => {
    let syncCalled = false;
    const sub = service.netSync$.subscribe((net) => {
      syncCalled = true;
      expect(net.F[0][0].color).toBe('#ef4444');
    });

    service.setActiveBrushColor('R'); // Red: #ef4444
    service.paintSticker('F', 0, 0);

    expect(service.customNet().F[0][0].color).toBe('#ef4444');
    expect(syncCalled).toBe(true);
    sub.unsubscribe();
  });

  it('allows painting centers without locking them', () => {
    service.setActiveBrushColor('U'); // Yellow: #eab308
    service.paintSticker('F', 1, 1);

    expect(service.customNet().F[1][1].color).toBe('#eab308');
  });

  it('correctly serializes and deserializes 54-facelet state representation', () => {
    const solvedStr = service.get54FaceletString();
    expect(solvedStr.length).toBe(54);
    // Solved state has 9 of each face letter: U, D, F, B, L, R
    expect(solvedStr.startsWith('UUUUUUUUU')).toBe(true);

    const net = service.parse54FaceletString(solvedStr);
    expect(net).not.toBeNull();
    expect(net?.U[0][0].color).toBe(FACE_COLORS.U);

    // Invalid length returns null
    expect(service.parse54FaceletString('INVALID')).toBeNull();
  });

  it('generates share URL and loads state from URL query parameters', () => {
    service.applyMove('R');
    service.applyMove('U');

    const shareUrl = service.getShareUrl();
    expect(shareUrl).toContain('state=');
    expect(shareUrl).toContain('moves=R_U');

    // Reset service and load from that URL
    service.reset();
    expect(service.isSolved()).toBe(true);

    const loaded = service.loadStateFromUrl(shareUrl);
    expect(loaded).toBe(true);
    expect(service.isSolved()).toBe(false);
  });

  it('supports undoLastMove and redoLastMove with moveHistory and redoHistory', () => {
    service.applyMove('R');
    service.applyMove('U');
    expect(service.moveHistory()).toEqual(['R', 'U']);
    expect(service.redoHistory()).toEqual([]);

    service.undoLastMove();
    expect(service.moveHistory()).toEqual(['R']);
    expect(service.redoHistory()).toEqual(['U']);

    service.undoLastMove();
    expect(service.isSolved()).toBe(true);
    expect(service.moveHistory()).toEqual([]);
    expect(service.redoHistory()).toEqual(['R', 'U']);

    service.redoLastMove();
    expect(service.isSolved()).toBe(false);
    expect(service.moveHistory()).toEqual(['R']);
    expect(service.redoHistory()).toEqual(['U']);
  });
});
