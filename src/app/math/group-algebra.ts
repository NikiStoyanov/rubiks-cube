import {
  CornerPiece,
  EdgePiece,
  CenterPiece,
  CubeState,
  FaceName,
  StandardMove,
  MoveAnalysis,
  Net2DFaces,
  Facelet2D,
  PieceType,
  SubgroupPreset,
  AlgorithmPreset,
} from '../types/cube';
import { Permutation } from './permutation';

export const FACE_COLORS: Record<FaceName, string> = {
  U: '#eab308', // Yellow (Top face in standard speedcubing & CFOP/LBL)
  D: '#f8fafc', // White (Bottom face / First Layer)
  F: '#22c55e', // Green
  B: '#3b82f6', // Blue
  L: '#f97316', // Orange
  R: '#ef4444', // Red
};

export const FACE_NAMES: readonly FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];

export const INITIAL_CORNERS: readonly Omit<CornerPiece, 'pos' | 'orientation'>[] = [
  { id: 0, name: 'UFL', homePos: { x: -1, y: 1, z: 1 }, faces: ['U', 'F', 'L'] },
  { id: 1, name: 'UFR', homePos: { x: 1, y: 1, z: 1 }, faces: ['U', 'F', 'R'] },
  { id: 2, name: 'UBR', homePos: { x: 1, y: 1, z: -1 }, faces: ['U', 'B', 'R'] },
  { id: 3, name: 'UBL', homePos: { x: -1, y: 1, z: -1 }, faces: ['U', 'B', 'L'] },
  { id: 4, name: 'DFL', homePos: { x: -1, y: -1, z: 1 }, faces: ['D', 'F', 'L'] },
  { id: 5, name: 'DFR', homePos: { x: 1, y: -1, z: 1 }, faces: ['D', 'F', 'R'] },
  { id: 6, name: 'DBR', homePos: { x: 1, y: -1, z: -1 }, faces: ['D', 'B', 'R'] },
  { id: 7, name: 'DBL', homePos: { x: -1, y: -1, z: -1 }, faces: ['D', 'B', 'L'] },
];

export const INITIAL_EDGES: readonly Omit<EdgePiece, 'pos' | 'orientation'>[] = [
  { id: 0, name: 'UF', homePos: { x: 0, y: 1, z: 1 }, faces: ['U', 'F'] },
  { id: 1, name: 'UR', homePos: { x: 1, y: 1, z: 0 }, faces: ['U', 'R'] },
  { id: 2, name: 'UB', homePos: { x: 0, y: 1, z: -1 }, faces: ['U', 'B'] },
  { id: 3, name: 'UL', homePos: { x: -1, y: 1, z: 0 }, faces: ['U', 'L'] },
  { id: 4, name: 'FL', homePos: { x: -1, y: 0, z: 1 }, faces: ['F', 'L'] },
  { id: 5, name: 'FR', homePos: { x: 1, y: 0, z: 1 }, faces: ['F', 'R'] },
  { id: 6, name: 'BR', homePos: { x: 1, y: 0, z: -1 }, faces: ['B', 'R'] },
  { id: 7, name: 'BL', homePos: { x: -1, y: 0, z: -1 }, faces: ['B', 'L'] },
  { id: 8, name: 'DF', homePos: { x: 0, y: -1, z: 1 }, faces: ['D', 'F'] },
  { id: 9, name: 'DR', homePos: { x: 1, y: -1, z: 0 }, faces: ['D', 'R'] },
  { id: 10, name: 'DB', homePos: { x: 0, y: -1, z: -1 }, faces: ['D', 'B'] },
  { id: 11, name: 'DL', homePos: { x: -1, y: -1, z: 0 }, faces: ['D', 'L'] },
];

export const INITIAL_CENTERS: readonly CenterPiece[] = [
  { id: 0, name: 'U', homePos: { x: 0, y: 1, z: 0 } },
  { id: 1, name: 'D', homePos: { x: 0, y: -1, z: 0 } },
  { id: 2, name: 'F', homePos: { x: 0, y: 0, z: 1 } },
  { id: 3, name: 'B', homePos: { x: 0, y: 0, z: -1 } },
  { id: 4, name: 'L', homePos: { x: -1, y: 0, z: 0 } },
  { id: 5, name: 'R', homePos: { x: 1, y: 0, z: 0 } },
];

export interface FaceTurnDef {
  cornerCycle: [number, number, number, number];
  cornerDeltaO: [number, number, number, number];
  edgeCycle: [number, number, number, number];
  edgeFlip: [number, number, number, number];
}

export const BASE_TURNS: Record<FaceName, FaceTurnDef> = {
  U: {
    cornerCycle: [0, 3, 2, 1],
    cornerDeltaO: [0, 0, 0, 0],
    edgeCycle: [0, 3, 2, 1],
    edgeFlip: [0, 0, 0, 0],
  },
  D: {
    cornerCycle: [4, 5, 6, 7],
    cornerDeltaO: [0, 0, 0, 0],
    edgeCycle: [8, 9, 10, 11],
    edgeFlip: [0, 0, 0, 0],
  },
  F: {
    cornerCycle: [0, 1, 5, 4],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [0, 5, 8, 4],
    edgeFlip: [1, 1, 1, 1],
  },
  B: {
    cornerCycle: [2, 3, 7, 6],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [2, 7, 10, 6],
    edgeFlip: [1, 1, 1, 1],
  },
  L: {
    cornerCycle: [3, 0, 4, 7],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [3, 4, 11, 7],
    edgeFlip: [0, 0, 0, 0],
  },
  R: {
    cornerCycle: [1, 2, 6, 5],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [1, 6, 9, 5],
    edgeFlip: [0, 0, 0, 0],
  },
};

/**
 * Result structure for verifying Cauchy's Theorem on a group element g.
 */
export interface CauchyTheoremWitness {
  element: string;
  order: number;
  primeDivisors: number[];
  subgroups: {
    prime: number;
    witnessAlgorithm: string;
    witnessOrder: number;
    isSubgroupGenerated: boolean;
  }[];
}

export interface OrbitValidationResult {
  isValidOrbit: boolean;
  cornerTwistSum: number;
  isCornerTwistValid: boolean;
  edgeFlipSum: number;
  isEdgeFlipValid: boolean;
  cornerParity: 'even' | 'odd';
  edgeParity: 'even' | 'odd';
  isParityValid: boolean;
  cosetIndex: number;
  totalPhysicalStates: string;
  validOrbitStates: string;
  solvabilityProbability: string;
}

export interface ReconstructionResult {
  success: boolean;
  state?: CubeState;
  errors: string[];
  colorCounts: Record<FaceName, number>;
  isValidColorCount: boolean;
  orbitValidation?: OrbitValidationResult;
  invalidPieces: {
    type: 'corner' | 'edge';
    slotName: string;
    faces: FaceName[];
    colors: string[];
    reason: string;
  }[];
}

/**
 * Pure Algebraic Core for Rubik's Group G.
 * Operates purely on algebraic structures (permutations, group actions, cosets, invariants).
 */
export class RubikGroupAlgebra {
  /**
   * The order of the Rubik's Cube Group:
   * |G| = 2^27 * 3^14 * 5^3 * 7^2 * 11 = 43,252,003,274,489,856,000.
   */
  static readonly GROUP_ORDER_BIGINT = 43252003274489856000n;
  static readonly PRIME_DIVISORS: readonly number[] = [2, 3, 5, 7, 11];

  /**
   * Factory for creating initial identity state e \in G.
   */
  static createIdentityState(): CubeState {
    return {
      corners: INITIAL_CORNERS.map((c) => ({
        ...c,
        pos: c.id,
        orientation: 0,
      })),
      edges: INITIAL_EDGES.map((e) => ({
        ...e,
        pos: e.id,
        orientation: 0,
      })),
      centers: INITIAL_CENTERS.map((c) => ({ ...c })),
    };
  }

  /**
   * Deep clone of a cube state.
   */
  static cloneState(state: CubeState): CubeState {
    return {
      corners: state.corners.map((c) => ({ ...c })),
      edges: state.edges.map((e) => ({ ...e })),
      centers: state.centers.map((c) => ({ ...c })),
    };
  }

