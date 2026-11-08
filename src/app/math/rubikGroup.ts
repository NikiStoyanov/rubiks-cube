import {
  CornerPiece,
  EdgePiece,
  CenterPiece,
  CubeState,
  DisjointCycle,
  FaceName,
  MoveAnalysis,
  StandardMove,
  SubgroupPreset,
  AlgorithmPreset,
  Facelet2D,
  Net2DFaces,
} from '../types/cube';
import { Permutation } from './permutation';
import {
  FACE_COLORS,
  FACE_NAMES,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  INITIAL_CENTERS,
  BASE_TURNS,
  FaceTurnDef,
  OrbitValidationResult,
  RubikGroupAlgebra,
  CauchyTheoremWitness,
  SUBGROUP_PRESETS,
  ALGORITHM_PRESETS,
  TutorialStep,
  TUTORIAL_STEPS,
} from './group-algebra';

export {
  FACE_COLORS,
  FACE_NAMES,
  INITIAL_CORNERS,
  INITIAL_EDGES,
  INITIAL_CENTERS,
  BASE_TURNS,
  RubikGroupAlgebra,
  SUBGROUP_PRESETS,
  ALGORITHM_PRESETS,
  TUTORIAL_STEPS,
};

export type {
  FaceTurnDef,
  OrbitValidationResult,
  CauchyTheoremWitness,
  TutorialStep,
};

export function createInitialCubeState(): CubeState {
  return RubikGroupAlgebra.createIdentityState();
}

export function cloneCubeState(state: CubeState): CubeState {
  return RubikGroupAlgebra.cloneState(state);
}

export function createDefault2DNet(): Net2DFaces {
  return RubikGroupAlgebra.compute2DNet(RubikGroupAlgebra.createIdentityState());
}

export function applyBaseTurn(state: CubeState, face: FaceName): CubeState {
  return RubikGroupAlgebra.applyBaseTurn(state, face);
}

export function applyMove(state: CubeState, move: StandardMove | string): CubeState {
  return RubikGroupAlgebra.applyMove(state, move);
}

export function parseAlgorithm(alg: string): StandardMove[] {
  return RubikGroupAlgebra.parseAlgorithm(alg);
}

export function applyAlgorithm(state: CubeState, alg: string | readonly StandardMove[]): CubeState {
  return RubikGroupAlgebra.applyAlgorithm(state, alg);
}

export function invertAlgorithm(alg: string | readonly StandardMove[]): string {
  return RubikGroupAlgebra.invertAlgorithm(alg);
}

export function makeCommutator(algoA: string, algoB: string): string {
  return RubikGroupAlgebra.makeCommutator(algoA, algoB);
}

export function makeConjugate(setupA: string, opB: string): string {
  return RubikGroupAlgebra.makeConjugate(setupA, opB);
}

export function computeCycleDecomposition(perm: number[], labels: string[]): DisjointCycle[] {
  const p = new Permutation(perm);
  return p.getDisjointCycles(labels);
}

export function getPermutationParity(perm: number[]): 'even' | 'odd' {
  const p = new Permutation(perm);
  return p.getParity();
}

export function gcd(a: number, b: number): number {
  return Permutation.gcd(a, b);
}

export function lcm(a: number, b: number): number {
  return Permutation.lcm(a, b);
}

export function computeElementOrder(algo: string): number {
  return RubikGroupAlgebra.computeElementOrder(algo);
}

export function isStateIdentity(
  s1: CubeState,
  s2: CubeState = RubikGroupAlgebra.createIdentityState()
): boolean {
  return RubikGroupAlgebra.isIdentity(s1, s2);
}

export function analyzeTransformation(
  beforeState: CubeState,
  afterState: CubeState,
  moveName: string
): MoveAnalysis {
  return RubikGroupAlgebra.analyzeTransformation(beforeState, afterState, moveName);
}

export function computeOrbit(
  pieceType: 'corner' | 'edge',
  pieceIndex: number,
  generators: StandardMove[]
): {
  orbitPositions: number[];
  orbitNames: string[];
  reachabilityGraph: { from: number; to: number; move: string }[];
} {
  return RubikGroupAlgebra.computeOrbit(pieceType, pieceIndex, generators);
}

export function validateSolutionOrbit(state: CubeState): OrbitValidationResult {
  return RubikGroupAlgebra.validateSolutionOrbit(state);
}

export function simulateCornerTwist(state: CubeState, cornerId = 0, delta = 1): CubeState {
  return RubikGroupAlgebra.simulateCornerTwist(state, cornerId, delta);
}

export function simulateEdgeFlip(state: CubeState, edgeId = 0): CubeState {
  return RubikGroupAlgebra.simulateEdgeFlip(state, edgeId);
}

export function simulatePieceSwap(state: CubeState): CubeState {
  return RubikGroupAlgebra.simulatePieceSwap(state);
}

export function repairToValidOrbit(state: CubeState): CubeState {
  return RubikGroupAlgebra.repairToValidOrbit(state);
}

