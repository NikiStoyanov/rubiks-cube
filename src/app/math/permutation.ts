import { DisjointCycle } from '../types/cube';

/**
 * Pure mathematical Permutation class representing an element of the symmetric group S_n.
 * Supports composition, inverse, disjoint cycle decomposition, parity (sign),
 * element order, and powers.
 */
export class Permutation {
  /**
   * @param mapping Array where mapping[i] is the target image of element i (0-indexed).
   */
  constructor(public readonly mapping: readonly number[]) {
    if (!Permutation.isValid(mapping)) {
      throw new Error(`Invalid permutation mapping: [${mapping.join(', ')}]`);
    }
  }

  /**
   * Number of elements permuted (degree of S_n).
   */
  get size(): number {
    return this.mapping.length;
  }

  /**
   * Check if mapping is a valid bijection of {0, 1, ..., n-1}.
   */
  static isValid(mapping: readonly number[]): boolean {
    const n = mapping.length;
    const seen = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const v = mapping[i];
      if (v < 0 || v >= n || seen[v]) return false;
      seen[v] = 1;
    }
    return true;
  }

  /**
   * Identity permutation in S_n.
   */
  static identity(size: number): Permutation {
    const mapping = new Array<number>(size);
    for (let i = 0; i < size; i++) mapping[i] = i;
    return new Permutation(mapping);
  }

  /**
   * Create a permutation from a single cycle (e.g. (0, 1, 5, 4) in S_8).
   */
  static fromCycle(size: number, cycle: number[]): Permutation {
    const mapping = new Array<number>(size);
    for (let i = 0; i < size; i++) mapping[i] = i;
    for (let i = 0; i < cycle.length; i++) {
      const from = cycle[i];
      const to = cycle[(i + 1) % cycle.length];
      mapping[from] = to;
    }
    return new Permutation(mapping);
  }

  /**
   * Create a permutation from multiple disjoint cycles.
   */
  static fromDisjointCycles(size: number, cycles: number[][]): Permutation {
    const mapping = new Array<number>(size);
    for (let i = 0; i < size; i++) mapping[i] = i;
    for (const cycle of cycles) {
      for (let i = 0; i < cycle.length; i++) {
        const from = cycle[i];
        const to = cycle[(i + 1) % cycle.length];
        mapping[from] = to;
      }
    }
    return new Permutation(mapping);
  }

  /**
   * Act on an element x: returns \sigma(x).
   */
  act(x: number): number {
    return this.mapping[x];
  }

  /**
   * Compose this permutation with another: (\sigma \circ \tau)(x) = \sigma(\tau(x)).
   */
  compose(other: Permutation): Permutation {
    if (this.size !== other.size) {
      throw new Error(`Permutation size mismatch: ${this.size} vs ${other.size}`);
    }
    const result = new Array<number>(this.size);
    for (let i = 0; i < this.size; i++) {
      result[i] = this.mapping[other.mapping[i]];
    }
    return new Permutation(result);
  }

  /**
   * Compute inverse permutation \sigma^{-1}.
   */
  invert(): Permutation {
    const inv = new Array<number>(this.size);
    for (let i = 0; i < this.size; i++) {
      inv[this.mapping[i]] = i;
    }
    return new Permutation(inv);
  }

  /**
   * Compute power \sigma^k for any integer k.
   */
  pow(exp: number): Permutation {
    if (exp === 0) return Permutation.identity(this.size);
    if (exp < 0) return this.invert().pow(-exp);

    let base: Permutation = this;
    let result = Permutation.identity(this.size);
    let n = exp;

    while (n > 0) {
      if (n % 2 === 1) {
        result = result.compose(base);
      }
      base = base.compose(base);
      n = Math.floor(n / 2);
    }
    return result;
  }

  /**
   * Checks whether this is the identity permutation id.
   */
  isIdentity(): boolean {
    for (let i = 0; i < this.size; i++) {
      if (this.mapping[i] !== i) return false;
    }
    return true;
  }

  /**
   * Computes the disjoint cycle decomposition of the permutation.
   * Cycles of length 1 (fixed points) are omitted by default unless includeFixed is true.
   */
  getDisjointCycles(labels?: string[], includeFixed = false): DisjointCycle[] {
    const visited = new Uint8Array(this.size);
    const cycles: DisjointCycle[] = [];

    for (let i = 0; i < this.size; i++) {
      if (visited[i]) continue;

      const currentCycle: number[] = [];
      let curr = i;
      while (!visited[curr]) {
        visited[curr] = 1;
        currentCycle.push(curr);
        curr = this.mapping[curr];
      }

      if (currentCycle.length > 1 || includeFixed) {
        cycles.push({
          elements: currentCycle.map((idx) => (labels ? labels[idx] : String(idx))),
          length: currentCycle.length,
        });
      }
    }

    return cycles;
  }

  /**
   * Inversion count of the permutation.
   */
  getInversionCount(): number {
    let count = 0;
    const n = this.size;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.mapping[i] > this.mapping[j]) count++;
      }
    }
    return count;
  }

  /**
   * Permutation Parity: 'even' (+1) or 'odd' (-1).
   * A permutation is even if and only if it decomposes into an even number of transpositions.
   */
  getParity(): 'even' | 'odd' {
    return this.getInversionCount() % 2 === 0 ? 'even' : 'odd';
  }

  /**
   * Numerical sign / signature sgn(\sigma) \in {+1, -1}.
   */
  get sign(): number {
    return this.getParity() === 'even' ? 1 : -1;
  }

  /**
   * Exact order ord(\sigma) of the permutation in S_n.
   * Calculated as the Least Common Multiple (LCM) of the lengths of its disjoint cycles.
   */
  getOrder(): number {
    const cycles = this.getDisjointCycles();
    if (cycles.length === 0) return 1;

    let res = cycles[0].length;
    for (let i = 1; i < cycles.length; i++) {
      res = Permutation.lcm(res, cycles[i].length);
    }
    return res;
  }

  /**
   * Returns all fixed points (elements where \sigma(i) = i).
   */
  getFixedPoints(labels?: string[]): string[] {
    const res: string[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.mapping[i] === i) {
        res.push(labels ? labels[i] : String(i));
      }
    }
    return res;
  }

  /**
   * Returns all moved points (elements where \sigma(i) \ne i).
   */
  getMovedPoints(labels?: string[]): string[] {
    const res: string[] = [];
    for (let i = 0; i < this.size; i++) {
      if (this.mapping[i] !== i) {
        res.push(labels ? labels[i] : String(i));
      }
    }
    return res;
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : Permutation.gcd(b, a % b);
  }

  static lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a * b) / Permutation.gcd(a, b));
  }
}