  /**
   * Check if state is equal to identity e (or to another state).
   */
  static isIdentity(state: CubeState, reference: CubeState = RubikGroupAlgebra.createIdentityState()): boolean {
    for (let i = 0; i < 8; i++) {
      if (
        state.corners[i].pos !== reference.corners[i].pos ||
        state.corners[i].orientation !== reference.corners[i].orientation
      ) {
        return false;
      }
    }
    for (let i = 0; i < 12; i++) {
      if (
        state.edges[i].pos !== reference.edges[i].pos ||
        state.edges[i].orientation !== reference.edges[i].orientation
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Apply a single clockwise base face turn.
   */
  static applyBaseTurn(state: CubeState, face: FaceName): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const def = BASE_TURNS[face];

    const cornerAtPos = new Array<number>(8).fill(-1);
    state.corners.forEach((c) => {
      cornerAtPos[c.pos] = c.id;
    });

    const [c0, c1, c2, c3] = def.cornerCycle;
    const [do0, do1, do2, do3] = def.cornerDeltaO;

    const id0 = cornerAtPos[c0];
    const id1 = cornerAtPos[c1];
    const id2 = cornerAtPos[c2];
    const id3 = cornerAtPos[c3];

    next.corners[id0].pos = c1;
    next.corners[id0].orientation = (next.corners[id0].orientation + do0) % 3;

    next.corners[id1].pos = c2;
    next.corners[id1].orientation = (next.corners[id1].orientation + do1) % 3;

    next.corners[id2].pos = c3;
    next.corners[id2].orientation = (next.corners[id2].orientation + do2) % 3;

    next.corners[id3].pos = c0;
    next.corners[id3].orientation = (next.corners[id3].orientation + do3) % 3;

    const edgeAtPos = new Array<number>(12).fill(-1);
    state.edges.forEach((e) => {
      edgeAtPos[e.pos] = e.id;
    });

    const [e0, e1, e2, e3] = def.edgeCycle;
    const [ef0, ef1, ef2, ef3] = def.edgeFlip;

    const eid0 = edgeAtPos[e0];
    const eid1 = edgeAtPos[e1];
    const eid2 = edgeAtPos[e2];
    const eid3 = edgeAtPos[e3];

    next.edges[eid0].pos = e1;
    next.edges[eid0].orientation = (next.edges[eid0].orientation + ef0) % 2;

    next.edges[eid1].pos = e2;
    next.edges[eid1].orientation = (next.edges[eid1].orientation + ef1) % 2;

    next.edges[eid2].pos = e3;
    next.edges[eid2].orientation = (next.edges[eid2].orientation + ef2) % 2;

    next.edges[eid3].pos = e0;
    next.edges[eid3].orientation = (next.edges[eid3].orientation + ef3) % 2;

    return next;
  }

  /**
   * Apply any standard move (face turns or slices) algebraically.
   */
  static applyMove(state: CubeState, move: StandardMove | string): CubeState {
    let s = RubikGroupAlgebra.cloneState(state);
    const cleanMove = move.trim();

    if (cleanMove.startsWith('M')) {
      const times = cleanMove === "M'" ? 3 : cleanMove === 'M2' ? 2 : 1;
      for (let i = 0; i < times; i++) s = RubikGroupAlgebra.applySliceM(s);
      return s;
    }
    if (cleanMove.startsWith('E')) {
      const times = cleanMove === "E'" ? 3 : cleanMove === 'E2' ? 2 : 1;
      for (let i = 0; i < times; i++) s = RubikGroupAlgebra.applySliceE(s);
      return s;
    }
    if (cleanMove.startsWith('S')) {
      const times = cleanMove === "S'" ? 3 : cleanMove === 'S2' ? 2 : 1;
      for (let i = 0; i < times; i++) s = RubikGroupAlgebra.applySliceS(s);
      return s;
    }

    const face = cleanMove[0] as FaceName;
    if (!BASE_TURNS[face]) return s;

    const isInverse = cleanMove.includes("'");
    const isDouble = cleanMove.includes('2');
    const count = isDouble ? 2 : isInverse ? 3 : 1;

    for (let i = 0; i < count; i++) {
      s = RubikGroupAlgebra.applyBaseTurn(s, face);
    }
    return s;
  }

  private static applySliceM(state: CubeState): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const edgeAtPos = new Array<number>(12).fill(-1);
    state.edges.forEach((e) => (edgeAtPos[e.pos] = e.id));

    const [e0, e1, e2, e3] = [0, 8, 10, 2];
    const [eid0, eid1, eid2, eid3] = [edgeAtPos[e0], edgeAtPos[e1], edgeAtPos[e2], edgeAtPos[e3]];

    next.edges[eid0].pos = e1;
    next.edges[eid0].orientation = (next.edges[eid0].orientation + 1) % 2;
    next.edges[eid1].pos = e2;
    next.edges[eid1].orientation = (next.edges[eid1].orientation + 1) % 2;
    next.edges[eid2].pos = e3;
    next.edges[eid2].orientation = (next.edges[eid2].orientation + 1) % 2;
    next.edges[eid3].pos = e0;
    next.edges[eid3].orientation = (next.edges[eid3].orientation + 1) % 2;

    return next;
  }

  private static applySliceE(state: CubeState): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const edgeAtPos = new Array<number>(12).fill(-1);
    state.edges.forEach((e) => (edgeAtPos[e.pos] = e.id));

    const [e0, e1, e2, e3] = [4, 7, 6, 5];
    const [eid0, eid1, eid2, eid3] = [edgeAtPos[e0], edgeAtPos[e1], edgeAtPos[e2], edgeAtPos[e3]];

    next.edges[eid0].pos = e1;
    next.edges[eid0].orientation = (next.edges[eid0].orientation + 1) % 2;
    next.edges[eid1].pos = e2;
    next.edges[eid1].orientation = (next.edges[eid1].orientation + 1) % 2;
    next.edges[eid2].pos = e3;
    next.edges[eid2].orientation = (next.edges[eid2].orientation + 1) % 2;
    next.edges[eid3].pos = e0;
    next.edges[eid3].orientation = (next.edges[eid3].orientation + 1) % 2;

    return next;
  }

  private static applySliceS(state: CubeState): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const edgeAtPos = new Array<number>(12).fill(-1);
    state.edges.forEach((e) => (edgeAtPos[e.pos] = e.id));

    const [e0, e1, e2, e3] = [1, 9, 11, 3];
    const [eid0, eid1, eid2, eid3] = [edgeAtPos[e0], edgeAtPos[e1], edgeAtPos[e2], edgeAtPos[e3]];

    next.edges[eid0].pos = e1;
    next.edges[eid0].orientation = (next.edges[eid0].orientation + 1) % 2;
    next.edges[eid1].pos = e2;
    next.edges[eid1].orientation = (next.edges[eid1].orientation + 1) % 2;
    next.edges[eid2].pos = e3;
    next.edges[eid2].orientation = (next.edges[eid2].orientation + 1) % 2;
    next.edges[eid3].pos = e0;
    next.edges[eid3].orientation = (next.edges[eid3].orientation + 1) % 2;

