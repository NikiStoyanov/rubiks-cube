import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  CubeState, 
  CornerPiece, 
  EdgePiece, 
  FaceName, 
  PieceCoord, 
  DisjointCycle,
  Facelet2D,
  Net2DFaces,
  PieceType
} from '../types/cube';
import { FACE_COLORS, INITIAL_CORNERS, INITIAL_EDGES, INITIAL_CENTERS, RubikGroupAlgebra } from '../math/group-algebra';

export interface HighlightConfig {
  selectedPieceType?: 'corner' | 'edge' | 'all';
  selectedPieceId?: number;
  orbitPieces?: { type: 'corner' | 'edge'; id: number }[];
  fixedPieces?: { type: 'corner' | 'edge'; id: number }[];
  affectedPieces?: { type: 'corner' | 'edge'; id: number }[];
  showCycleArrows?: boolean;
  cycleData?: DisjointCycle[];
  explodedOffset?: number;
}

interface CubieMeshInfo {
  mesh: THREE.Group;
  baseMaterials: THREE.MeshStandardMaterial[];
  pieceType: 'corner' | 'edge' | 'center';
  pieceId: number;
  defaultCoord: PieceCoord;
  currentCoord: PieceCoord;
  outlineMesh?: THREE.LineSegments;
  highlightBox?: THREE.Mesh;
}

export class RubiksCube3D {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animationFrameId: number | null = null;

  private cubeGroup: THREE.Group;
  private pivotGroup: THREE.Group;
  private arrowsGroup: THREE.Group;
  private cubieMeshes: CubieMeshInfo[] = [];

  // Animation state
  public isAnimating = false;
  private animationQueue: {
    move: string;
    onComplete?: () => void;
  }[] = [];
  private currentAnimation: {
    axis: THREE.Vector3;
    targetAngle: number;
    currentAngle: number;
    cubies: THREE.Group[];
    onComplete?: () => void;
  } | null = null;

