import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CubeStateService } from './cube-state.service';
import { RubikGroupAlgebra } from '../math/group-algebra';

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
});