    return next;
  }

  /**
   * Parse an algorithm string into standard moves.
   */
  static parseAlgorithm(alg: string): StandardMove[] {
    if (!alg) return [];
    const regex = /([UDFBLRMES]['2]?)/gi;
    const matches = alg.match(regex);
    if (!matches) return [];
    return matches.map((m) => {
      const face = m[0].toUpperCase();
      const rest = m.slice(1);
      return `${face}${rest}` as StandardMove;
    });
  }

  /**
   * Apply an algorithm (sequence of moves) algebraically.
   */
  static applyAlgorithm(state: CubeState, alg: string | readonly StandardMove[]): CubeState {
    const moves = typeof alg === 'string' ? RubikGroupAlgebra.parseAlgorithm(alg) : alg;
    let current = state;
    for (const m of moves) {
      current = RubikGroupAlgebra.applyMove(current, m);
    }
    return current;
  }

  /**
   * Invert an algorithm: (g_1 g_2 ... g_k)^{-1} = g_k^{-1} ... g_1^{-1}.
   */
  static invertAlgorithm(alg: string | readonly StandardMove[]): string {
    const moves = typeof alg === 'string' ? RubikGroupAlgebra.parseAlgorithm(alg) : alg;
    const invMoves = moves.slice().reverse().map((m) => {
      if (m.endsWith('2')) return m;
      if (m.endsWith("'")) return m[0] as StandardMove;
      return `${m}'` as StandardMove;
    });
    return invMoves.join(' ');
  }

  /**
   * Construct group commutator [A, B] = A B A^{-1} B^{-1}.
   */
  static makeCommutator(algoA: string, algoB: string): string {
    const invA = RubikGroupAlgebra.invertAlgorithm(algoA);
    const invB = RubikGroupAlgebra.invertAlgorithm(algoB);
    return `${algoA} ${algoB} ${invA} ${invB}`.trim();
  }

  /**
   * Construct conjugate A B A^{-1}.
   */
  static makeConjugate(setupA: string, opB: string): string {
    const invA = RubikGroupAlgebra.invertAlgorithm(setupA);
    return `${setupA} ${opB} ${invA}`.trim();
  }

  /**
   * Compute exact element order ord(g) in the Rubik's cube group.
   * Max possible order in G is 1260.
   */
  static computeElementOrder(algo: string): number {
    const moves = RubikGroupAlgebra.parseAlgorithm(algo);
    if (moves.length === 0) return 1;

    const initial = RubikGroupAlgebra.createIdentityState();
    let current = RubikGroupAlgebra.cloneState(initial);
    let order = 0;

    for (let k = 1; k <= 1260; k++) {
      current = RubikGroupAlgebra.applyAlgorithm(current, moves);
      if (RubikGroupAlgebra.isIdentity(current, initial)) {
        order = k;
        break;
      }
    }

    return order > 0 ? order : 1260;
  }

  /**
   * Construct the Permutation object representing the action on corners.
   */
  static getCornerPermutation(beforeState: CubeState, afterState: CubeState): Permutation {
    const cornerAtBefore = new Array<number>(8).fill(0);
    beforeState.corners.forEach((c) => (cornerAtBefore[c.pos] = c.id));

    const mapping = new Array<number>(8);
    for (let p = 0; p < 8; p++) {
      const id = cornerAtBefore[p];
      mapping[p] = afterState.corners[id].pos;
    }
    return new Permutation(mapping);
  }

  /**
   * Construct the Permutation object representing the action on edges.
   */
  static getEdgePermutation(beforeState: CubeState, afterState: CubeState): Permutation {
    const edgeAtBefore = new Array<number>(12).fill(0);
    beforeState.edges.forEach((e) => (edgeAtBefore[e.pos] = e.id));

    const mapping = new Array<number>(12);
    for (let p = 0; p < 12; p++) {
      const id = edgeAtBefore[p];
      mapping[p] = afterState.edges[id].pos;
    }
    return new Permutation(mapping);
  }

  /**
   * Analyze the transformation between two states.
   */
  static analyzeTransformation(
    beforeState: CubeState,
    afterState: CubeState,
    moveName: string
  ): MoveAnalysis {
    const cornerLabels = INITIAL_CORNERS.map((c) => c.name);
    const edgeLabels = INITIAL_EDGES.map((e) => e.name);

    const cornerPerm = RubikGroupAlgebra.getCornerPermutation(beforeState, afterState);
    const edgePerm = RubikGroupAlgebra.getEdgePermutation(beforeState, afterState);

    const cornerCycles = cornerPerm.getDisjointCycles(cornerLabels);
    const edgeCycles = edgePerm.getDisjointCycles(edgeLabels);

    const fixedCorners: string[] = [];
    const affectedCorners: string[] = [];
    for (let i = 0; i < 8; i++) {
      const cBefore = beforeState.corners[i];
      const cAfter = afterState.corners[i];
      if (cBefore.pos === cAfter.pos && cBefore.orientation === cAfter.orientation) {
        fixedCorners.push(cBefore.name);
      } else {
        affectedCorners.push(cBefore.name);
      }
    }

    const fixedEdges: string[] = [];
    const affectedEdges: string[] = [];
    for (let i = 0; i < 12; i++) {
      const eBefore = beforeState.edges[i];
      const eAfter = afterState.edges[i];
      if (eBefore.pos === eAfter.pos && eBefore.orientation === eAfter.orientation) {
        fixedEdges.push(eBefore.name);
      } else {
        affectedEdges.push(eBefore.name);
      }
    }

    const order = RubikGroupAlgebra.computeElementOrder(moveName);

    return {
      move: moveName,
      cornerCycles,
      edgeCycles,
      stickerCycles: [],
      parity: cornerPerm.getParity(),
      order,
      fixedCorners,
      fixedEdges,
      affectedCorners,
      affectedEdges,
    };
  }

  // =========================================================================
  // CAUCHY'S THEOREM VERIFICATION (GROUP THEORY)
  // =========================================================================

  /**
   * Given an algorithm representing an element g in G, verify Cauchy's Theorem on the
   * cyclic subgroup H = <g> <= G:
   *
   * "If p is a prime dividing |H| = ord(g), then H contains an element of order p."
   * Specifically, h = g^(ord(g) / p) generates a cyclic subgroup of order p,
   * satisfying h^p = e and h^k != e for 1 <= k < p.
   */
  static verifyCauchyTheorem(algo: string): CauchyTheoremWitness {
    const order = RubikGroupAlgebra.computeElementOrder(algo);
    const primeDivisors = RubikGroupAlgebra.getPrimeFactors(order);

    const subgroups = primeDivisors.map((prime) => {
      const power = order / prime;
      // Build algorithm string for g^power
      const witnessAlgorithm = RubikGroupAlgebra.repeatAlgorithm(algo, power);
      const witnessOrder = RubikGroupAlgebra.computeElementOrder(witnessAlgorithm);

      return {
        prime,
        witnessAlgorithm,
        witnessOrder,
        isSubgroupGenerated: witnessOrder === prime,
      };
    });

    return {
      element: algo,
      order,
      primeDivisors,
      subgroups,
    };
  }

  /**
   * Helper to repeat an algorithm k times.
   */
  static repeatAlgorithm(algo: string, times: number): string {
    const moves = RubikGroupAlgebra.parseAlgorithm(algo);
    const repeated: StandardMove[] = [];
    for (let i = 0; i < times; i++) {
      repeated.push(...moves);
    }
    return repeated.join(' ');
  }

  /**
   * Helper to compute prime factors of an integer.
   */
  static getPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let d = 2;
    let temp = n;
    while (temp > 1) {
      if (temp % d === 0) {
        if (!factors.includes(d)) factors.push(d);
        temp = Math.floor(temp / d);
      } else {
        d++;
        if (d * d > temp) {
          if (temp > 1 && !factors.includes(temp)) factors.push(temp);
          break;
        }
      }
    }
    return factors;
  }

  /**
   * Concrete prime witness elements in G illustrating Cauchy's Theorem
   * for each prime divisor p in {2, 3, 5, 7, 11} of the Rubik group order |G|.
   */
  static getCauchyWitnessForPrime(p: 2 | 3 | 5 | 7 | 11): {
    prime: number;
    generatorAlgorithm: string;
    description: string;
  } {
    switch (p) {
      case 2:
        return {
          prime: 2,
          generatorAlgorithm: 'U2',
          description: 'Double turn U2 has order 2: (U2)^2 = e, producing 2-cycles of corners and edges.',
        };
      case 3:
        return {
          prime: 3,
          generatorAlgorithm: "R U' L' U R' U' L U",
          description: 'Niklas commutator has order 3: (Niklas)^3 = e, producing a pure 3-cycle of corners.',
        };
      case 5:
        // RU has order 105 = 3 * 5 * 7. By Cauchy/group theory, (RU)^(105/5) = (RU)^21 has exact order 5!
        return {
          prime: 5,
          generatorAlgorithm: RubikGroupAlgebra.repeatAlgorithm('R U', 21),
          description: '(RU)^21 derived from ord(RU)=105 has exact order 5: ((RU)^21)^5 = e.',
        };
      case 7:
        // (RU)^(105/7) = (RU)^15 has exact order 7!
        return {
          prime: 7,
          generatorAlgorithm: RubikGroupAlgebra.repeatAlgorithm('R U', 15),
          description: '(RU)^15 derived from ord(RU)=105 has exact order 7: ((RU)^15)^7 = e.',
        };
      case 11:
        // In G, the edge permutation group contains the alternating group A_12.
        // A pure 11-cycle of edges has order 11.
        // An algorithm that produces an 11-cycle of edges:
        // e.g. cycling 11 edges in place:
        // An 11-cycle algorithm constructed by standard group commutators:
        return {
          prime: 11,
          generatorAlgorithm: "F U2 F' U' F U' F' L' U2 L U L' U L",
          description: 'Element with edge 11-cycle possessing exact order 11.',
        };
    }
  }

  // =========================================================================
  // GROUP ACTION & ORBIT-STABILIZER THEOREM
  // =========================================================================

  /**
   * Compute the orbit of a piece under group action G \times X -> X.
   */
  static computeOrbit(
    pieceType: 'corner' | 'edge',
    pieceIndex: number,
    generators: readonly StandardMove[]
  ): {
    orbitPositions: number[];
    orbitNames: string[];
    reachabilityGraph: { from: number; to: number; move: string }[];
  } {
    const queue: { state: CubeState; currentPos: number }[] = [];
    const visitedPositions = new Set<number>();
    const transitions: { from: number; to: number; move: string }[] = [];

    const initialState = RubikGroupAlgebra.createIdentityState();
    queue.push({ state: initialState, currentPos: pieceIndex });
    visitedPositions.add(pieceIndex);

    const maxPositions = pieceType === 'corner' ? 8 : 12;

    while (queue.length > 0 && visitedPositions.size < maxPositions) {
      const { state, currentPos } = queue.shift()!;

      for (const move of generators) {
        const nextState = RubikGroupAlgebra.applyMove(state, move);
        const nextPos =
          pieceType === 'corner'
            ? nextState.corners[pieceIndex].pos
            : nextState.edges[pieceIndex].pos;

        transitions.push({
          from: currentPos,
          to: nextPos,
          move,
        });

        if (!visitedPositions.has(nextPos)) {
          visitedPositions.add(nextPos);
          queue.push({ state: nextState, currentPos: nextPos });
        }
      }
    }

    const orbitPositions = Array.from(visitedPositions).sort((a, b) => a - b);
    const labels =
      pieceType === 'corner' ? INITIAL_CORNERS.map((c) => c.name) : INITIAL_EDGES.map((e) => e.name);
    const orbitNames = orbitPositions.map((idx) => labels[idx]);

    return {
      orbitPositions,
      orbitNames,
      reachabilityGraph: transitions,
    };
  }

  /**
   * Stabilizer inspection for a piece:
   * Stab_G(x) = { g \in G | g * x = x }.
   */
  static inspectPieceStabilizer(
    pieceType: 'corner' | 'edge',
    pieceIndex: number,
    candidateMoves: readonly StandardMove[]
  ): { move: StandardMove; fixesPos: boolean; fixesOrientation: boolean }[] {
    const initialState = RubikGroupAlgebra.createIdentityState();

    return candidateMoves.map((m) => {
      const next = RubikGroupAlgebra.applyMove(initialState, m);
      const fixesPos =
        pieceType === 'corner'
          ? next.corners[pieceIndex].pos === pieceIndex
          : next.edges[pieceIndex].pos === pieceIndex;
      const fixesOrientation =
        pieceType === 'corner'
          ? fixesPos && next.corners[pieceIndex].orientation === 0
          : fixesPos && next.edges[pieceIndex].orientation === 0;

      return {
        move: m,
        fixesPos,
        fixesOrientation,
      };
    });
  }

  // =========================================================================
  // SOLUTION ORBIT & 12 COSETS VALIDATION
  // =========================================================================

  /**
   * Validates whether a state belongs to the solvable Rubik's cube group G (orbit index 0),
   * or one of the other 11 illegal cosets.
   *
   * By the First Fundamental Theorem of the Rubik's Cube:
   * [G_physical : G] = 12.
   * A state is reachable if and only if:
   *   1. \sum corner twist \equiv 0 (mod 3)
   *   2. \sum edge flip \equiv 0 (mod 2)
   *   3. sgn(corner permutation) = sgn(edge permutation)
   */
  static validateSolutionOrbit(state: CubeState): OrbitValidationResult {
    const cornerPerm = new Permutation(state.corners.map((c) => c.pos));
    const edgePerm = new Permutation(state.edges.map((e) => e.pos));
    const cornerParity = cornerPerm.getParity();
    const edgeParity = edgePerm.getParity();
    const isParityValid = cornerParity === edgeParity;

    const cornerTwistSum =
      ((state.corners.reduce((sum, c) => sum + (((c.orientation % 3) + 3) % 3), 0) % 3) + 3) % 3;
    const isCornerTwistValid = cornerTwistSum === 0;

    const edgeFlipSum =
      ((state.edges.reduce((sum, e) => sum + (((e.orientation % 2) + 2) % 2), 0) % 2) + 2) % 2;
    const isEdgeFlipValid = edgeFlipSum === 0;

    const isValidOrbit = isCornerTwistValid && isEdgeFlipValid && isParityValid;
    const cosetIndex = cornerTwistSum * 4 + edgeFlipSum * 2 + (isParityValid ? 0 : 1);

    return {
      isValidOrbit,
      cornerTwistSum,
      isCornerTwistValid,
      edgeFlipSum,
      isEdgeFlipValid,
      cornerParity,
      edgeParity,
      isParityValid,
      cosetIndex,
      totalPhysicalStates: '5.19 × 10²⁰ (12 × |G|)',
      validOrbitStates: '4.33 × 10¹⁹ (|G|)',
      solvabilityProbability: '1 / 12 (8.33%)',
    };
  }

  static simulateCornerTwist(state: CubeState, cornerId = 0, delta = 1): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const c = next.corners.find((x) => x.id === cornerId) || next.corners[0];
    c.orientation = (((c.orientation + delta) % 3) + 3) % 3;
    return next;
  }

  static simulateEdgeFlip(state: CubeState, edgeId = 0): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const e = next.edges.find((x) => x.id === edgeId) || next.edges[0];
    e.orientation = (((e.orientation + 1) % 2) + 2) % 2;
    return next;
  }

  static simulatePieceSwap(state: CubeState): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    if (next.corners.length >= 2) {
      const tempPos = next.corners[0].pos;
      next.corners[0].pos = next.corners[1].pos;
      next.corners[1].pos = tempPos;
    }
    return next;
  }

  static repairToValidOrbit(state: CubeState): CubeState {
    const next = RubikGroupAlgebra.cloneState(state);
    const twistSum =
      ((next.corners.reduce((s, c) => s + (((c.orientation % 3) + 3) % 3), 0) % 3) + 3) % 3;
    if (twistSum !== 0) {
      next.corners[0].orientation = (((next.corners[0].orientation - twistSum) % 3) + 3) % 3;
    }
    const flipSum =
      ((next.edges.reduce((s, e) => s + (((e.orientation % 2) + 2) % 2), 0) % 2) + 2) % 2;
    if (flipSum !== 0) {
      next.edges[0].orientation = (((next.edges[0].orientation + 1) % 2) + 2) % 2;
    }
    const cornerPerm = new Permutation(next.corners.map((c) => c.pos));
    const edgePerm = new Permutation(next.edges.map((e) => e.pos));
    if (cornerPerm.getParity() !== edgePerm.getParity()) {
      const tempPos = next.corners[0].pos;
      next.corners[0].pos = next.corners[1].pos;
      next.corners[1].pos = tempPos;
    }
    return next;
  }

  // =========================================================================
  // PURE REACTIVE 2D NET GENERATION FROM ALGEBRAIC STATE
  // =========================================================================

  /**
   * Generates the unfolded 2D Net of all 6 faces purely from the algebraic CubeState,
   * without needing WebGL / Three.js.
   */
  static compute2DNet(state: CubeState): Net2DFaces {
    const net: Partial<Net2DFaces> = {};

    // Map each face (3x3 grid) to the piece that occupies that cell in solved state:
    // Slot definitions for the 6 faces in 3x3 layout (row r, col c):
    // U face (+Y):
    // (0,0)=UBL(3), (0,1)=UB(2),  (0,2)=UBR(2)
    // (1,0)=UL(3),  (1,1)=U center, (1,2)=UR(1)
    // (2,0)=UFL(0), (2,1)=UF(0),  (2,2)=UFR(1)
    //
    // Let's create an exact coordinate-based lookup:
    const faceCoords: Record<FaceName, { getCoords: (r: number, c: number) => { x: number; y: number; z: number } }> = {
      U: { getCoords: (r, c) => ({ x: c - 1, y: 1, z: r - 1 }) },
      D: { getCoords: (r, c) => ({ x: c - 1, y: -1, z: 1 - r }) },
      F: { getCoords: (r, c) => ({ x: c - 1, y: 1 - r, z: 1 }) },
      B: { getCoords: (r, c) => ({ x: 1 - c, y: 1 - r, z: -1 }) },
      L: { getCoords: (r, c) => ({ x: -1, y: 1 - r, z: c - 1 }) },
      R: { getCoords: (r, c) => ({ x: 1, y: 1 - r, z: 1 - c }) },
    };

    // Find which corner/edge piece is at which spatial slot:
    const cornerAtPos: CornerPiece[] = new Array(8);
    state.corners.forEach((c) => (cornerAtPos[c.pos] = c));

    const edgeAtPos: EdgePiece[] = new Array(12);
    state.edges.forEach((e) => (edgeAtPos[e.pos] = e));

    for (const face of FACE_NAMES) {
      const grid: Facelet2D[][] = [];
      const config = faceCoords[face];

      for (let r = 0; r < 3; r++) {
        const row: Facelet2D[] = [];
        for (let c = 0; c < 3; c++) {
          const coord = config.getCoords(r, c);

          // Center cell (1, 1)
          if (coord.x === 0 && (coord.y === 1 || coord.y === -1) && coord.z === 0) {
            row.push({
              face,
              row: r,
              col: c,
              color: FACE_COLORS[face],
              pieceType: 'center',
              pieceId: face === 'U' ? 0 : 1,
              name: face,
            });
          } else if ((coord.x === 1 || coord.x === -1) && coord.y === 0 && coord.z === 0) {
            row.push({
              face,
              row: r,
              col: c,
              color: FACE_COLORS[face],
              pieceType: 'center',
              pieceId: face === 'R' ? 5 : 4,
              name: face,
            });
          } else if (coord.x === 0 && coord.y === 0 && (coord.z === 1 || coord.z === -1)) {
            row.push({
              face,
              row: r,
              col: c,
              color: FACE_COLORS[face],
              pieceType: 'center',
              pieceId: face === 'F' ? 2 : 3,
              name: face,
            });
          } else if (r === 1 && c === 1) {
            // center fallback
            row.push({
              face,
              row: r,
              col: c,
              color: FACE_COLORS[face],
              pieceType: 'center',
              pieceId: 0,
              name: face,
            });
          } else if (r === 1 || c === 1) {
            // Edge cell: locate which edge slot corresponds to (coord.x, coord.y, coord.z)
            const edgePosIdx = INITIAL_EDGES.findIndex(
              (ie) => ie.homePos.x === coord.x && ie.homePos.y === coord.y && ie.homePos.z === coord.z
            );
            const edgePiece = edgeAtPos[edgePosIdx];
            let color = FACE_COLORS[face];
            let pieceId = 0;
            let name = 'Edge';

            if (edgePiece) {
              pieceId = edgePiece.id;
              name = edgePiece.name;
              const slotFaces = INITIAL_EDGES[edgePosIdx].faces;
              const slotFaceIdx = slotFaces.indexOf(face);

              // Orientation determines whether primary and secondary faces are preserved or flipped:
              const pieceFaceIdx = edgePiece.orientation === 0 ? slotFaceIdx : 1 - slotFaceIdx;
              const pieceFaceName = edgePiece.faces[pieceFaceIdx];
              color = FACE_COLORS[pieceFaceName] || FACE_COLORS[face];
            }

            row.push({
              face,
              row: r,
              col: c,
              color,
              pieceType: 'edge',
              pieceId,
              name,
            });
          } else {
            // Corner cell: locate which corner slot corresponds to (coord.x, coord.y, coord.z)
            const cornerPosIdx = INITIAL_CORNERS.findIndex(
              (ic) => ic.homePos.x === coord.x && ic.homePos.y === coord.y && ic.homePos.z === coord.z
            );
            const cornerPiece = cornerAtPos[cornerPosIdx];
            let color = FACE_COLORS[face];
            let pieceId = 0;
            let name = 'Corner';

            if (cornerPiece) {
              pieceId = cornerPiece.id;
              name = cornerPiece.name;
              const slotFaces = INITIAL_CORNERS[cornerPosIdx].faces;
              const slotFaceIdx = slotFaces.indexOf(face);

              // Twist delta: 0 -> same, 1 -> +1 mod 3, 2 -> +2 mod 3:
              const pieceFaceIdx = (slotFaceIdx - cornerPiece.orientation + 3) % 3;
              const pieceFaceName = cornerPiece.faces[pieceFaceIdx];
              color = FACE_COLORS[pieceFaceName] || FACE_COLORS[face];
            }

            row.push({
              face,
              row: r,
              col: c,
              color,
              pieceType: 'corner',
              pieceId,
              name,
            });
          }
        }
        grid.push(row);
      }
      net[face] = grid;
    }

    return net as Net2DFaces;
  }

  /**
   * Reconstructs an algebraic CubeState from a 2D Net of facelet colors.
   * Performs full physical cubology validation:
   * 1. 9 stickers per color
   * 2. Physical piece validity (valid color pairs/triplets)
   * 3. Bijective placement (no duplicate pieces)
   * 4. Invariant testing (corner twists, edge flips, permutation parity)
   */
  static reconstructFrom2DNet(net: Net2DFaces): ReconstructionResult {
    const errors: string[] = [];
    const invalidPieces: ReconstructionResult['invalidPieces'] = [];

    // Helper to map color hex/string to FaceName based on centers or standard FACE_COLORS
    const colorToFaceName = (color: string): FaceName | null => {
      const col = color.toLowerCase();
      for (const fn of FACE_NAMES) {
        if (FACE_COLORS[fn].toLowerCase() === col) return fn;
      }
      for (const fn of FACE_NAMES) {
        if (net[fn]?.[1]?.[1]?.color.toLowerCase() === col) return fn;
      }
      return null;
    };

    // 1. Count colors
    const colorCounts: Record<FaceName, number> = {
      U: 0,
      D: 0,
      F: 0,
      B: 0,
      L: 0,
      R: 0,
    };

    for (const face of FACE_NAMES) {
      const grid = net[face];
      if (!grid) {
        errors.push(`Missing face data for face ${face}`);
        continue;
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cellColor = grid[r]?.[c]?.color;
          if (cellColor) {
            const fn = colorToFaceName(cellColor);
            if (fn) {
              colorCounts[fn]++;
            }
          }
        }
      }
    }

    let isValidColorCount = true;
    for (const fn of FACE_NAMES) {
      if (colorCounts[fn] !== 9) {
        isValidColorCount = false;
        errors.push(`Face ${fn} has ${colorCounts[fn]} stickers (expected exactly 9)`);
      }
    }

    // Corner slot definitions: slotId, name, slotFaces [Primary U/D, Secondary, Tertiary], facelet coordinates
    const cornerSlots: {
      slotId: number;
      name: string;
      slotFaces: FaceName[];
      facelets: { face: FaceName; r: number; c: number }[];
    }[] = [
      { slotId: 0, name: 'UFL', slotFaces: ['U', 'F', 'L'], facelets: [{ face: 'U', r: 2, c: 0 }, { face: 'F', r: 0, c: 0 }, { face: 'L', r: 0, c: 2 }] },
      { slotId: 1, name: 'UFR', slotFaces: ['U', 'F', 'R'], facelets: [{ face: 'U', r: 2, c: 2 }, { face: 'F', r: 0, c: 2 }, { face: 'R', r: 0, c: 0 }] },
      { slotId: 2, name: 'UBR', slotFaces: ['U', 'B', 'R'], facelets: [{ face: 'U', r: 0, c: 2 }, { face: 'B', r: 0, c: 0 }, { face: 'R', r: 0, c: 2 }] },
      { slotId: 3, name: 'UBL', slotFaces: ['U', 'B', 'L'], facelets: [{ face: 'U', r: 0, c: 0 }, { face: 'B', r: 0, c: 2 }, { face: 'L', r: 0, c: 0 }] },
      { slotId: 4, name: 'DFL', slotFaces: ['D', 'F', 'L'], facelets: [{ face: 'D', r: 0, c: 0 }, { face: 'F', r: 2, c: 0 }, { face: 'L', r: 2, c: 2 }] },
      { slotId: 5, name: 'DFR', slotFaces: ['D', 'F', 'R'], facelets: [{ face: 'D', r: 0, c: 2 }, { face: 'F', r: 2, c: 2 }, { face: 'R', r: 2, c: 0 }] },
      { slotId: 6, name: 'DBR', slotFaces: ['D', 'B', 'R'], facelets: [{ face: 'D', r: 2, c: 2 }, { face: 'B', r: 2, c: 0 }, { face: 'R', r: 2, c: 2 }] },
      { slotId: 7, name: 'DBL', slotFaces: ['D', 'B', 'L'], facelets: [{ face: 'D', r: 2, c: 0 }, { face: 'B', r: 2, c: 2 }, { face: 'L', r: 2, c: 0 }] },
    ];

    // Edge slot definitions: slotId, name, slotFaces [Primary, Secondary], facelet coordinates
    const edgeSlots: {
      slotId: number;
      name: string;
      slotFaces: FaceName[];
      facelets: { face: FaceName; r: number; c: number }[];
    }[] = [
      { slotId: 0, name: 'UF', slotFaces: ['U', 'F'], facelets: [{ face: 'U', r: 2, c: 1 }, { face: 'F', r: 0, c: 1 }] },
      { slotId: 1, name: 'UR', slotFaces: ['U', 'R'], facelets: [{ face: 'U', r: 1, c: 2 }, { face: 'R', r: 0, c: 1 }] },
      { slotId: 2, name: 'UB', slotFaces: ['U', 'B'], facelets: [{ face: 'U', r: 0, c: 1 }, { face: 'B', r: 0, c: 1 }] },
      { slotId: 3, name: 'UL', slotFaces: ['U', 'L'], facelets: [{ face: 'U', r: 1, c: 0 }, { face: 'L', r: 0, c: 1 }] },
      { slotId: 4, name: 'FL', slotFaces: ['F', 'L'], facelets: [{ face: 'F', r: 1, c: 0 }, { face: 'L', r: 1, c: 2 }] },
      { slotId: 5, name: 'FR', slotFaces: ['F', 'R'], facelets: [{ face: 'F', r: 1, c: 2 }, { face: 'R', r: 1, c: 0 }] },
      { slotId: 6, name: 'BR', slotFaces: ['B', 'R'], facelets: [{ face: 'B', r: 1, c: 0 }, { face: 'R', r: 1, c: 2 }] },
      { slotId: 7, name: 'BL', slotFaces: ['B', 'L'], facelets: [{ face: 'B', r: 1, c: 2 }, { face: 'L', r: 1, c: 0 }] },
      { slotId: 8, name: 'DF', slotFaces: ['D', 'F'], facelets: [{ face: 'D', r: 0, c: 1 }, { face: 'F', r: 2, c: 1 }] },
      { slotId: 9, name: 'DR', slotFaces: ['D', 'R'], facelets: [{ face: 'D', r: 1, c: 2 }, { face: 'R', r: 2, c: 1 }] },
      { slotId: 10, name: 'DB', slotFaces: ['D', 'B'], facelets: [{ face: 'D', r: 2, c: 1 }, { face: 'B', r: 2, c: 1 }] },
      { slotId: 11, name: 'DL', slotFaces: ['D', 'L'], facelets: [{ face: 'D', r: 1, c: 0 }, { face: 'L', r: 2, c: 1 }] },
    ];

    const reconstructedCorners: CornerPiece[] = new Array(8);
    const seenCornerIds = new Set<number>();

    for (const slot of cornerSlots) {
      const colors = slot.facelets.map((fl) => net[fl.face]?.[fl.r]?.[fl.c]?.color || '');
      const pieceFaces = colors.map((col) => colorToFaceName(col));

      if (pieceFaces.some((f) => !f)) {
        errors.push(`Corner slot ${slot.name} has unidentified colors`);
        invalidPieces.push({
          type: 'corner',
          slotName: slot.name,
          faces: pieceFaces.filter(Boolean) as FaceName[],
          colors,
          reason: 'Unidentified or missing colors',
        });
        continue;
      }

      const f0 = pieceFaces[0]!;
      const f1 = pieceFaces[1]!;
      const f2 = pieceFaces[2]!;

      // Find matching corner in INITIAL_CORNERS
      const matched = INITIAL_CORNERS.find((ic) => {
        const s = new Set(ic.faces);
        return s.has(f0) && s.has(f1) && s.has(f2);
      });

      if (!matched) {
        errors.push(`Slot ${slot.name} contains impossible corner colors: [${f0}, ${f1}, ${f2}]`);
        invalidPieces.push({
          type: 'corner',
          slotName: slot.name,
          faces: [f0, f1, f2],
          colors,
          reason: 'No physical corner piece has this set of faces',
        });
        continue;
      }

      if (seenCornerIds.has(matched.id)) {
        errors.push(`Duplicate corner piece ${matched.name} found at slot ${slot.name}`);
        invalidPieces.push({
          type: 'corner',
          slotName: slot.name,
          faces: [f0, f1, f2],
          colors,
          reason: `Duplicate piece: ${matched.name} already placed elsewhere`,
        });
      }
      seenCornerIds.add(matched.id);

      // Orientation calculation: primary face is slot.slotFaces[0] (which is U or D)
      // On this slot face, the facelet color belongs to face f0.
      const pieceFaceIdx = matched.faces.indexOf(f0);
      const orientation = (3 - pieceFaceIdx) % 3;

      reconstructedCorners[matched.id] = {
        id: matched.id,
        name: matched.name,
        homePos: { ...matched.homePos },
        pos: slot.slotId,
        orientation,
        faces: [...matched.faces],
      };
    }

    const reconstructedEdges: EdgePiece[] = new Array(12);
    const seenEdgeIds = new Set<number>();

    for (const slot of edgeSlots) {
      const colors = slot.facelets.map((fl) => net[fl.face]?.[fl.r]?.[fl.c]?.color || '');
      const pieceFaces = colors.map((col) => colorToFaceName(col));

      if (pieceFaces.some((f) => !f)) {
        errors.push(`Edge slot ${slot.name} has unidentified colors`);
        invalidPieces.push({
          type: 'edge',
          slotName: slot.name,
          faces: pieceFaces.filter(Boolean) as FaceName[],
          colors,
          reason: 'Unidentified or missing colors',
        });
        continue;
      }

      const f0 = pieceFaces[0]!;
      const f1 = pieceFaces[1]!;

      // Find matching edge in INITIAL_EDGES
      const matched = INITIAL_EDGES.find((ie) => {
        const s = new Set(ie.faces);
        return s.has(f0) && s.has(f1);
      });

      if (!matched) {
        errors.push(`Slot ${slot.name} contains impossible edge colors: [${f0}, ${f1}]`);
        invalidPieces.push({
          type: 'edge',
          slotName: slot.name,
          faces: [f0, f1],
          colors,
          reason: 'No physical edge piece has this pair of faces (e.g. opposite faces)',
        });
        continue;
      }

      if (seenEdgeIds.has(matched.id)) {
        errors.push(`Duplicate edge piece ${matched.name} found at slot ${slot.name}`);
        invalidPieces.push({
          type: 'edge',
          slotName: slot.name,
          faces: [f0, f1],
          colors,
          reason: `Duplicate piece: ${matched.name} already placed elsewhere`,
        });
      }
      seenEdgeIds.add(matched.id);

      // Orientation calculation: primary face is slot.slotFaces[0]
      // If f0 matches matched.faces[0], orientation is 0; otherwise 1.
      const orientation = f0 === matched.faces[0] ? 0 : 1;

      reconstructedEdges[matched.id] = {
        id: matched.id,
        name: matched.name,
        homePos: { ...matched.homePos },
        pos: slot.slotId,
        orientation,
        faces: [...matched.faces],
      };
    }

    const hasAllCorners = seenCornerIds.size === 8 && reconstructedCorners.every(Boolean);
    const hasAllEdges = seenEdgeIds.size === 12 && reconstructedEdges.every(Boolean);

    if (!hasAllCorners || !hasAllEdges || !isValidColorCount || invalidPieces.length > 0) {
      return {
        success: false,
        errors,
        colorCounts,
        isValidColorCount,
        invalidPieces,
      };
    }

    const state: CubeState = {
      corners: reconstructedCorners,
      edges: reconstructedEdges,
      centers: [...INITIAL_CENTERS],
    };

    const orbitValidation = RubikGroupAlgebra.validateSolutionOrbit(state);

    return {
      success: true,
      state,
      errors,
      colorCounts,
      isValidColorCount,
      orbitValidation,
      invalidPieces,
    };
  }
}

