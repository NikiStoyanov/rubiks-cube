import {
  CornerPiece,
  EdgePiece,
  CenterPiece,
  CubeState,
  DisjointCycle,
  FaceName,
  MoveAnalysis,
  PieceCoord,
  StandardMove,
  SubgroupPreset,
  AlgorithmPreset,
  Facelet2D,
  Net2DFaces,
} from '../types/cube';

// Face colors standard
export const FACE_COLORS: Record<FaceName, string> = {
  U: '#f8fafc', // White
  D: '#eab308', // Yellow
  F: '#22c55e', // Green
  B: '#3b82f6', // Blue
  L: '#f97316', // Orange
  R: '#ef4444', // Red
};

export const FACE_NAMES: FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];

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

export function createInitialCubeState(): CubeState {
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

export function cloneCubeState(state: CubeState): CubeState {
  return {
    corners: state.corners.map((c) => ({ ...c })),
    edges: state.edges.map((e) => ({ ...e })),
    centers: state.centers.map((c) => ({ ...c })),
  };
}

export function createDefault2DNet(): Net2DFaces {
  const result: Partial<Net2DFaces> = {};
  const faces: FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];
  for (const f of faces) {
    const grid: Facelet2D[][] = [];
    for (let r = 0; r < 3; r++) {
      const row: Facelet2D[] = [];
      for (let c = 0; c < 3; c++) {
        row.push({
          face: f,
          row: r,
          col: c,
          color: FACE_COLORS[f],
          pieceType: r === 1 && c === 1 ? 'center' : (r === 1 || c === 1 ? 'edge' : 'corner'),
          pieceId: 0,
          name: f,
        });
      }
      grid.push(row);
    }
    result[f] = grid;
  }
  return result as Net2DFaces;
}

// Face turn permutations on corner positions & orientation shifts
// Orientation rule:
// Corner twist: 0 = unrotated, 1 = clockwise, 2 = counter-clockwise.
// When turning U or D, corners keep their U/D orientation -> delta = 0.
// When turning F or B:
//   corners alternate +1 and +2 (i.e. +1 and -1 mod 3).
// When turning L or R:
//   corners alternate +1 and +2.
interface FaceTurnDef {
  // mapping: from position -> new position
  cornerCycle: [number, number, number, number]; // 4-cycle of corner positions
  cornerDeltaO: [number, number, number, number]; // orientation change mod 3
  edgeCycle: [number, number, number, number]; // 4-cycle of edge positions
  edgeFlip: [number, number, number, number]; // flip 0 or 1
}

