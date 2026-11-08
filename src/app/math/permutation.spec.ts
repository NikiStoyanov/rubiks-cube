import { describe, it, expect } from 'vitest';
import { Permutation } from './permutation';

describe('Permutation Class (Group Theory S_n)', () => {
  it('creates identity permutation', () => {
    const id = Permutation.identity(8);
    expect(id.size).toBe(8);
    expect(id.isIdentity()).toBe(true);
    expect(id.getOrder()).toBe(1);
    expect(id.getParity()).toBe('even');
    expect(id.sign).toBe(1);
  });

  it('validates bijective mappings and throws on invalid permutations', () => {
    expect(() => new Permutation([0, 1, 1, 3])).toThrow();
    expect(() => new Permutation([0, 1, 5, 2])).toThrow();
    expect(Permutation.isValid([2, 0, 1])).toBe(true);
  });

  it('correctly executes composition (sigma o tau)(x) = sigma(tau(x))', () => {
    // tau: (0 -> 1 -> 2 -> 0)
    const tau = new Permutation([1, 2, 0]);
    // sigma: transposition (0 1)
    const sigma = new Permutation([1, 0, 2]);

    const comp = sigma.compose(tau);
    // comp(0) = sigma(tau(0)) = sigma(1) = 0
    // comp(1) = sigma(tau(1)) = sigma(2) = 2
    // comp(2) = sigma(tau(2)) = sigma(0) = 1
    expect(comp.mapping).toEqual([0, 2, 1]);
  });

  it('inverts permutations: sigma o sigma^-1 = id', () => {
    const p = new Permutation([3, 0, 4, 1, 2]);
    const inv = p.invert();
    const product = p.compose(inv);
    expect(product.isIdentity()).toBe(true);
  });

  it('computes powers sigma^k and negative powers', () => {
    const cycle3 = new Permutation([1, 2, 0]); // 3-cycle
    expect(cycle3.pow(0).isIdentity()).toBe(true);
    expect(cycle3.pow(1).mapping).toEqual([1, 2, 0]);
    expect(cycle3.pow(2).mapping).toEqual([2, 0, 1]);
    expect(cycle3.pow(3).isIdentity()).toBe(true);
    expect(cycle3.pow(-1).mapping).toEqual(cycle3.invert().mapping);
  });

  it('computes disjoint cycle decomposition', () => {
    // (0 2 4)(1 3) in S_5
    const p = new Permutation([2, 3, 4, 1, 0]);
    const cycles = p.getDisjointCycles();
    expect(cycles.length).toBe(2);
    expect(cycles.some((c) => c.length === 3)).toBe(true);
    expect(cycles.some((c) => c.length === 2)).toBe(true);
  });

  it('computes permutation parity (even/odd) and sign', () => {
    // Transposition (0 1) is odd (sign -1)
    const transposition = new Permutation([1, 0, 2, 3]);
    expect(transposition.getParity()).toBe('odd');
    expect(transposition.sign).toBe(-1);

    // 3-cycle (0 1 2) is even (sign +1)
    const cycle3 = new Permutation([1, 2, 0, 3]);
    expect(cycle3.getParity()).toBe('even');
    expect(cycle3.sign).toBe(1);
  });

  it('computes order ord(sigma) as LCM of cycle lengths', () => {
    // Disjoint 3-cycle and 2-cycle in S_5 -> order = lcm(3, 2) = 6
    const p = new Permutation([1, 2, 0, 4, 3]);
    expect(p.getOrder()).toBe(6);
    expect(p.pow(6).isIdentity()).toBe(true);
    expect(p.pow(1).isIdentity()).toBe(false);
    expect(p.pow(2).isIdentity()).toBe(false);
    expect(p.pow(3).isIdentity()).toBe(false);
  });

  it('identifies fixed points and moved points', () => {
    const p = new Permutation([0, 2, 1, 3]);
    expect(p.getFixedPoints()).toEqual(['0', '3']);
    expect(p.getMovedPoints()).toEqual(['1', '2']);
  });
});