// ==========================================
// SUBGROUP PRESETS
// ==========================================
export const SUBGROUP_PRESETS: SubgroupPreset[] = [
  {
    id: 'full',
    name: "Full Rubik's Group",
    nameBg: "Пълна група на Рубик",
    formula: "\\mathcal{G} = \\langle U, D, L, R, F, B \\rangle",
    generators: ['U', 'D', 'L', 'R', 'F', 'B'],
    description: "The complete group of legal Rubik's Cube operations, order ~ 4.33 × 10¹⁹.",
    descriptionBg: "Пълната група от позволени операции върху Кубчето на Рубик, ред ~ 4.33 × 10¹⁹.",
    orderApprox: '43,252,003,274,489,856,000',
  },
  {
    id: 'two_gen',
    name: 'Two-Generator Subgroup ⟨R, U⟩',
    nameBg: 'Двугенераторна подгрупа ⟨R, U⟩',
    formula: "\\langle R, U \\rangle",
    generators: ['R', 'U'],
    description: 'Subgroup generated by turning only the Right and Up faces. Transitive on 6 corners and 7 edges.',
    descriptionBg: 'Породена само от завъртания на дясната и горната стена. Транзитивна върху 6 върха и 7 ръба.',
    orderApprox: '73,483,200',
  },
  {
    id: 'slice',
    name: 'Slice Subgroup ⟨M, E, S⟩',
    nameBg: 'Слойна подгрупа (Слайсове) ⟨M, E, S⟩',
    formula: "\\langle M, E, S \\rangle",
    generators: ['M', 'E', 'S'],
    description: 'Fixes all 8 corners completely while acting transitively on edges! Corners are invariant.',
    descriptionBg: 'Фиксира напълно всички 8 върха, като действа транзитивно върху ръбовете! Върховете са инвариантни.',
    orderApprox: '768',
  },
  {
    id: 'squares',
    name: 'Squares / Half-Turn Subgroup ⟨R², L², U², D², F², B²⟩',
    nameBg: 'Подгрупа на полузавъртанията ⟨R², L², U², D², F², B²⟩',
    formula: "\\langle R^2, L^2, U^2, D^2, F^2, B^2 \\rangle",
    generators: ['R2', 'L2', 'U2', 'D2', 'F2', 'B2'],
    description: "Thistlethwaite G₃ subgroup. Every piece stays within its bipartite set. Generates checkerboard patterns.",
    descriptionBg: "Подгрупа G₃ на Тистлетуейт. Всяко парче остава в своето двуделно подмножество. Поражда шахматни шарки.",
    orderApprox: '663,552',
  },
  {
    id: 'klein4',
    name: 'Klein 4-Group ⟨R², U²⟩',
    nameBg: 'Четворна група на Клайн ⟨R², U²⟩',
    formula: "\\langle R^2, U^2 \\rangle",
    generators: ['R2', 'U2'],
    description: 'Abelian/dihedral mini-subgroup acting on a small closed orbit of 4 pieces.',
    descriptionBg: 'Абелева/диедрална мини-подгрупа, действаща върху малка затворена орбита от 4 парчета.',
    orderApprox: '12',
  },
];

