import { describe, it, expect } from 'vitest';
import { CubeSolver } from './cube-solver';
import { RubikGroupAlgebra } from './group-algebra';

describe('CubeSolver (LBL Step-by-Step Solver)', () => {
  it('detects an already solved cube', () => {
    const id = RubikGroupAlgebra.createIdentityState();
    const result = CubeSolver.solve(id);

    expect(result.isAlreadySolved).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.totalMoves).toBe(0);
    expect(result.stages.length).toBe(0);
  });

  it('detects an invalid orbit cube (impossible physical state)', () => {
    const id = RubikGroupAlgebra.createIdentityState();
    const tampered = RubikGroupAlgebra.simulateCornerTwist(id, 0, 1);
    const result = CubeSolver.solve(tampered);

    expect(result.isValid).toBe(false);
    expect(result.errorBg).toContain('орбита');
  });

  it('compresses adjacent redundant moves properly', () => {
    expect(CubeSolver.compressMoves(['U', 'U'])).toEqual(['U2']);
    expect(CubeSolver.compressMoves(['R', "R'"])).toEqual([]);
    expect(CubeSolver.compressMoves(['F', 'F2'])).toEqual(["F'"]);
    expect(CubeSolver.compressMoves(['U2', 'U2'])).toEqual([]);
    expect(CubeSolver.compressMoves(['R', 'U', "U'"])).toEqual(['R']);
  });

  it('successfully solves a short scramble and returns exact stages', () => {
    const id = RubikGroupAlgebra.createIdentityState();
    const scramble = RubikGroupAlgebra.parseAlgorithm("R U R' U' F' U F");
    const state = RubikGroupAlgebra.applyAlgorithm(id, scramble);

    const result = CubeSolver.solve(state);
    expect(result.isValid).toBe(true);
    expect(result.stages.length).toBeGreaterThan(0);

    let runningState = state;
    result.stages.forEach(s => {
      runningState = RubikGroupAlgebra.applyAlgorithm(runningState, s.moves);
    });
    expect(RubikGroupAlgebra.isIdentity(runningState)).toBe(true);
  });

  it('successfully solves a classic Sune / Fish scramble', () => {
    const id = RubikGroupAlgebra.createIdentityState();
    const scramble = RubikGroupAlgebra.parseAlgorithm("R U R' U R U2 R'");
    const state = RubikGroupAlgebra.applyAlgorithm(id, scramble);

    const result = CubeSolver.solve(state);
    expect(result.isValid).toBe(true);

    const solved = RubikGroupAlgebra.applyAlgorithm(state, result.allMoves);
    expect(RubikGroupAlgebra.isIdentity(solved)).toBe(true);
  });

  it('successfully solves random scrambles of various lengths', () => {
    const testScrambles = [
      "F R U R' U' F'",
      "R U R' U' R' F R2 U' R' U' R U R' F'",
      "F2 U R2 D' B2 L2 U' R2 D F2",
      "R U2 R' D' F R' F' D R2 U'",
      "L U L' U L U2 L'",
      "F R U' R' U' R U R' F'",
      "M2 U M2 U2 M2 U M2",
    ];

    for (const scrambleStr of testScrambles) {
      const id = RubikGroupAlgebra.createIdentityState();
      const scramble = RubikGroupAlgebra.parseAlgorithm(scrambleStr);
      const state = RubikGroupAlgebra.applyAlgorithm(id, scramble);

      const result = CubeSolver.solve(state);
      expect(result.isValid).toBe(true);

      const solved = RubikGroupAlgebra.applyAlgorithm(state, result.allMoves);
      const isSolved = RubikGroupAlgebra.isIdentity(solved);
      if (!isSolved) {
        console.error(`Failed to solve scramble: "${scrambleStr}"`);
        console.log(`Generated moves (${result.totalMoves}): ${result.allMoves.join(' ')}`);
        result.stages.forEach(s => {
          console.log(`Stage ${s.stageNumber} (${s.stageId}): moves=${s.algoString}`);
        });
        solved.corners.forEach(c => {
          if (c.pos !== c.id || c.orientation !== 0) console.log(`Unsolved corner ${c.id}: pos=${c.pos}, ori=${c.orientation}`);
        });
        solved.edges.forEach(e => {
          if (e.pos !== e.id || e.orientation !== 0) console.log(`Unsolved edge ${e.id}: pos=${e.pos}, ori=${e.orientation}`);
        });
      }
      expect(isSolved).toBe(true);
    }
  }, 15000);

  it('successfully solves a classic U-Permutation scramble', () => {
    const id = RubikGroupAlgebra.createIdentityState();
    const scramble = RubikGroupAlgebra.parseAlgorithm("R U' R U R U R U' R' U' R2");
    const state = RubikGroupAlgebra.applyAlgorithm(id, scramble);

    const result = CubeSolver.solve(state);
    expect(result.isValid).toBe(true);

    const solved = RubikGroupAlgebra.applyAlgorithm(state, result.allMoves);
    expect(RubikGroupAlgebra.isIdentity(solved)).toBe(true);
  });
});