// Exact permutation definitions for standard clockwise quarter-turns:
const BASE_TURNS: Record<FaceName, FaceTurnDef> = {
  // U face: (UFL=0 -> UBL=3 -> UBR=2 -> UFR=1)
  // Edges: (UF=0 -> UL=3 -> UB=2 -> UR=1)
  U: {
    cornerCycle: [0, 3, 2, 1],
    cornerDeltaO: [0, 0, 0, 0],
    edgeCycle: [0, 3, 2, 1],
    edgeFlip: [0, 0, 0, 0],
  },
  // D face (looking from bottom -y):
  // DFL(4) -> DFR(5) -> DBR(6) -> DBL(7)
  // Edges: DF(8) -> DR(9) -> DB(10) -> DL(11)
  D: {
    cornerCycle: [4, 5, 6, 7],
    cornerDeltaO: [0, 0, 0, 0],
    edgeCycle: [8, 9, 10, 11],
    edgeFlip: [0, 0, 0, 0],
  },
  // F face (looking from front +z):
  // UFL=0 (-1,1,1), UFR=1 (1,1,1), DFR=5 (1,-1,1), DFL=4 (-1,-1,1)
  // Clockwise: UFL(0) -> DFL(4) -> DFR(5) -> UFR(1)? Wait, looking at +z:
  // Top-left is UFL(0), Top-right is UFR(1), Bottom-right is DFR(5), Bottom-left is DFL(4).
  // Clockwise: UFL(0) -> UFR(1) -> DFR(5) -> DFL(4) -> UFL(0)!
  // Edges: UF(0) -> FR(5) -> DF(8) -> FL(4) -> UF(0)!
  // Orientations: F twists corners: UFL(+2), UFR(+1), DFR(+2), DFL(+1)
  // Edges on F flip: [1, 1, 1, 1]
  F: {
    cornerCycle: [0, 1, 5, 4],
    cornerDeltaO: [1, 2, 1, 2],
    edgeCycle: [0, 5, 8, 4],
    edgeFlip: [1, 1, 1, 1],
  },
  // B face (looking from back -z towards origin):
  // Top-left is UBR(2), Top-right is UBL(3), Bottom-right is DBL(7), Bottom-left is DBR(6).
  // Clockwise: UBR(2) -> UBL(3) -> DBL(7) -> DBR(6) -> UBR(2)!
  // Edges: UB(2) -> BL(7) -> DB(10) -> BR(6) -> UB(2)!
  // Corners twist: [1, 2, 1, 2]
  // Edges flip: [1, 1, 1, 1]
  B: {
    cornerCycle: [2, 3, 7, 6],
    cornerDeltaO: [1, 2, 1, 2],
    edgeCycle: [2, 7, 10, 6],
    edgeFlip: [1, 1, 1, 1],
  },
  // L face (looking from left -x towards origin):
  // Top-left is UBL(3), Top-right is UFL(0), Bottom-right is DFL(4), Bottom-left is DBL(7).
  // Clockwise: UBL(3) -> UFL(0) -> DFL(4) -> DBL(7) -> UBL(3)!
  // Edges: UL(3) -> FL(4) -> DL(11) -> BL(7) -> UL(3)!
  // Corners twist: [2, 1, 2, 1]
  // Edges do NOT flip in standard orientation convention on L/R
  L: {
    cornerCycle: [3, 0, 4, 7],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [3, 4, 11, 7],
    edgeFlip: [0, 0, 0, 0],
  },
  // R face (looking from right +x towards origin):
  // Top-left is UFR(1), Top-right is UBR(2), Bottom-right is DBR(6), Bottom-left is DFR(5).
  // Clockwise: UFR(1) -> UBR(2) -> DBR(6) -> DFR(5) -> UFR(1)!
  // Edges: UR(1) -> BR(6) -> DR(9) -> FR(5) -> UR(1)!
  // Corners twist: [2, 1, 2, 1]
  // Edges do not flip on R
  R: {
    cornerCycle: [1, 2, 6, 5],
    cornerDeltaO: [2, 1, 2, 1],
    edgeCycle: [1, 6, 9, 5],
    edgeFlip: [0, 0, 0, 0],
  },
};