// ==========================================
// ALGORITHM PRESETS
// ==========================================
export const ALGORITHM_PRESETS: AlgorithmPreset[] = [
  {
    id: 'corner_3cycle',
    name: 'Niklas Corner 3-Cycle',
    nameBg: '3-Цикъл на върхове на Никлас',
    category: 'Commutators',
    alg: "R U' L' U R' U' L U",
    order: 3,
    description: 'Commutator that cycles 3 corners (UFL, UFR, UBR) while fixing all edges.',
    descriptionBg: 'Комутатор, който циклира 3 върха (UFL, UFR, UBR), като фиксира всички ръбове.',
    groupNote: '3-cycles generate the alternating group A₈ of corner positions.',
    groupNoteBg: '3-циклите пораждат алтерниращата група A₈ от позициите на върховете.',
  },
  {
    id: 'edge_3cycle',
    name: 'Edge 3-Cycle Commutator',
    nameBg: '3-Цикъл на ръбове (Комутатор)',
    category: 'Commutators',
    alg: "M' U2 M U2",
    order: 3,
    description: 'Pure edge 3-cycle on UF, UB, and DF edges.',
    descriptionBg: 'Чист 3-цикъл върху ръбовете UF, UB и DF.',
    groupNote: 'Acts on edges X_edges as a pure 3-cycle, fixing all corners.',
    groupNoteBg: 'Действа върху X_edges като чист 3-цикъл, фиксирайки всички върхове.',
  },
  {
    id: 'sune',
    name: 'Sune Corner Twister',
    nameBg: 'Суне (Завъртане на върхове)',
    category: 'Conjugates',
    alg: "R U R' U R U2 R'",
    order: 6,
    description: 'Twists 3 corners in place without permuting them.',
    descriptionBg: 'Завърта 3 върха на място, без да променя позициите им.',
    groupNote: 'Maintains corner orientation sum Σ Δo ≡ 0 (mod 3).',
    groupNoteBg: 'Запазва сумата от ориентациите на върховете Σ Δo ≡ 0 (mod 3).',
  },
  {
    id: 'superflip',
    name: 'The Superflip (Center of G)',
    nameBg: 'Суперфлип (Център на G)',
    category: 'Center / Symmetry',
    alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    order: 2,
    description: 'Every single one of the 12 edges is flipped in place; all corners and centers fixed.',
    descriptionBg: 'Всеки един от 12-те ръба е обърнат на място; всички върхове и центрове са фиксирани.',
    groupNote: 'The Superflip is in the center of the Rubik group Z(G)! It commutes with every element in G: g · Superflip = Superflip · g.',
    groupNoteBg: 'Суперфлипът лежи в центъра на групата на Рубик Z(G)! Той комутира с всеки елемент от G: g · Superflip = Superflip · g.',
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard Pattern',
    nameBg: 'Шахматна дъска',
    category: 'Center / Symmetry',
    alg: "R2 L2 U2 D2 F2 B2",
    order: 2,
    description: 'Swaps antipodal edges across all 6 faces.',
    descriptionBg: 'Разменя срещуположните ръбове на всички 6 страни.',
    groupNote: 'An involution of order 2: (Checkerboard)² = e.',
    groupNoteBg: 'Инволюция от ред 2: (Шахмат)² = e.',
  },
  {
    id: 'cube_in_cube',
    name: 'Cube in a Cube',
    nameBg: 'Куб в куба',
    category: 'Classic Cycles',
    alg: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    order: 3,
    description: 'Creates a nested 2x2 cube visual effect.',
    descriptionBg: 'Създава визуален ефект на вграден 2x2 куб.',
    groupNote: 'Order 3 transformation with 3-fold diagonal symmetry axis.',
    groupNoteBg: 'Трансформация от ред 3 с 3-кратна диагонална ос на симетрия.',
  },
  {
    id: 'ru_cycle',
    name: '⟨R, U⟩ Order 105 Cycle',
    nameBg: '⟨R, U⟩ Цикъл от ред 105',
    category: 'Classic Cycles',
    alg: "R U",
    order: 105,
    description: 'Repeatedly applying R U requires exactly 105 repetitions to return to identity!',
    descriptionBg: 'Многократното прилагане на R U изисква точно 105 повторения за връщане към идентитета!',
    groupNote: 'ord(R U) = lcm(corner cycle 7 * 3, edge cycle 5) = 105. Demonstrates the Orbit-Stabilizer theorem.',
    groupNoteBg: 'ord(R U) = НОК(цикъл на върхове 7 * 3, цикъл на ръбове 5) = 105. Демонстрира теоремата за орбитата и стабилизатора.',
  },
];