  public animationSpeed = 0.22; // radians per step
  public explodeFactor = 0;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public onPieceClick?: (pieceType: 'corner' | 'edge', pieceId: number, name: string) => void;
  public onStickerClick?: (event: {
    face: FaceName;
    row: number;
    col: number;
    pieceType: 'corner' | 'edge' | 'center';
    pieceId: number;
    materialIndex: number;
    bodyMesh: THREE.Mesh;
  }) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(5.2, 4.5, 6.2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 14;

    // Groups
    this.cubeGroup = new THREE.Group();
    this.pivotGroup = new THREE.Group();
    this.arrowsGroup = new THREE.Group();
    this.scene.add(this.cubeGroup);
    this.scene.add(this.pivotGroup);
    this.scene.add(this.arrowsGroup);

    this.setupLighting();
    this.buildCube();

    // Event listeners
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointerup', this.handlePointerUp);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(12, 16, 14);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8bc9ff, 0.7);
    dirLight2.position.set(-12, -10, -12);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.4, 20);
    pointLight.position.set(0, 0, 7);
    this.scene.add(pointLight);
  }

  private buildCube(): void {
    const size = 0.94;
    const innerColor = 0x18181b;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue; // center empty

          const cubieGroup = new THREE.Group();
          cubieGroup.position.set(x, y, z);

          // Box geometry
          const bodyGeom = new THREE.BoxGeometry(size, size, size);

          // Materials: [+X, -X, +Y, -Y, +Z, -Z]
          const materials: THREE.MeshStandardMaterial[] = [
            this.createFaceMaterial(x === 1 ? FACE_COLORS.R : innerColor, x === 1), // +X Right (Red)
            this.createFaceMaterial(x === -1 ? FACE_COLORS.L : innerColor, x === -1), // -X Left (Orange)
            this.createFaceMaterial(y === 1 ? FACE_COLORS.U : innerColor, y === 1), // +Y Up (White)
            this.createFaceMaterial(y === -1 ? FACE_COLORS.D : innerColor, y === -1), // -Y Down (Yellow)
            this.createFaceMaterial(z === 1 ? FACE_COLORS.F : innerColor, z === 1), // +Z Front (Green)
            this.createFaceMaterial(z === -1 ? FACE_COLORS.B : innerColor, z === -1), // -Z Back (Blue)
          ];

          const bodyMesh = new THREE.Mesh(bodyGeom, materials);
          bodyMesh.castShadow = true;
          bodyMesh.receiveShadow = true;
          cubieGroup.add(bodyMesh);

          // Glowing wireframe outline for highlighting
          const edgesGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(size * 1.05, size * 1.05, size * 1.05));
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            linewidth: 3,
            transparent: true,
            opacity: 1,
            depthTest: false,
          });
          const outline = new THREE.LineSegments(edgesGeom, lineMaterial);
          outline.renderOrder = 999;
          outline.visible = false;
          cubieGroup.add(outline);

          // Translucent glowing halo box
          const boxGeom = new THREE.BoxGeometry(size * 1.04, size * 1.04, size * 1.04);
          const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.25,
            depthWrite: false,
            depthTest: false,
            side: THREE.DoubleSide,
          });
          const highlightBox = new THREE.Mesh(boxGeom, boxMaterial);
          highlightBox.renderOrder = 998;
          highlightBox.visible = false;
          cubieGroup.add(highlightBox);

          // Determine piece type and id
          const isCorner = Math.abs(x) + Math.abs(y) + Math.abs(z) === 3;
          const isEdge = Math.abs(x) + Math.abs(y) + Math.abs(z) === 2;
          const pieceType = isCorner ? 'corner' : isEdge ? 'edge' : 'center';

          let pieceId = 0;
          if (isCorner) {
            const found = INITIAL_CORNERS.find(
              (c) => c.homePos.x === x && c.homePos.y === y && c.homePos.z === z
            );
            if (found) pieceId = found.id;
          } else if (isEdge) {
            const found = INITIAL_EDGES.find(
              (e) => e.homePos.x === x && e.homePos.y === y && e.homePos.z === z
            );
            if (found) pieceId = found.id;
          } else {
            const found = INITIAL_CENTERS.find(
              (c) => c.homePos.x === x && c.homePos.y === y && c.homePos.z === z
            );
            if (found) pieceId = found.id;
          }

          cubieGroup.userData = {
            pieceType,
            pieceId,
            defaultCoord: { x, y, z },
          };

          this.cubieMeshes.push({
            mesh: cubieGroup,
            baseMaterials: materials,
            pieceType,
            pieceId,
            defaultCoord: { x, y, z },
            currentCoord: { x, y, z },
            outlineMesh: outline,
            highlightBox,
          });

          this.cubeGroup.add(cubieGroup);
        }
      }
    }
  }

  private createFaceMaterial(color: string | number, isSticker: boolean): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: isSticker ? 0.25 : 0.85,
      metalness: isSticker ? 0.08 : 0.05,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  }

  public setExplode(factor: number): void {
    this.explodeFactor = Math.max(0, Math.min(1.5, factor));
    this.updateCubiePositions();
  }

  private updateCubiePositions(): void {
    const spacing = 1.0 + this.explodeFactor * 0.7;
    for (const c of this.cubieMeshes) {
      c.mesh.position.set(
        c.currentCoord.x * spacing,
        c.currentCoord.y * spacing,
        c.currentCoord.z * spacing
      );
    }
  }

  // Snap position & quaternion to exact orthogonal grid
  private snapCubie(cubie: THREE.Group, info: CubieMeshInfo): void {
    const spacing = 1.0 + this.explodeFactor * 0.7;
    const rx = Math.round(cubie.position.x / spacing);
    const ry = Math.round(cubie.position.y / spacing);
    const rz = Math.round(cubie.position.z / spacing);

    info.currentCoord = { x: rx, y: ry, z: rz };
    cubie.position.set(rx * spacing, ry * spacing, rz * spacing);

    // Snap quaternion
    const m = new THREE.Matrix4().makeRotationFromQuaternion(cubie.quaternion);
    const te = m.elements;
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 3 || i >= 12) continue;
      te[i] = Math.round(te[i]);
    }
    cubie.quaternion.setFromRotationMatrix(m);
    cubie.updateMatrixWorld(true);
  }

  // Read the mathematically authentic CubeState directly from the 3D meshes
  public getCubeState(): CubeState {
    const corners: CornerPiece[] = [];
    const edges: EdgePiece[] = [];
    const centers = INITIAL_CENTERS.map((c) => ({ ...c }));

    for (const c of this.cubieMeshes) {
      if (c.pieceType === 'corner') {
        const posIdx = INITIAL_CORNERS.findIndex(
          (ic) => ic.homePos.x === c.currentCoord.x &&
                  ic.homePos.y === c.currentCoord.y &&
                  ic.homePos.z === c.currentCoord.z
        );

        // Compute orientation twist (0, 1, 2)
        const vPrimary = new THREE.Vector3(0, c.defaultCoord.y, 0);
        const vCur = vPrimary.clone().applyQuaternion(c.mesh.quaternion);
        let orientation = 0;

        if (Math.round(vCur.y) === c.currentCoord.y) {
          orientation = 0;
        } else {
          // Check 120 vs 240 degree twist around current diagonal axis
          const diag = new THREE.Vector3(c.currentCoord.x, c.currentCoord.y, c.currentCoord.z).normalize();
          const q120 = new THREE.Quaternion().setFromAxisAngle(diag, (2 * Math.PI) / 3);
          const v120 = new THREE.Vector3(0, c.currentCoord.y, 0).applyQuaternion(q120);

          if (Math.round(vCur.x) === Math.round(v120.x) && Math.round(vCur.z) === Math.round(v120.z)) {
            orientation = 1;
          } else {
            orientation = 2;
          }
        }

        corners.push({
          id: c.pieceId,
          name: INITIAL_CORNERS[c.pieceId].name,
          homePos: { ...INITIAL_CORNERS[c.pieceId].homePos },
          pos: posIdx !== -1 ? posIdx : c.pieceId,
          orientation,
          faces: [...INITIAL_CORNERS[c.pieceId].faces],
        });
      } else if (c.pieceType === 'edge') {
        const posIdx = INITIAL_EDGES.findIndex(
          (ie) => ie.homePos.x === c.currentCoord.x &&
                  ie.homePos.y === c.currentCoord.y &&
                  ie.homePos.z === c.currentCoord.z
        );

        // Compute edge orientation flip (0 or 1)
        const isDefaultUD = c.defaultCoord.y !== 0;
        const vPrimary = isDefaultUD
          ? new THREE.Vector3(0, c.defaultCoord.y, 0)
          : new THREE.Vector3(0, 0, c.defaultCoord.z);
        const vCur = vPrimary.clone().applyQuaternion(c.mesh.quaternion);

        const curIsUD = c.currentCoord.y !== 0;
        let orientation = 0;
        if (curIsUD) {
          orientation = Math.abs(Math.round(vCur.y)) === 1 ? 0 : 1;
        } else {
          orientation = Math.abs(Math.round(vCur.z)) === 1 ? 0 : 1;
        }

        edges.push({
          id: c.pieceId,
          name: INITIAL_EDGES[c.pieceId].name,
          homePos: { ...INITIAL_EDGES[c.pieceId].homePos },
          pos: posIdx !== -1 ? posIdx : c.pieceId,
          orientation,
          faces: [...INITIAL_EDGES[c.pieceId].faces],
        });
      }
    }

    corners.sort((a, b) => a.id - b.id);
    edges.sort((a, b) => a.id - b.id);

    return { corners, edges, centers };
  }

  // Reset all 3D meshes to default solved state
  public resetToIdentity(): void {
    for (const c of this.cubieMeshes) {
      c.currentCoord = { ...c.defaultCoord };
      c.mesh.quaternion.identity();
      c.mesh.rotation.set(0, 0, 0);

      const bodyMesh = c.mesh.children[0] as THREE.Mesh;
      if (bodyMesh && Array.isArray(bodyMesh.material)) {
        const mats = bodyMesh.material as THREE.MeshStandardMaterial[];
        const { x, y, z } = c.defaultCoord;
        if (x === 1) mats[0].color.setStyle(FACE_COLORS.R);
        if (x === -1) mats[1].color.setStyle(FACE_COLORS.L);
        if (y === 1) mats[2].color.setStyle(FACE_COLORS.U);
        if (y === -1) mats[3].color.setStyle(FACE_COLORS.D);
        if (z === 1) mats[4].color.setStyle(FACE_COLORS.F);
        if (z === -1) mats[5].color.setStyle(FACE_COLORS.B);
      }
    }
    this.updateCubiePositions();
  }

  // Apply arbitrary custom CubeState to 3D meshes by resetting coords and painting facelets
  public applyCustomState(state: CubeState): void {
    this.clearCycleArrows();
    this.resetToIdentity();
    const net = RubikGroupAlgebra.compute2DNet(state);
    this.applyNetColors(net);
  }

  // Directly paint 3D outer facelet stickers according to a 2D Net
  public applyNetColors(net: Net2DFaces): void {
    for (const c of this.cubieMeshes) {
      const bodyMesh = c.mesh.children[0] as THREE.Mesh;
      if (!bodyMesh || !Array.isArray(bodyMesh.material)) continue;
      const mats = bodyMesh.material as THREE.MeshStandardMaterial[];
      const { x, y, z } = c.defaultCoord;

      const setMat = (idx: number, hex?: string) => {
        if (hex && mats[idx]) {
          mats[idx].color.set(hex);
          mats[idx].needsUpdate = true;
        }
      };

      // +X: R face (index 0)
      if (x === 1) {
        const r = 1 - y;
        const col = 1 - z;
        setMat(0, net.R?.[r]?.[col]?.color);
      }
      // -X: L face (index 1)
      if (x === -1) {
        const r = 1 - y;
        const col = z + 1;
        setMat(1, net.L?.[r]?.[col]?.color);
      }
      // +Y: U face (index 2)
      if (y === 1) {
        const r = z + 1;
        const col = x + 1;
        setMat(2, net.U?.[r]?.[col]?.color);
      }
      // -Y: D face (index 3)
      if (y === -1) {
        const r = 1 - z;
        const col = x + 1;
        setMat(3, net.D?.[r]?.[col]?.color);
      }
      // +Z: F face (index 4)
      if (z === 1) {
        const r = 1 - y;
        const col = x + 1;
        setMat(4, net.F?.[r]?.[col]?.color);
      }
      // -Z: B face (index 5)
      if (z === -1) {
        const r = 1 - y;
        const col = 1 - x;
        setMat(5, net.B?.[r]?.[col]?.color);
      }
    }
  }

  // Paint a single sticker on a cubie mesh immediately
  public paintStickerMesh(bodyMesh: THREE.Mesh, materialIndex: number, colorHex: string): void {
    if (bodyMesh && Array.isArray(bodyMesh.material) && materialIndex >= 0 && materialIndex < 6) {
      const mat = bodyMesh.material[materialIndex] as THREE.MeshStandardMaterial;
      if (mat && mat.color) {
        mat.color.set(colorHex);
        mat.needsUpdate = true;
      }
    }
  }

  // Physical tampering simulation methods for Orbit Validator
  public twistCornerMesh(pieceId: number, twistDelta: number): void {
    const c = this.cubieMeshes.find((m) => m.pieceType === 'corner' && m.pieceId === pieceId);
    if (!c) return;
    const axis = new THREE.Vector3(c.currentCoord.x, c.currentCoord.y, c.currentCoord.z).normalize();
    const q = new THREE.Quaternion().setFromAxisAngle(axis, twistDelta * (2 * Math.PI / 3));
    c.mesh.quaternion.premultiply(q);
    c.mesh.updateMatrixWorld(true);
  }

  public flipEdgeMesh(pieceId: number): void {
    const c = this.cubieMeshes.find((m) => m.pieceType === 'edge' && m.pieceId === pieceId);
    if (!c) return;
    const tangent = new THREE.Vector3(
      c.currentCoord.x === 0 ? 1 : 0,
      c.currentCoord.y === 0 ? 1 : 0,
      c.currentCoord.z === 0 ? 1 : 0
    );
    const q = new THREE.Quaternion().setFromAxisAngle(tangent, Math.PI);
    c.mesh.quaternion.premultiply(q);
    c.mesh.updateMatrixWorld(true);
  }

  public swapPiecesMesh(type: 'corner' | 'edge', id1: number, id2: number): void {
    const c1 = this.cubieMeshes.find((m) => m.pieceType === type && m.pieceId === id1);
    const c2 = this.cubieMeshes.find((m) => m.pieceType === type && m.pieceId === id2);
    if (!c1 || !c2) return;
    const tmpCoord = { ...c1.currentCoord };
    c1.currentCoord = { ...c2.currentCoord };
    c2.currentCoord = tmpCoord;
    this.updateCubiePositions();
  }

  // Generate 2D Unfolded Net representation of all 6 faces
  public get2DNet(): Net2DFaces {
    const result: Partial<Net2DFaces> = {};

    const faceConfigs: {
      face: FaceName;
      normal: THREE.Vector3;
      getCoords: (row: number, col: number) => { x: number; y: number; z: number };
    }[] = [
      {
        face: 'U',
        normal: new THREE.Vector3(0, 1, 0),
        getCoords: (r, c) => ({ x: c - 1, y: 1, z: r - 1 }),
      },
      {
        face: 'D',
        normal: new THREE.Vector3(0, -1, 0),
        getCoords: (r, c) => ({ x: c - 1, y: -1, z: 1 - r }),
      },
      {
        face: 'F',
        normal: new THREE.Vector3(0, 0, 1),
        getCoords: (r, c) => ({ x: c - 1, y: 1 - r, z: 1 }),
      },
      {
        face: 'B',
        normal: new THREE.Vector3(0, 0, -1),
        getCoords: (r, c) => ({ x: 1 - c, y: 1 - r, z: -1 }),
      },
      {
        face: 'L',
        normal: new THREE.Vector3(-1, 0, 0),
        getCoords: (r, c) => ({ x: -1, y: 1 - r, z: c - 1 }),
      },
      {
        face: 'R',
        normal: new THREE.Vector3(1, 0, 0),
        getCoords: (r, c) => ({ x: 1, y: 1 - r, z: 1 - c }),
      },
    ];

    const materialNormals = [
      new THREE.Vector3(1, 0, 0),  // 0: +X (R)
      new THREE.Vector3(-1, 0, 0), // 1: -X (L)
      new THREE.Vector3(0, 1, 0),  // 2: +Y (U)
      new THREE.Vector3(0, -1, 0), // 3: -Y (D)
      new THREE.Vector3(0, 0, 1),  // 4: +Z (F)
      new THREE.Vector3(0, 0, -1), // 5: -Z (B)
    ];

    const materialColors = [
      FACE_COLORS.R,
      FACE_COLORS.L,
      FACE_COLORS.U,
      FACE_COLORS.D,
      FACE_COLORS.F,
      FACE_COLORS.B,
    ];

    for (const config of faceConfigs) {
      const grid: Facelet2D[][] = [];
      for (let r = 0; r < 3; r++) {
        const row: Facelet2D[] = [];
        for (let c = 0; c < 3; c++) {
          const target = config.getCoords(r, c);
          const cubie = this.cubieMeshes.find(
            (m) =>
              m.currentCoord.x === target.x &&
              m.currentCoord.y === target.y &&
              m.currentCoord.z === target.z
          );

          let color = FACE_COLORS[config.face];
          let pieceType: PieceType = 'center';
          let pieceId = 0;
          let pieceName: string = config.face;

          if (cubie) {
            pieceType = cubie.pieceType;
            pieceId = cubie.pieceId;
            if (pieceType === 'corner') {
              pieceName = INITIAL_CORNERS[pieceId]?.name || 'Corner';
            } else if (pieceType === 'edge') {
              pieceName = INITIAL_EDGES[pieceId]?.name || 'Edge';
            }

            let bestDot = -Infinity;
            let bestIdx = 0;
            for (let m = 0; m < 6; m++) {
              const worldVec = materialNormals[m].clone().applyQuaternion(cubie.mesh.quaternion);
              const dot = worldVec.dot(config.normal);
              if (dot > bestDot) {
                bestDot = dot;
                bestIdx = m;
              }
            }
            if (bestDot > 0.5) {
              color = materialColors[bestIdx];
            }
          }

          row.push({
            face: config.face,
            row: r,
            col: c,
            color,
            pieceType,
            pieceId,
            name: pieceName,
          });
        }
        grid.push(row);
      }
      result[config.face] = grid;
    }

    return result as Net2DFaces;
  }

  // Helper to extract rotation parameters for any move
  private getMoveParameters(move: string): {
    axis: THREE.Vector3;
    angle: number;
    filter: (coord: PieceCoord) => boolean;
  } {
    const cleanMove = move.trim();
    const face = cleanMove[0].toUpperCase();
    const isInverse = cleanMove.includes("'");
    const isDouble = cleanMove.includes('2');

    let baseAngle = -Math.PI / 2; // Standard clockwise angle looking from outside
    if (isDouble) baseAngle = -Math.PI;
    if (isInverse) baseAngle = Math.PI / 2;

    let axis = new THREE.Vector3(0, 1, 0);
    let filter = (c: PieceCoord) => c.y === 1;

    switch (face) {
      case 'U':
        axis = new THREE.Vector3(0, 1, 0);
        filter = (c) => c.y === 1;
        break;
      case 'D':
        axis = new THREE.Vector3(0, -1, 0);
        filter = (c) => c.y === -1;
        break;
      case 'R':
        axis = new THREE.Vector3(1, 0, 0);
        filter = (c) => c.x === 1;
        break;
      case 'L':
        axis = new THREE.Vector3(-1, 0, 0);
        filter = (c) => c.x === -1;
        break;
      case 'F':
        axis = new THREE.Vector3(0, 0, 1);
        filter = (c) => c.z === 1;
        break;
      case 'B':
        axis = new THREE.Vector3(0, 0, -1);
        filter = (c) => c.z === -1;
        break;
      case 'M':
        axis = new THREE.Vector3(-1, 0, 0); // M follows L direction
        filter = (c) => c.x === 0;
        break;
      case 'E':
        axis = new THREE.Vector3(0, -1, 0); // E follows D direction
        filter = (c) => c.y === 0;
        break;
      case 'S':
        axis = new THREE.Vector3(0, 0, 1); // S follows F direction
        filter = (c) => c.z === 0;
        break;
    }

    return { axis, angle: baseAngle, filter };
  }

  // Execute a move instantly without animation
  public applyMoveInstant(move: string): void {
    const { axis, angle, filter } = this.getMoveParameters(move);

    this.pivotGroup.position.set(0, 0, 0);
    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.quaternion.identity();

    const affected: CubieMeshInfo[] = [];
    for (const c of this.cubieMeshes) {
      if (filter(c.currentCoord)) {
        affected.push(c);
        this.pivotGroup.attach(c.mesh);
      }
    }

    this.pivotGroup.rotateOnAxis(axis, angle);
    this.pivotGroup.updateMatrixWorld(true);

    for (const c of affected) {
      this.cubeGroup.attach(c.mesh);
      this.snapCubie(c.mesh, c);
    }
  }

  // Animate a single move
  public animateMove(move: string, onComplete?: () => void): void {
    this.animationQueue.push({ move, onComplete });
    if (!this.isAnimating) {
      this.processNextAnimation();
    }
  }

  private processNextAnimation(): void {
    if (this.animationQueue.length === 0) {
      this.isAnimating = false;
      return;
    }

    this.isAnimating = true;
    const { move, onComplete } = this.animationQueue.shift()!;
    const { axis, angle, filter } = this.getMoveParameters(move);

    this.pivotGroup.position.set(0, 0, 0);
    this.pivotGroup.rotation.set(0, 0, 0);
    this.pivotGroup.quaternion.identity();

    const rotatingCubies: THREE.Group[] = [];
    for (const c of this.cubieMeshes) {
      if (filter(c.currentCoord)) {
        rotatingCubies.push(c.mesh);
        this.pivotGroup.attach(c.mesh);
      }
    }

    this.currentAnimation = {
      axis: axis.normalize(),
      targetAngle: angle,
      currentAngle: 0,
      cubies: rotatingCubies,
      onComplete,
    };
  }

  private lastHighlightConfig?: HighlightConfig;

  // Highlight and Orbit Glow updates
  public setHighlight(config: HighlightConfig): void {
    this.lastHighlightConfig = config;

    for (const c of this.cubieMeshes) {
      let isSelected = false;
      let isOrbit = false;
      let isFixed = false;
      let isAffected = false;

      if (config.selectedPieceType === c.pieceType && config.selectedPieceId === c.pieceId) {
        isSelected = true;
      }
      if (config.orbitPieces?.some((p) => p.type === c.pieceType && p.id === c.pieceId)) {
        isOrbit = true;
      }
      if (config.fixedPieces?.some((p) => p.type === c.pieceType && p.id === c.pieceId)) {
        isFixed = true;
      }
      if (config.affectedPieces?.some((p) => p.type === c.pieceType && p.id === c.pieceId)) {
        isAffected = true;
      }

      const outline = c.outlineMesh;
      const box = c.highlightBox;

      if (isSelected) {
        if (outline) {
          outline.visible = true;
          (outline.material as THREE.LineBasicMaterial).color.setHex(0xf59e0b); // Amber
          (outline.material as THREE.LineBasicMaterial).opacity = 1.0;
        }
        if (box) {
          box.visible = true;
          (box.material as THREE.MeshBasicMaterial).color.setHex(0xf59e0b);
          (box.material as THREE.MeshBasicMaterial).opacity = 0.32;
        }
        for (const mat of c.baseMaterials) {
          mat.emissive.setHex(0x78350f);
          mat.emissiveIntensity = 0.55;
        }
      } else if (isOrbit) {
        if (outline) {
          outline.visible = true;
          (outline.material as THREE.LineBasicMaterial).color.setHex(0x06b6d4); // Cyan
          (outline.material as THREE.LineBasicMaterial).opacity = 0.95;
        }
        if (box) {
          box.visible = true;
          (box.material as THREE.MeshBasicMaterial).color.setHex(0x06b6d4);
          (box.material as THREE.MeshBasicMaterial).opacity = 0.18;
        }
        for (const mat of c.baseMaterials) {
          mat.emissive.setHex(0x0e7490);
          mat.emissiveIntensity = 0.35;
        }
      } else if (isAffected) {
        if (outline) {
          outline.visible = true;
          (outline.material as THREE.LineBasicMaterial).color.setHex(0xec4899); // Pink
          (outline.material as THREE.LineBasicMaterial).opacity = 0.9;
        }
        if (box) {
          box.visible = true;
          (box.material as THREE.MeshBasicMaterial).color.setHex(0xec4899);
          (box.material as THREE.MeshBasicMaterial).opacity = 0.18;
        }
        for (const mat of c.baseMaterials) {
          mat.emissive.setHex(0x831843);
          mat.emissiveIntensity = 0.35;
        }
      } else if (isFixed) {
        if (outline) {
          outline.visible = true;
          (outline.material as THREE.LineBasicMaterial).color.setHex(0x22c55e); // Green
          (outline.material as THREE.LineBasicMaterial).opacity = 0.85;
        }
        if (box) {
          box.visible = true;
          (box.material as THREE.MeshBasicMaterial).color.setHex(0x22c55e);
          (box.material as THREE.MeshBasicMaterial).opacity = 0.15;
        }
        for (const mat of c.baseMaterials) {
          mat.emissive.setHex(0x14532d);
          mat.emissiveIntensity = 0.25;
        }
      } else {
        if (outline) outline.visible = false;
        if (box) box.visible = false;
        for (const mat of c.baseMaterials) {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
    }

    if (config.showCycleArrows && config.cycleData && config.cycleData.length > 0) {
      this.drawCycleArrows(config.cycleData);
    } else {
      this.clearCycleArrows();
    }
  }

  private drawCycleArrows(cycles: DisjointCycle[]): void {
    this.clearCycleArrows();

    for (const cycle of cycles) {
      const len = cycle.elements.length;
      if (len <= 1) continue;

      for (let i = 0; i < len; i++) {
        const fromName = cycle.elements[i];
        const toName = cycle.elements[(i + 1) % len];

        const fromPos = this.getPieceCurrentPositionByName(fromName);
        const toPos = this.getPieceCurrentPositionByName(toName);

        if (fromPos && toPos) {
          this.createCurvedArrow(fromPos, toPos);
        }
      }
    }
  }

  private getPieceCurrentPositionByName(name: string): THREE.Vector3 | null {
    const cornerInit = INITIAL_CORNERS.find((c) => c.name === name);
    if (cornerInit) {
      const cubie = this.cubieMeshes.find(
        (c) => c.pieceType === 'corner' && c.pieceId === cornerInit.id
      );
      if (cubie) {
        return cubie.mesh.position.clone().multiplyScalar(1.2);
      }
    }

    const edgeInit = INITIAL_EDGES.find((e) => e.name === name);
    if (edgeInit) {
      const cubie = this.cubieMeshes.find(
        (c) => c.pieceType === 'edge' && c.pieceId === edgeInit.id
      );
      if (cubie) {
        return cubie.mesh.position.clone().multiplyScalar(1.2);
      }
    }
    return null;
  }

  private createCurvedArrow(from: THREE.Vector3, to: THREE.Vector3): void {
    const mid = new THREE.Vector3()
      .addVectors(from, to)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(2.7);

    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const points = curve.getPoints(24);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geometry, lineMaterial);
    this.arrowsGroup.add(line);

    const dir = new THREE.Vector3().subVectors(to, points[points.length - 2]).normalize();
    const coneGeom = new THREE.ConeGeometry(0.12, 0.28, 12);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.2,
    });
    const cone = new THREE.Mesh(coneGeom, coneMat);
    cone.position.copy(to);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.arrowsGroup.add(cone);
  }

  private clearCycleArrows(): void {
    while (this.arrowsGroup.children.length > 0) {
      const child = this.arrowsGroup.children[0];
      this.arrowsGroup.remove(child);
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
    }
  }

  private pointerDownPos = { x: 0, y: 0 };
  private pointerDownTarget: {
    face: FaceName;
    row: number;
    col: number;
    pieceType: 'corner' | 'edge' | 'center';
    pieceId: number;
    materialIndex: number;
    bodyMesh: THREE.Mesh;
    name: string;
  } | null = null;

  private getStickerAtPointer(clientX: number, clientY: number) {
    if (!this.container || !this.renderer?.domElement) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // Only raycast against the actual body meshes of the cubies (child 0), ignoring outlineMesh and highlightBox
    const bodyMeshes: THREE.Mesh[] = [];
    for (const c of this.cubieMeshes) {
      const bm = c.mesh.children[0] as THREE.Mesh;
      if (bm) bodyMeshes.push(bm);
    }

    const intersects = raycaster.intersectObjects(bodyMeshes, false);
    if (intersects.length === 0) return null;

    const hit = intersects[0];
    const bodyMesh = hit.object as THREE.Mesh;
    const cubieGroup = bodyMesh.parent as THREE.Group;
    if (!cubieGroup || !cubieGroup.userData) return null;

    const info = this.cubieMeshes.find((cm) => cm.mesh === cubieGroup);
    if (!info || !hit.face) return null;

    const { pieceType, pieceId } = cubieGroup.userData;

    // Normal in world coordinates gives face orientation
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(bodyMesh.matrixWorld);
    const worldNormal = hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();

    let faceName: FaceName | null = null;
    if (Math.abs(worldNormal.y) > 0.55) {
      faceName = worldNormal.y > 0 ? 'U' : 'D';
    } else if (Math.abs(worldNormal.z) > 0.55) {
      faceName = worldNormal.z > 0 ? 'F' : 'B';
    } else if (Math.abs(worldNormal.x) > 0.55) {
      faceName = worldNormal.x > 0 ? 'R' : 'L';
    }

    if (!faceName) return null;

    // Determine material index from group or local normal
    let materialIndex = hit.face.materialIndex ?? -1;
    if (materialIndex < 0 && hit.face.normal) {
      const ln = hit.face.normal;
      if (ln.x > 0.5) materialIndex = 0;
      else if (ln.x < -0.5) materialIndex = 1;
      else if (ln.y > 0.5) materialIndex = 2;
      else if (ln.y < -0.5) materialIndex = 3;
      else if (ln.z > 0.5) materialIndex = 4;
      else if (ln.z < -0.5) materialIndex = 5;
    }

    const spacing = 1.0 + this.explodeFactor * 0.7;
    const x = info.currentCoord ? info.currentCoord.x : Math.round(cubieGroup.position.x / spacing);
    const y = info.currentCoord ? info.currentCoord.y : Math.round(cubieGroup.position.y / spacing);
    const z = info.currentCoord ? info.currentCoord.z : Math.round(cubieGroup.position.z / spacing);

    let row = 0;
    let col = 0;

    if (faceName === 'U') {
      row = z + 1;
      col = x + 1;
    } else if (faceName === 'D') {
      row = 1 - z;
      col = x + 1;
    } else if (faceName === 'F') {
      row = 1 - y;
      col = x + 1;
    } else if (faceName === 'B') {
      row = 1 - y;
      col = 1 - x;
    } else if (faceName === 'L') {
      row = 1 - y;
      col = z + 1;
    } else if (faceName === 'R') {
      row = 1 - y;
      col = 1 - z;
    }

    const name =
      pieceType === 'corner'
        ? INITIAL_CORNERS[pieceId]?.name || 'Corner'
        : INITIAL_EDGES[pieceId]?.name || 'Edge';

    return {
      face: faceName,
      row,
      col,
      pieceType,
      pieceId,
      materialIndex,
      bodyMesh,
      name,
    };
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.button !== undefined) return;
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
    this.pointerDownTarget = this.getStickerAtPointer(event.clientX, event.clientY);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (event.button !== 0 && event.button !== undefined) return;
    const dx = event.clientX - this.pointerDownPos.x;
    const dy = event.clientY - this.pointerDownPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // If pointer was dragged significantly (camera rotation), ignore click
    if (dist > 18) {
      this.pointerDownTarget = null;
      return;
    }

    const target = this.pointerDownTarget || this.getStickerAtPointer(event.clientX, event.clientY);
    this.pointerDownTarget = null;

    if (target) {
      if (this.onStickerClick) {
        this.onStickerClick(target);
      }
      if (this.onPieceClick) {
        this.onPieceClick(target.pieceType, target.pieceId, target.name);
      }
    }
  };

  private handleResize = (): void => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public resetCamera(): void {
    this.camera.position.set(5.2, 4.5, 6.2);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.currentAnimation) {
      const anim = this.currentAnimation;
      const step = Math.sign(anim.targetAngle) * this.animationSpeed;
      const remaining = anim.targetAngle - anim.currentAngle;

      if (Math.abs(remaining) <= Math.abs(step)) {
        // Complete the exact rotation
        this.pivotGroup.rotateOnAxis(anim.axis, remaining);
        this.pivotGroup.updateMatrixWorld(true);

        // Re-attach to cubeGroup and snap
        for (const cubie of anim.cubies) {
          this.cubeGroup.attach(cubie);
          const info = this.cubieMeshes.find((cm) => cm.mesh === cubie);
          if (info) {
            this.snapCubie(cubie, info);
          }
        }

        const callback = anim.onComplete;
        this.currentAnimation = null;
        if (callback) callback();

        this.processNextAnimation();
      } else {
        anim.currentAngle += step;
        this.pivotGroup.rotateOnAxis(anim.axis, step);
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