// Apply a single clockwise face turn
export function applyBaseTurn(state: CubeState, face: FaceName): CubeState {
  const next = cloneCubeState(state);
  const def = BASE_TURNS[face];

  // Permute corners
  // cycle: [c0, c1, c2, c3] means piece currently at c0 goes to c1, c1 -> c2, c2 -> c3, c3 -> c0
  const cornerAtPos: number[] = new Array(8).fill(-1);
  state.corners.forEach((c) => {
    cornerAtPos[c.pos] = c.id;
  });

  const [c0, c1, c2, c3] = def.cornerCycle;
  const [do0, do1, do2, do3] = def.cornerDeltaO;

  // The piece at c0 moves to c1
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

  // Permute edges
  const edgeAtPos: number[] = new Array(12).fill(-1);
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

// Slice moves in terms of face turns and cube rotations:
// M is in the direction of L (between L and R)
// E is in the direction of D (between U and D)
// S is in the direction of F (between F and B)
export function applyMove(state: CubeState, move: StandardMove | string): CubeState {
  let s = cloneCubeState(state);
  const cleanMove = move.trim();

  // Handle slices:
  if (cleanMove.startsWith('M')) {
    // M' = R * L' * (rotation around x)
    // For pieces: M affects middle layer edges (UF, DF, DB, UB) and centers (U, F, D, B)
    // Rather than full cube rotations, M is equivalent to L-turn direction on the middle slice!
    const times = cleanMove === "M'" ? 3 : cleanMove === 'M2' ? 2 : 1;
    for (let i = 0; i < times; i++) {
      s = applySliceM(s);
    }
    return s;
  }
  if (cleanMove.startsWith('E')) {
    const times = cleanMove === "E'" ? 3 : cleanMove === 'E2' ? 2 : 1;
    for (let i = 0; i < times; i++) {
      s = applySliceE(s);
    }
    return s;
  }
  if (cleanMove.startsWith('S')) {
    const times = cleanMove === "S'" ? 3 : cleanMove === 'S2' ? 2 : 1;
    for (let i = 0; i < times; i++) {
      s = applySliceS(s);
    }
    return s;
  }

  const face = cleanMove[0] as FaceName;
  if (!BASE_TURNS[face]) return s;

  const isInverse = cleanMove.includes("'");
  const isDouble = cleanMove.includes('2');

  const count = isDouble ? 2 : isInverse ? 3 : 1;
  for (let i = 0; i < count; i++) {
    s = applyBaseTurn(s, face);
  }
  return s;
}

// M slice: in direction of L:
// Edges: UF(0) -> DF(8) -> DB(10) -> UB(2) -> UF(0)
// With flips
function applySliceM(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  const edgeAtPos: number[] = new Array(12).fill(-1);
  state.edges.forEach((e) => {
    edgeAtPos[e.pos] = e.id;
  });

  const [e0, e1, e2, e3] = [0, 8, 10, 2]; // UF -> DF -> DB -> UB
  const eid0 = edgeAtPos[e0];
  const eid1 = edgeAtPos[e1];
  const eid2 = edgeAtPos[e2];
  const eid3 = edgeAtPos[e3];

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

// E slice: in direction of D:
// Edges: FL(4) -> BL(7) -> BR(6) -> FR(5) -> FL(4)
function applySliceE(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  const edgeAtPos: number[] = new Array(12).fill(-1);
  state.edges.forEach((e) => {
    edgeAtPos[e.pos] = e.id;
  });

  const [e0, e1, e2, e3] = [4, 7, 6, 5]; // FL -> BL -> BR -> FR
  const eid0 = edgeAtPos[e0];
  const eid1 = edgeAtPos[e1];
  const eid2 = edgeAtPos[e2];
  const eid3 = edgeAtPos[e3];

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

// S slice: in direction of F:
// Edges: UR(1) -> DR(9) -> DL(11) -> UL(3) -> UR(1)
function applySliceS(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  const edgeAtPos: number[] = new Array(12).fill(-1);
  state.edges.forEach((e) => {
    edgeAtPos[e.pos] = e.id;
  });

  const [e0, e1, e2, e3] = [1, 9, 11, 3]; // UR -> DR -> DL -> UL
  const eid0 = edgeAtPos[e0];
  const eid1 = edgeAtPos[e1];
  const eid2 = edgeAtPos[e2];
  const eid3 = edgeAtPos[e3];

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

// Parse space-separated or standard algorithm string
export function parseAlgorithm(alg: string): StandardMove[] {
  if (!alg) return [];
  // Match moves like U, U', U2, M, M', M2, etc.
  const regex = /([UDFBLRMES]['2]?)/gi;
  const matches = alg.match(regex);
  if (!matches) return [];
  return matches.map((m) => {
    const face = m[0].toUpperCase();
    const rest = m.slice(1);
    return `${face}${rest}` as StandardMove;
  });
}

export function applyAlgorithm(state: CubeState, alg: string | StandardMove[]): CubeState {
  const moves = Array.isArray(alg) ? alg : parseAlgorithm(alg);
  let current = state;
  for (const m of moves) {
    current = applyMove(current, m);
  }
  return current;
}

// Inverse of an algorithm
export function invertAlgorithm(alg: string | StandardMove[]): string {
  const moves = Array.isArray(alg) ? alg : parseAlgorithm(alg);
  const invMoves = moves.slice().reverse().map((m) => {
    if (m.endsWith('2')) return m;
    if (m.endsWith("'")) return m[0] as StandardMove;
    return `${m}'` as StandardMove;
  });
  return invMoves.join(' ');
}

// Commutator [A, B] = A B A' B'
export function makeCommutator(algoA: string, algoB: string): string {
  const invA = invertAlgorithm(algoA);
  const invB = invertAlgorithm(algoB);
  return `${algoA} ${algoB} ${invA} ${invB}`.trim();
}

// Conjugate A B A'
export function makeConjugate(setupA: string, opB: string): string {
  const invA = invertAlgorithm(setupA);
  return `${setupA} ${opB} ${invA}`.trim();
}

// Compute Disjoint Cycle Decomposition
export function computeCycleDecomposition(
  perm: number[], // perm[i] is where element i goes
  labels: string[]
): DisjointCycle[] {
  const visited = new Set<number>();
  const cycles: DisjointCycle[] = [];

  for (let i = 0; i < perm.length; i++) {
    if (visited.has(i)) continue;
    // Walk cycle
    const currentCycle: number[] = [];
    let curr = i;
    while (!visited.has(curr)) {
      visited.add(curr);
      currentCycle.push(curr);
      curr = perm[curr];
    }

    // Only include cycles of length > 1 for standard cycle notation
    if (currentCycle.length > 1) {
      cycles.push({
        elements: currentCycle.map((idx) => labels[idx]),
        length: currentCycle.length,
      });
    }
  }

  return cycles;
}

// Compute Permutation Parity (+1 even, -1 odd)
export function getPermutationParity(perm: number[]): 'even' | 'odd' {
  let inversions = 0;
  for (let i = 0; i < perm.length; i++) {
    for (let j = i + 1; j < perm.length; j++) {
      if (perm[i] > perm[j]) inversions++;
    }
  }
  return inversions % 2 === 0 ? 'even' : 'odd';
}

// Greatest Common Divisor and Least Common Multiple
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

// Exact order calculation ord(g) of an algorithm g in the group G
export function computeElementOrder(algo: string): number {
  const moves = parseAlgorithm(algo);
  if (moves.length === 0) return 1;

  // Simulate applying algorithm up to 1260 times (max possible order of any element in Rubik's cube group is 1260!)
  // In G, the maximum order of any element is lcm of possible cycle structures = 1260.
  const initial = createInitialCubeState();
  let current = cloneCubeState(initial);
  let order = 0;

  for (let k = 1; k <= 1260; k++) {
    current = applyAlgorithm(current, moves);
    if (isStateIdentity(current, initial)) {
      order = k;
      break;
    }
  }

  return order > 0 ? order : 1260;
}

export function isStateIdentity(s1: CubeState, s2: CubeState = createInitialCubeState()): boolean {
  for (let i = 0; i < 8; i++) {
    if (s1.corners[i].pos !== s2.corners[i].pos || s1.corners[i].orientation !== s2.corners[i].orientation) {
      return false;
    }
  }
  for (let i = 0; i < 12; i++) {
    if (s1.edges[i].pos !== s2.edges[i].pos || s1.edges[i].orientation !== s2.edges[i].orientation) {
      return false;
    }
  }
  return true;
}

// Move Analysis for any applied transformation
export function analyzeTransformation(
  beforeState: CubeState,
  afterState: CubeState,
  moveName: string
): MoveAnalysis {
  // Corner permutation: where did position i move to?
  // Let cornerAtBefore[p] be the corner id at pos p
  const cornerAtBefore: number[] = new Array(8).fill(0);
  const cornerAtAfter: number[] = new Array(8).fill(0);
  beforeState.corners.forEach((c) => (cornerAtBefore[c.pos] = c.id));
  afterState.corners.forEach((c) => (cornerAtAfter[c.pos] = c.id));

  // The piece at pos p in before is at pos after.corners[id].pos
  const cornerPerm: number[] = new Array(8);
  for (let p = 0; p < 8; p++) {
    const id = cornerAtBefore[p];
    cornerPerm[p] = afterState.corners[id].pos;
  }

  // Edge permutation
  const edgeAtBefore: number[] = new Array(12).fill(0);
  beforeState.edges.forEach((e) => (edgeAtBefore[e.pos] = e.id));
  const edgePerm: number[] = new Array(12);
  for (let p = 0; p < 12; p++) {
    const id = edgeAtBefore[p];
    edgePerm[p] = afterState.edges[id].pos;
  }

  const cornerLabels = INITIAL_CORNERS.map((c) => c.name);
  const edgeLabels = INITIAL_EDGES.map((e) => e.name);

  const cornerCycles = computeCycleDecomposition(cornerPerm, cornerLabels);
  const edgeCycles = computeCycleDecomposition(edgePerm, edgeLabels);

  const fixedCorners: string[] = [];
  const affectedCorners: string[] = [];
  for (let i = 0; i < 8; i++) {
    const id = cornerAtBefore[i];
    const unchanged =
      afterState.corners[id].pos === beforeState.corners[id].pos &&
      afterState.corners[id].orientation === beforeState.corners[id].orientation;
    if (unchanged) fixedCorners.push(cornerLabels[i]);
    else affectedCorners.push(cornerLabels[i]);
  }

  const fixedEdges: string[] = [];
  const affectedEdges: string[] = [];
  for (let i = 0; i < 12; i++) {
    const id = edgeAtBefore[i];
    const unchanged =
      afterState.edges[id].pos === beforeState.edges[id].pos &&
      afterState.edges[id].orientation === beforeState.edges[id].orientation;
    if (unchanged) fixedEdges.push(edgeLabels[i]);
    else affectedEdges.push(edgeLabels[i]);
  }

  const cornerParity = getPermutationParity(cornerPerm);
  const order = computeElementOrder(moveName);

  return {
    move: moveName,
    cornerCycles,
    edgeCycles,
    stickerCycles: [],
    parity: cornerParity,
    order,
    fixedCorners,
    fixedEdges,
    affectedCorners,
    affectedEdges,
  };
}

// Compute Orbit of a piece under a set of generators (Group Action: G x X -> X)
export function computeOrbit(
  pieceType: 'corner' | 'edge',
  pieceIndex: number,
  generators: StandardMove[]
): {
  orbitPositions: number[];
  orbitNames: string[];
  reachabilityGraph: { from: number; to: number; move: string }[];
} {
  const queue: { state: CubeState; currentPos: number }[] = [];
  const visitedPositions = new Set<number>();
  const transitions: { from: number; to: number; move: string }[] = [];

  const initialState = createInitialCubeState();
  queue.push({ state: initialState, currentPos: pieceIndex });
  visitedPositions.add(pieceIndex);

  const maxPositions = pieceType === 'corner' ? 8 : 12;

  while (queue.length > 0 && visitedPositions.size < maxPositions) {
    const { state, currentPos } = queue.shift()!;

    for (const move of generators) {
      const nextState = applyMove(state, move);
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
  const labels = pieceType === 'corner' ? INITIAL_CORNERS.map((c) => c.name) : INITIAL_EDGES.map((e) => e.name);
  const orbitNames = orbitPositions.map((idx) => labels[idx]);

  return {
    orbitPositions,
    orbitNames,
    reachabilityGraph: transitions,
  };
}

// Presets for Subgroups
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
// SOLUTION ORBIT VALIDATION & COSETS (1/12)
// ==========================================

export interface OrbitValidationResult {
  isValidOrbit: boolean;
  cornerTwistSum: number; // 0, 1, 2
  isCornerTwistValid: boolean;
  edgeFlipSum: number; // 0, 1
  isEdgeFlipValid: boolean;
  cornerParity: 'even' | 'odd';
  edgeParity: 'even' | 'odd';
  isParityValid: boolean;
  cosetIndex: number; // 0..11 (0 is the valid group G)
  totalPhysicalStates: string;
  validOrbitStates: string;
  solvabilityProbability: string;
}

export function validateSolutionOrbit(state: CubeState): OrbitValidationResult {
  const cornerPerm = state.corners.map((c) => c.pos);
  const edgePerm = state.edges.map((e) => e.pos);
  const cornerParity = getPermutationParity(cornerPerm);
  const edgeParity = getPermutationParity(edgePerm);
  const isParityValid = cornerParity === edgeParity;

  const cornerTwistSum = ((state.corners.reduce((sum, c) => sum + ((c.orientation % 3) + 3) % 3, 0)) % 3 + 3) % 3;
  const isCornerTwistValid = cornerTwistSum === 0;

  const edgeFlipSum = ((state.edges.reduce((sum, e) => sum + ((e.orientation % 2) + 2) % 2, 0)) % 2 + 2) % 2;
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

export function simulateCornerTwist(state: CubeState, cornerId = 0, delta = 1): CubeState {
  const next = cloneCubeState(state);
  const c = next.corners.find((x) => x.id === cornerId) || next.corners[0];
  c.orientation = ((c.orientation + delta) % 3 + 3) % 3;
  return next;
}

export function simulateEdgeFlip(state: CubeState, edgeId = 0): CubeState {
  const next = cloneCubeState(state);
  const e = next.edges.find((x) => x.id === edgeId) || next.edges[0];
  e.orientation = ((e.orientation + 1) % 2 + 2) % 2;
  return next;
}

export function simulatePieceSwap(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  if (next.corners.length >= 2) {
    const tempPos = next.corners[0].pos;
    next.corners[0].pos = next.corners[1].pos;
    next.corners[1].pos = tempPos;
  }
  return next;
}

export function repairToValidOrbit(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  // 1. Fix corner twist sum
  const twistSum = ((next.corners.reduce((s, c) => s + ((c.orientation % 3) + 3) % 3, 0)) % 3 + 3) % 3;
  if (twistSum !== 0) {
    next.corners[0].orientation = ((next.corners[0].orientation - twistSum) % 3 + 3) % 3;
  }
  // 2. Fix edge flip sum
  const flipSum = ((next.edges.reduce((s, e) => s + ((e.orientation % 2) + 2) % 2, 0)) % 2 + 2) % 2;
  if (flipSum !== 0) {
    next.edges[0].orientation = ((next.edges[0].orientation + 1) % 2 + 2) % 2;
  }
  // 3. Fix parity
  const cornerParity = getPermutationParity(next.corners.map((c) => c.pos));
  const edgeParity = getPermutationParity(next.edges.map((e) => e.pos));
  if (cornerParity !== edgeParity) {
    const tempPos = next.corners[0].pos;
    next.corners[0].pos = next.corners[1].pos;
    next.corners[1].pos = tempPos;
  }
  return next;
}

// ==========================================
// INTERACTIVE RUBIK'S CUBE TUTORIAL PRESETS
// ==========================================

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
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    id: 'white_cross',
    title: 'The White Cross',
    titleBg: 'Бял Кръст',
    subtitle: 'Orienting & aligning the 4 white edges',
    subtitleBg: 'Ориентиране и напасване на 4-те бели ръба',
    goal: 'Form a white cross on the bottom/top face with edge side-colors matching their lateral centers.',
    goalBg: 'Изграждане на бял кръст, при който страничните цветове на ръбовете съвпадат със страничните центрове.',
    algorithm: "F R' D' R F2",
    algorithmName: 'Edge Insertion & Alignment',
    algorithmNameBg: 'Вмъкване и напасване на ръб',
    mathExplanation: 'Action of generator turns on the edge set E. Moving edges into the U orbit without breaking already placed edges.',
    mathExplanationBg: 'Действие на генераторите върху множеството на ръбовете E. Придвижване на ръб в U орбитата, запазвайки вече поставените.',
    tips: 'Create the "Daisy" first (4 white edges around yellow center), then turn each matching face 180° into the white cross.',
    tipsBg: 'Първо направете „Маргаритка“ (4 бели ръба около жълтия център), след което завъртете всяка съвпадаща стена на 180° към белия център.',
  },
  {
    stepNumber: 2,
    id: 'first_layer_corners',
    title: 'First Layer Corners',
    titleBg: 'Върхове на Първия Слой',
    subtitle: 'Completing the entire first layer',
    subtitleBg: 'Завършване на целия първи слой',
    goal: 'Place all 4 white corners into their correct positions and orientations.',
    goalBg: 'Поставяне на 4-те бели върха на техните правилни позиции с правилна ориентация.',
    algorithm: "R U R' U'",
    algorithmName: 'Right Trigger [R, U]',
    algorithmNameBg: 'Десен тригер: Комутаторен фрагмент [R, U]',
    mathExplanation: 'The 4-move sequence is the canonical trigger [R, U] = R U R⁻¹ U⁻¹. Repeating it 1 to 5 times cycles and twists the corner piece into place while restoring the remaining cube structure.',
    mathExplanationBg: '4-ходовата последователност е каноничният тригер [R, U] = R U R⁻¹ U⁻¹. Повтарянето му 1 до 5 пъти завърта и поставя върха на място, запазвайки останалата структура.',
    tips: 'Hold the target corner slot directly below the corner piece, then repeat R U R\' U\' until white faces down.',
    tipsBg: 'Дръжте целевата позиция под върха и повтаряйте R U R\' U\', докато белият стикер застане отдолу.',
  },
  {
    stepNumber: 3,
    id: 'second_layer_edges',
    title: 'Second Layer (Middle Edges)',
    titleBg: 'Втори Слой (Средни Ръбове)',
    subtitle: 'Inserting the 4 equatorial edges',
    subtitleBg: 'Вмъкване на 4-те екваториални ръба',
    goal: 'Solve the middle layer by slotting the 4 non-yellow edges (FR, FL, BR, BL).',
    goalBg: 'Решаване на средния слой чрез вмъкване на 4-те нежълти ръба (FR, FL, BR, BL).',
    algorithm: "U R U' R' U' F' U F",
    algorithmName: 'Right-Edge Insertion (Conjugated Commutator)',
    algorithmNameBg: 'Вмъкване надясно (Конюгиран комутатор)',
    mathExplanation: 'A conjugated commutator of form g = [R, U] · [F\', U\']. It operates on the stabilizer Stab_G(Layer 1), leaving the entire solved first layer invariant!',
    mathExplanationBg: 'Конюгиран комутатор от вида g = [R, U] · [F\', U\']. Той действа в стабилизатора Stab_G(Слой 1), оставяйки целия първи слой инвариантен!',
    tips: 'Align edge with matching center; to insert left instead of right, use mirror: U\' L\' U L U F U\' F\'.',
    tipsBg: 'Напаснете ръба с центъра; за вмъкване наляво използвайте огледалния алгоритъм: U\' L\' U L U F U\' F\'.',
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
    mathExplanation: 'Conjugating the right trigger [R, U] by F flips exactly 2 edges on the top face without permuting or flipping lower layer pieces. Edge flip sum invariant Σ flip ≡ 0 (mod 2) is strictly conserved.',
    mathExplanationBg: 'Конюгирането на тригера [R, U] с F обръща точно 2 ръба на горната страна. Инвариантът за сумата от обръщания Σ flip ≡ 0 (mod 2) се спазва стриктно.',
    tips: 'If you have an L-shape, hold it in top-left (9 and 12 o\'clock). If a horizontal line, hold it horizontally.',
    tipsBg: 'При L-форма я дръжте горе-вляво (на 9 и 12 часа). При хоризонтална линия я дръжте хоризонтално.',
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
    mathExplanation: 'The famous Sune element! It has cycle structure that leaves edges in place and twists 3 corners with orientations (+1, +1, +1) ≡ 0 (mod 3), preserving the Corner Twist Invariant.',
    mathExplanationBg: 'Известният алгоритъм Sune! Запазва ръбовете и завърта 3 върха с ориентации (+1, +1, +1) ≡ 0 (mod 3), спазвайки инварианта за върховете.',
    tips: 'If 1 corner is yellow (Fish shape), place it at bottom-left and perform Sune.',
    tipsBg: 'Ако точно 1 връх е жълт (форма на Рибка), поставете го долу-вляво и изпълнете Sune.',
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
    mathExplanation: 'A pure 3-cycle of corners (C_a → C_b → C_c). Since a 3-cycle has even permutation parity sgn = +1, this preserves the fundamental Parity Invariant sgn(σ) = sgn(τ).',
    mathExplanationBg: 'Чист 3-цикъл на върхове (C_a → C_b → C_c). Тъй като 3-цикълът има четна пермутационна четност sgn = +1, той спазва фундаменталния инвариант за четност.',
    tips: 'Hold two matching corner colors (headlights) at the back, then execute the algorithm.',
    tipsBg: 'Дръжте двата съвпадащи цвята на върхове („фарове“) откъм задната страна и изпълнете алгоритъма.',
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
    mathExplanation: 'A pure 3-cycle of edges (E_1 → E_2 → E_3). As sgn = +1 and ord(U-perm) = 3, applying it places the final edges into place, returning the entire group element to the identity e ∈ G!',
    mathExplanationBg: 'Чист 3-цикъл на ръбове (E_1 → E_2 → E_3). Тъй като sgn = +1 и ord = 3, прилагането му подрежда последните елементи и връща куба в идентитета e ∈ G!',
    tips: 'Hold the solved bar at the back. Perform the algorithm once or twice to complete the cube!',
    tipsBg: 'Дръжте напълно наредената страна отзад. Изпълнете алгоритъма веднъж или два пъти и кубът е решен!',
  },
];