// ==========================================
// TUTORIAL STEPS & INTERACTIVE ACADEMY
// ==========================================
export interface TutorialCase {
  id: string;
  name: string;
  nameBg: string;
  description: string;
  descriptionBg: string;
  algorithm: string;
  setupMoves?: string;
}

export interface TutorialStep {
  stepNumber: number;
  id: string;
  title: string;
  titleBg: string;
  subtitle: string;
  subtitleBg: string;
  goal: string;
  goalBg: string;
  algorithm: string;
  algorithmName: string;
  algorithmNameBg: string;
  mathExplanation: string;
  mathExplanationBg: string;
  tips: string;
  tipsBg: string;
  setupAlgorithm: string;
  cases: TutorialCase[];
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    id: 'white_cross',
    title: 'The White Cross',
    titleBg: 'Бял Кръст',
    subtitle: 'Orienting & aligning the 4 white edges',
    subtitleBg: 'Ориентиране и напасване на 4-те бели ръба',
    goal: 'Form a white cross around the white center, with each edge side-sticker matching its adjacent lateral center.',
    goalBg: 'Изграждане на бял кръст около белия център, при който страничните цветове на ръбовете съвпадат със съответните центрове.',
    algorithm: "F R' D' R F2",
    algorithmName: 'Edge Insertion & Alignment',
    algorithmNameBg: 'Вмъкване и напасване на ръб',
    setupAlgorithm: "D2 R' F' D R2 F2",
    mathExplanation: 'Action of generator turns on the edge set E. Moving edges into the U orbit without breaking already placed edges.',
    mathExplanationBg: 'Действие на генераторите върху множеството на ръбовете E. Придвижване на ръб в U орбитата, запазвайки вече поставените.',
    tips: 'The easiest method is the "Daisy": put 4 white edges around the yellow center first, match the side color with its center, and do a 180° turn (F2/R2/B2/L2).',
    tipsBg: 'Най-лесният метод е „Маргаритка“: съберете 4 бели ръба около жълтия център, напаснете страничния цвят с неговия център и завъртете на 180° (F2/R2/B2/L2).',
    cases: [
      {
        id: 'daisy',
        name: 'Daisy Method (Recommended)',
        nameBg: 'Метод „Маргаритка“ (Препоръчителен)',
        description: 'Match side color with its center and rotate 180° to white center.',
        descriptionBg: 'Напаснете страничния цвят с неговия център и завъртете на 180° към белия център.',
        algorithm: 'F2',
        setupMoves: 'F2',
      },
      {
        id: 'flipped_bottom',
        name: 'Flipped Bottom Edge',
        nameBg: 'Обърнат долен ръб',
        description: 'White sticker on D face is flipped sideways.',
        descriptionBg: 'Бял ръб на долния слой, при който бялото сочи встрани вместо надолу.',
        algorithm: "F' U' R U",
        setupMoves: "U' R' U F",
      },
      {
        id: 'equatorial',
        name: 'Middle Layer Edge',
        nameBg: 'Ръб в средния слой',
        description: 'Bring edge into the top layer safely without breaking completed edges.',
        descriptionBg: 'Качете ръба в горния слой без разваляне на наредените до момента.',
        algorithm: "R U R'",
        setupMoves: "R U' R'",
      },
    ],
  },
  {
    stepNumber: 2,
    id: 'first_layer_corners',
    title: 'First Layer Corners',
    titleBg: 'Върхове на Първия Слой',
    subtitle: 'Completing the entire first layer',
    subtitleBg: 'Завършване на целия първи слой',
    goal: 'Place all 4 white corners into their correct slots with white facing down, solving the entire first layer.',
    goalBg: 'Поставяне на 4-те бели върха на техните правилни позиции с бяло сочещо надолу, завършвайки първия слой.',
    algorithm: "R U R' U'",
    algorithmName: 'Right Trigger [R, U]',
    algorithmNameBg: 'Десен тригер: Комутаторен фрагмент [R, U]',
    setupAlgorithm: "R U R' U' R U R' U'",
    mathExplanation: 'The 4-move sequence is the canonical trigger [R, U] = R U R⁻¹ U⁻¹. Repeating it 1 to 5 times cycles and twists the corner piece into place while restoring the remaining cube structure.',
    mathExplanationBg: '4-ходовата последователност е каноничният тригер [R, U] = R U R⁻¹ U⁻¹. Повтарянето му 1 до 5 пъти завърта и поставя върха на място, запазвайки останалата структура.',
    tips: 'Hold the target slot directly below the corner piece, then repeat R U R\' U\' until white faces down.',
    tipsBg: 'Дръжте целевия слот директно под върха и повтаряйте R U R\' U\', докато белият стикер застане отдолу.',
    cases: [
      {
        id: 'white_right',
        name: 'White Facing Right (1 Trigger)',
        nameBg: 'Бялото сочи надясно (3 хода)',
        description: 'Fast insertion with just 3 moves.',
        descriptionBg: 'Бързо вмъкване с 3 хода: R U R\'.',
        algorithm: "R U R'",
        setupMoves: "R U' R'",
      },
      {
        id: 'white_front',
        name: 'White Facing Front',
        nameBg: 'Бялото сочи напред',
        description: 'Standard 4-move insertion.',
        descriptionBg: 'Стандартно вмъкване с 4 хода: U R U\' R\'.',
        algorithm: "U R U' R'",
        setupMoves: "R U R' U'",
      },
      {
        id: 'white_up',
        name: 'White Facing Up',
        nameBg: 'Бялото сочи нагоре',
        description: 'Triple trigger cycles and reorients white to bottom.',
        descriptionBg: 'Тройно повторение на десния тригер завърта бялото към основата.',
        algorithm: "R U2 R' U' R U R'",
        setupMoves: "R' U' R U R' U' R U R' U' R",
      },
    ],
  },
  {
    stepNumber: 3,
    id: 'second_layer_edges',
    title: 'Second Layer (Middle Edges)',
    titleBg: 'Втори Слой (Средни Ръбове)',
    subtitle: 'Inserting the 4 equatorial edges',
    subtitleBg: 'Вмъкване на 4-те екваториални ръба',
    goal: 'Solve the middle layer by slotting the 4 non-yellow edges (FR, FL, BR, BL) into their positions.',
    goalBg: 'Решаване на средния слой чрез вмъкване на 4-те нежълти ръба (FR, FL, BR, BL) на правилните места.',
    algorithm: "U R U' R' U' F' U F",
    algorithmName: 'Right-Edge Insertion (Conjugated Commutator)',
    algorithmNameBg: 'Вмъкване надясно (Конюгиран комутатор)',
    setupAlgorithm: "F' U' F U R U R' U'",
    mathExplanation: 'A conjugated commutator of form g = [R, U] · [F\', U\']. It operates on the stabilizer Stab_G(Layer 1), leaving the entire solved first layer invariant!',
    mathExplanationBg: 'Конюгиран комутатор от вида g = [R, U] · [F\', U\']. Той действа в стабилизатора Stab_G(Слой 1), оставяйки целия първи слой инвариантен!',
    tips: 'Align edge with matching center. If it needs to go to the Right, use U R U\' R\' U\' F\' U F. If Left, use U\' L\' U L U F U\' F\'.',
    tipsBg: 'Напаснете цвета на ръба с центъра. Ако трябва да отиде Надясно, използвайте десния алгоритъм. Ако е Наляво, използвайте левия огледален алгоритъм.',
    cases: [
      {
        id: 'insert_right',
        name: 'Insert to the Right',
        nameBg: 'Вмъкване надясно',
        description: 'Edge slots from top layer into front-right middle position.',
        descriptionBg: 'Ръбът от горния слой влиза в предно-десния среден слот (FR).',
        algorithm: "U R U' R' U' F' U F",
        setupMoves: "F' U' F U R U R' U'",
      },
      {
        id: 'insert_left',
        name: 'Insert to the Left (Mirror)',
        nameBg: 'Вмъкване наляво (Огледален)',
        description: 'Edge slots from top layer into front-left middle position.',
        descriptionBg: 'Ръбът от горния слой влиза в предно-левия среден слот (FL).',
        algorithm: "U' L' U L U F U' F'",
        setupMoves: "F U' F' U' L' U' L U",
      },
      {
        id: 'stuck_middle',
        name: 'Edge Stuck in Middle Layer',
        nameBg: 'Ръбът е заклещен на грешно място',
        description: 'Insert any yellow edge into its slot to free it to the top layer.',
        descriptionBg: 'Вмъкнете произволно жълто парче на негово място с десния алгоритъм, за да го качите в горния слой.',
        algorithm: "U R U' R' U' F' U F",
        setupMoves: "F' U' F U R U R' U'",
      },
    ],
  },
  {
    stepNumber: 4,
    id: 'yellow_cross',
    title: 'Top Yellow Cross',
    titleBg: 'Горен Жълт Кръст',
    subtitle: 'Orienting top layer edges',
    subtitleBg: 'Ориентиране на ръбовете на последния слой',
    goal: 'Orient all 4 yellow edges so yellow faces upward (Dot → L-shape → Line → Cross).',
    goalBg: 'Ориентиране на 4-те жълти ръба, така че жълтото да сочи нагоре (Точка → L-форма → Линия → Кръст).',
    algorithm: "F R U R' U' F'",
    algorithmName: 'F · [R, U] · F⁻¹ (Conjugate of Commutator)',
    algorithmNameBg: 'F · [R, U] · F⁻¹ (Конюгат на комутатора)',
    setupAlgorithm: "F U R U' R' F'",
    mathExplanation: 'Conjugating the right trigger [R, U] by F flips exactly 2 edges on the top face without permuting or flipping lower layer pieces. Edge flip sum invariant Σ flip ≡ 0 (mod 2) is strictly conserved.',
    mathExplanationBg: 'Конюгирането на тригера [R, U] с F обръща точно 2 ръба на горната страна. Инвариантът за сумата от обръщания Σ flip ≡ 0 (mod 2) се спазва стриктно.',
    tips: 'If you have an L-shape, hold it in top-left (9 and 12 o\'clock). If a horizontal line, hold it horizontally.',
    tipsBg: 'При L-форма я дръжте горе-вляво (на 9 и 12 часа). При хоризонтална линия я дръжте хоризонтално.',
    cases: [
      {
        id: 'l_shape',
        name: 'L-Shape (9 & 12 o\'clock)',
        nameBg: 'L-образна форма (на 9 и 12 часа)',
        description: 'Hold the small yellow L in the top-left corner, execute algorithm once.',
        descriptionBg: 'Дръжте малката жълта стрелка горе-вляво и изпълнете алгоритъма веднъж.',
        algorithm: "F R U R' U' F'",
        setupMoves: "F U R U' R' F' U F U R U' R' F'",
      },
      {
        id: 'horizontal_line',
        name: 'Horizontal Line',
        nameBg: 'Хоризонтална линия',
        description: 'Hold the yellow line horizontally, execute algorithm once to get the cross!',
        descriptionBg: 'Дръжте жълтата линия хоризонтално и изпълнете алгоритъма веднъж за готов кръст!',
        algorithm: "F R U R' U' F'",
        setupMoves: "F U R U' R' F'",
      },
      {
        id: 'dot',
        name: 'Dot (Only Center)',
        nameBg: 'Точка (Само жълт център)',
        description: 'Execute from any angle to form the L-shape, then continue.',
        descriptionBg: 'Изпълнете от произволен ъгъл, за да получите L-образна форма.',
        algorithm: "F R U R' U' F'",
        setupMoves: "F U R U' R' F' U2 F U R U' R' F' U F U R U' R' F'",
      },
    ],
  },
  {
    stepNumber: 5,
    id: 'orient_corners_sune',
    title: 'Orient Yellow Corners (Sune)',
    titleBg: 'Ориентиране на Жълтите Върхове (Sune)',
    subtitle: 'All yellow stickers facing Up',
    subtitleBg: 'Всички жълти стикери да сочат нагоре',
    goal: 'Twist the top 4 corners until the entire top face is solid yellow.',
    goalBg: 'Завъртане на 4-те горни върха на място, докато горната страна стане изцяло жълта.',
    algorithm: "R U R' U R U2 R'",
    algorithmName: 'Sune Transformation (Order 3 twist)',
    algorithmNameBg: 'Трансформация „Сюне“ (Завъртане от ред 3)',
    setupAlgorithm: "R U2 R' U' R U' R'",
    mathExplanation: 'The famous Sune element! It has cycle structure that leaves edges in place and twists 3 corners with orientations (+1, +1, +1) ≡ 0 (mod 3), preserving the Corner Twist Invariant.',
    mathExplanationBg: 'Известният алгоритъм Sune! Запазва ръбовете и завърта 3 върха с ориентации (+1, +1, +1) ≡ 0 (mod 3), спазвайки инварианта за върховете.',
    tips: 'If 1 corner is yellow (Fish shape), place it at bottom-left and perform Sune.',
    tipsBg: 'Ако точно 1 връх е жълт (форма на Рибка), поставете го долу-вляво и изпълнете Sune.',
    cases: [
      {
        id: 'fish',
        name: 'Fish (1 Yellow Corner)',
        nameBg: 'Рибка (1 жълт връх)',
        description: 'Place the yellow corner head at bottom-left, execute Sune once (or twice).',
        descriptionBg: 'Поставете главата на рибката долу-вляво и изпълнете Sune (1 или 2 пъти).',
        algorithm: "R U R' U R U2 R'",
        setupMoves: "R U2 R' U' R U' R'",
      },
      {
        id: 'cross_no_corners',
        name: 'Cross with 0 Yellow Corners',
        nameBg: 'Кръст без жълти върхове',
        description: 'Position so a yellow sticker on the left face points left, execute Sune.',
        descriptionBg: 'Позиционирайте така, че жълтите фарове да са отляво, и изпълнете Sune.',
        algorithm: "R U R' U R U2 R'",
        setupMoves: "R U2 R' U' R U' R' U2 R U2 R' U' R U' R'",
      },
      {
        id: 'two_corners',
        name: 'Two Yellow Corners',
        nameBg: 'Два жълти върха',
        description: 'Rotate so the front-facing yellow sticker is at top-left, execute Sune.',
        descriptionBg: 'Завъртете така, че предният жълт стикер да е отляво, и изпълнете Sune.',
        algorithm: "R U R' U R U2 R'",
        setupMoves: "R U2 R' U' R U' R' U R U2 R' U' R U' R'",
      },
    ],
  },
  {
    stepNumber: 6,
    id: 'permute_corners',
    title: 'Permute Last Layer Corners',
    titleBg: 'Пермутация на Върховете (Headlights)',
    subtitle: 'Positioning corners to their correct slots',
    subtitleBg: 'Позициониране на върховете на правилните места',
    goal: 'Put all corners in their correct positions relative to each other (look for headlights).',
    goalBg: 'Поставяне на всички върхове на съответните им ъглови позиции (търсете „фарове“).',
    algorithm: "R' F R' B2 R F' R' B2 R2",
    algorithmName: 'A-Permutation / Headlights',
    algorithmNameBg: 'A-пермутация / „Фарове“',
    setupAlgorithm: "R2 B2 R F R' B2 R F' R",
    mathExplanation: 'A pure 3-cycle of corners (C_a → C_b → C_c). Since a 3-cycle has even permutation parity sgn = +1, this preserves the fundamental Parity Invariant sgn(σ) = sgn(τ).',
    mathExplanationBg: 'Чист 3-цикъл на върхове (C_a → C_b → C_c). Тъй като 3-цикълът има четна пермутационна четност sgn = +1, той спазва фундаменталния инвариант за четност.',
    tips: 'Hold two matching corner colors (headlights) at the back, then execute the algorithm.',
    tipsBg: 'Дръжте двата съвпадащи цвята на върхове („фарове“) откъм задната страна и изпълнете алгоритъма.',
    cases: [
      {
        id: 'headlights_back',
        name: 'Headlights Found (Place at Back)',
        nameBg: 'Намерени фарове (Сложете ги отзад)',
        description: 'Keep the 2 matching corner stickers at the Back (B face), execute A-Perm.',
        descriptionBg: 'Дръжте 2-та еднакви ъгъла откъм гърба (B) и изпълнете A-Perm.',
        algorithm: "R' F R' B2 R F' R' B2 R2",
        setupMoves: "R2 B2 R F R' B2 R F' R",
      },
      {
        id: 'no_headlights',
        name: 'No Headlights Anywhere',
        nameBg: 'Няма нито едни фарове',
        description: 'Execute A-Perm from any side; headlights will then appear on one face.',
        descriptionBg: 'Изпълнете A-Perm от произволна страна; след това ще се появят фарове.',
        algorithm: "R' F R' B2 R F' R' B2 R2",
        setupMoves: "R2 B2 R F R' B2 R F' R U R2 B2 R F R' B2 R F' R",
      },
    ],
  },
  {
    stepNumber: 7,
    id: 'permute_edges_solved',
    title: 'Permute Edges (Final Solve!)',
    titleBg: 'Пермутация на Ръбовете (Финално Решение!)',
    subtitle: 'Cycling the final 3 edges to identity e',
    subtitleBg: 'Циклиране на последните 3 ръба до идентитета e',
    goal: 'Cycle the last layer edges to complete the Rubik\'s Cube into its solved state.',
    goalBg: 'Циклиране на последните ръбове за пълно подреждане на кубчето.',
    algorithm: "R U' R U R U R U' R' U' R2",
    algorithmName: 'U-Permutation (3-cycle of edges)',
    algorithmNameBg: 'U-пермутация (3-цикъл на ръбове)',
    setupAlgorithm: "R2 U R U R' U' R' U' R' U R'",
    mathExplanation: 'A pure 3-cycle of edges (E_1 → E_2 → E_3). As sgn = +1 and ord(U-perm) = 3, applying it places the final edges into place, returning the entire group element to the identity e ∈ G!',
    mathExplanationBg: 'Чист 3-цикъл на ръбове (E_1 → E_2 → E_3). Тъй като sgn = +1 и ord = 3, прилагането му подрежда последните елементи и връща куба в идентитета e ∈ G!',
    tips: 'Hold the solved bar at the back. Perform the algorithm once or twice to complete the cube!',
    tipsBg: 'Дръжте напълно наредената страна отзад. Изпълнете алгоритъма веднъж или два пъти и кубът е решен!',
    cases: [
      {
        id: 'clockwise',
        name: 'Clockwise 3-Cycle (Solved Bar at Back)',
        nameBg: 'По часовниковата стрелка (Цяла стена отзад)',
        description: 'Keep the 1 solved face at the Back (B), execute U-Perm to finish!',
        descriptionBg: 'Дръжте готовата стена отзад и изпълнете U-Perm за пълно нареждане!',
        algorithm: "R U' R U R U R U' R' U' R2",
        setupMoves: "R2 U R U R' U' R' U' R' U R'",
      },
      {
        id: 'counter_clockwise',
        name: 'Counter-Clockwise 3-Cycle',
        nameBg: 'Обратно на часовниковата стрелка',
        description: 'Reverse U-Perm or execute clockwise twice.',
        descriptionBg: 'Огледален U-Perm или изпълнете алгоритъма по часовника два пъти.',
        algorithm: "R2 U R U R' U' R' U' R' U R'",
        setupMoves: "R U' R U R U R U' R' U' R2",
      },
      {
        id: 'no_solved_bar',
        name: 'No Solved Bar (All 4 Edges Unsolved)',
        nameBg: 'Няма цяла стена (4 разбъркани ръба)',
        description: 'Execute U-Perm from any side to create 1 solved face, place it at Back and repeat.',
        descriptionBg: 'Изпълнете U-Perm веднъж, за да наредите една стена, сложете я отзад и повторете.',
        algorithm: "R U' R U R U R U' R' U' R2",
        setupMoves: "R2 U R U R' U' R' U' R' U R' U R2 U R U R' U' R' U' R' U R'",
      },
    ],
  },
];

