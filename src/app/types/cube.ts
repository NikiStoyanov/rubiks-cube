// Mathematical and 3D types for Rubik's Cube Group Actions

export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type StandardMove = 
  | 'U' | "U'" | 'U2'
  | 'D' | "D'" | 'D2'
  | 'F' | "F'" | 'F2'
  | 'B' | "B'" | 'B2'
  | 'L' | "L'" | 'L2'
  | 'R' | "R'" | 'R2'
  | 'M' | "M'" | 'M2'
  | 'E' | "E'" | 'E2'
  | 'S' | "S'" | 'S2';

export interface PieceCoord {
  x: number; // -1, 0, 1
  y: number; // -1, 0, 1
  z: number; // -1, 0, 1
}

export type PieceType = 'corner' | 'edge' | 'center';

export interface CornerPiece {
  id: number; // 0..7
  name: string; // e.g. "UFR"
  homePos: PieceCoord;
  pos: number; // current position 0..7
  orientation: number; // 0, 1, 2 (clockwise twists)
  faces: FaceName[]; // faces corresponding to orientations [Primary, Secondary, Tertiary]
}

export interface EdgePiece {
  id: number; // 0..11
  name: string; // e.g. "UR"
  homePos: PieceCoord;
  pos: number; // current position 0..11
  orientation: number; // 0, 1 (flipped)
  faces: FaceName[]; // [Primary, Secondary]
}

export interface CenterPiece {
  id: number; // 0..5
  name: FaceName; // 'U', 'D', 'F', 'B', 'L', 'R'
  homePos: PieceCoord;
}

export interface Sticker {
  id: number; // 0..53
  face: FaceName;
  faceIndex: number; // 0..8 on the face
  pieceType: PieceType;
  pieceId: number;
  color: string;
  defaultColor: string;
}

export interface CubeState {
  corners: CornerPiece[];
  edges: EdgePiece[];
  centers: CenterPiece[];
}

export interface DisjointCycle {
  elements: string[];
  orientations?: number[];
  length: number;
}

export interface MoveAnalysis {
  move: string;
  cornerCycles: DisjointCycle[];
  edgeCycles: DisjointCycle[];
  stickerCycles: DisjointCycle[];
  parity: 'even' | 'odd';
  order: number;
  fixedCorners: string[];
  fixedEdges: string[];
  affectedCorners: string[];
  affectedEdges: string[];
}

export type TargetSetType = 'corners' | 'edges' | 'stickers' | 'states';

export type ViewMode = '3d' | '2d';

export type AppPage = 'home' | 'math' | 'validator' | 'tutorial' | 'custom';

export interface Facelet2D {
  face: FaceName;
  row: number;
  col: number;
  color: string;
  pieceType: PieceType;
  pieceId: number;
  name?: string;
}

export type Net2DFaces = Record<FaceName, Facelet2D[][]>;

export interface SubgroupPreset {
  id: string;
  name: string;
  nameBg?: string;
  formula: string;
  generators: StandardMove[];
  description: string;
  descriptionBg?: string;
  orderApprox: string;
}

export interface AlgorithmPreset {
  id: string;
  name: string;
  nameBg?: string;
  category: 'Commutators' | 'Conjugates' | 'Center / Symmetry' | 'Classic Cycles';
  alg: string;
  order: number;
  description: string;
  descriptionBg?: string;
  groupNote: string;
  groupNoteBg?: string;
}
