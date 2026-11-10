import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  signal,
  computed,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { CubeStateService } from '../../../services/cube-state.service';
import { LanguageService } from '../../../services/language.service';
import { SoundService } from '../../../services/sound.service';
import { FACE_COLORS, RubikGroupAlgebra } from '../../../math/group-algebra';
import { FaceName } from '../../../types/cube';

export interface ScanFaceStep {
  face: FaceName;
  nameEn: string;
  nameBg: string;
  colorHex: string;
}

const SCAN_ORDER: ScanFaceStep[] = [
  { face: 'F', nameEn: 'Front (Green)', nameBg: 'Отпред (Зелено)', colorHex: FACE_COLORS.F },
  { face: 'R', nameEn: 'Right (Red)', nameBg: 'Дясно (Червено)', colorHex: FACE_COLORS.R },
  { face: 'B', nameEn: 'Back (Blue)', nameBg: 'Отзад (Синьо)', colorHex: FACE_COLORS.B },
  { face: 'L', nameEn: 'Left (Orange)', nameBg: 'Ляво (Оранжево)', colorHex: FACE_COLORS.L },
  { face: 'U', nameEn: 'Up (White)', nameBg: 'Горе (Бяло)', colorHex: FACE_COLORS.U },
  { face: 'D', nameEn: 'Down (Yellow)', nameBg: 'Долу (Жълто)', colorHex: FACE_COLORS.D },
];

const CYCLE_FACES: FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];

@Component({
  selector: 'app-webcam-scanner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './webcam-scanner.component.html',
  styleUrl: './webcam-scanner.component.css',
  host: {
    '(window:keydown.space)': 'onSpaceKey($event)',
  },
})
export class WebcamScannerComponent {
  private readonly cubeStateService = inject(CubeStateService);
  private readonly languageService = inject(LanguageService);
  private readonly soundService = inject(SoundService);
  private readonly destroyRef = inject(DestroyRef);

  readonly switchToNetMode = output<void>();

  readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoEl');
  readonly canvasElement = viewChild<ElementRef<HTMLCanvasElement>>('sampleCanvas');

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly isBg = computed(() => this.language() === 'bg');

  readonly scanSteps = SCAN_ORDER;
  readonly faceColors = FACE_COLORS;
  readonly customNet = this.cubeStateService.customNet;

  // Camera state
  readonly isCameraActive = signal<boolean>(false);
  readonly isMirrored = signal<boolean>(false);
  readonly facingMode = signal<'environment' | 'user'>('environment');
  readonly cameraError = signal<string | null>(null);

  // Active face being scanned
  readonly currentStepIndex = signal<number>(0);
  readonly currentStep = computed<ScanFaceStep>(() => this.scanSteps[this.currentStepIndex()]);
  readonly currentFace = computed<FaceName>(() => this.currentStep().face);

  // Track which faces have been captured in this session
  readonly scannedFaces = signal<Record<FaceName, boolean>>({
    F: false,
    R: false,
    B: false,
    L: false,
    U: false,
    D: false,
  });

  readonly scannedCount = computed<number>(() => {
    const map = this.scannedFaces();
    return Object.values(map).filter(Boolean).length;
  });

  readonly allFacesScanned = computed<boolean>(() => this.scannedCount() === 6);

  // Live 3x3 detected facelet colors (FaceName[][])
  readonly detectedGrid = signal<FaceName[][]>([
    ['F', 'F', 'F'],
    ['F', 'F', 'F'],
    ['F', 'F', 'F'],
  ]);

  readonly centerDetectedFace = computed<FaceName>(() => this.detectedGrid()[1][1]);
  readonly isCenterMatching = computed<boolean>(
    () => this.centerDetectedFace() === this.currentFace()
  );

  // Active manual override brush (optional quick-correction color)
  readonly activeCorrectionFace = signal<FaceName | null>(null);

  // Live center RGB & optional per-face CIE Lab calibration
  readonly lastCenterRgb = signal<{ r: number; g: number; b: number }>({ r: 245, g: 245, b: 245 });
  readonly calibratedLab = signal<Partial<Record<FaceName, { l: number; a: number; b: number }>>>({});
  readonly hasCalibration = computed<boolean>(
    () => Object.keys(this.calibratedLab()).length > 0
  );

  private mediaStream: MediaStream | null = null;
  private scanTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stopCamera();
    });
  }

  readonly holdInstruction = computed<string>(() => {
    const face = this.currentFace();
    const tr = this.t();
    switch (face) {
      case 'F':
        return tr.camHoldInstructionF;
      case 'R':
        return tr.camHoldInstructionR;
      case 'B':
        return tr.camHoldInstructionB;
      case 'L':
        return tr.camHoldInstructionL;
      case 'U':
        return tr.camHoldInstructionU;
      case 'D':
        return tr.camHoldInstructionD;
    }
  });

  async startCamera(): Promise<void> {
    this.cameraError.set(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set(this.t().camErrorPermission);
      return;
    }

    this.stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: this.facingMode() },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      this.mediaStream = stream;
      this.isCameraActive.set(true);

      // Attach stream to video element after view updates
      setTimeout(() => {
        const video = this.videoElement()?.nativeElement;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => {
            // Ignore autoplay interruption
          });
        }
      }, 30);

      // Start periodic 3x3 color sampling
      this.scanTimer = setInterval(() => {
        this.sampleVideoFrame();
      }, 140);
    } catch {
      this.cameraError.set(this.t().camErrorPermission);
      this.isCameraActive.set(false);
    }
  }

  stopCamera(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
    const video = this.videoElement()?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
    this.isCameraActive.set(false);
  }

  toggleMirror(): void {
    this.isMirrored.update((v) => !v);
  }

  async switchCameraFacing(): Promise<void> {
    this.facingMode.update((mode) => (mode === 'environment' ? 'user' : 'environment'));
    if (this.isCameraActive()) {
      await this.startCamera();
    }
  }

  selectStep(index: number): void {
    this.currentStepIndex.set(index);
    const face = this.scanSteps[index].face;
    // Initialize preview from current customNet for that face
    const currentNetFace = this.customNet()[face];
    const grid: FaceName[][] = [
      ['F', 'F', 'F'],
      ['F', face, 'F'],
      ['F', 'F', 'F'],
    ];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[r][c] = this.hexToFaceName(currentNetFace[r][c].color, face);
      }
    }
    grid[1][1] = face;
    this.detectedGrid.set(grid);
  }

  /**
   * Manually adjust a sticker in the 3x3 preview before/after capture.
   */
  cyclePreviewCell(r: number, c: number): void {
    if (r === 1 && c === 1) return; // Center is locked to target face

    const override = this.activeCorrectionFace();
    this.detectedGrid.update((grid) => {
      const copy = grid.map((row) => [...row]);
      if (override) {
        copy[r][c] = override;
      } else {
        const current = copy[r][c];
        const nextIdx = (CYCLE_FACES.indexOf(current) + 1) % CYCLE_FACES.length;
        copy[r][c] = CYCLE_FACES[nextIdx];
      }
      return copy;
    });
  }

  selectCorrectionBrush(face: FaceName | null): void {
    this.activeCorrectionFace.update((curr) => (curr === face ? null : face));
  }

  /**
   * Calibrates the current target face color using the live center sticker (1, 1) from the webcam.
   */
  calibrateCurrentCenter(): void {
    const face = this.currentFace();
    const rgb = this.lastCenterRgb();
    const lab = this.rgbToLab(rgb.r, rgb.g, rgb.b);
    this.calibratedLab.update((prev) => ({
      ...prev,
      [face]: lab,
    }));
    this.sampleVideoFrame();
  }

  resetCalibration(): void {
    this.calibratedLab.set({});
    this.sampleVideoFrame();
  }

  /**
   * Captures the current 3x3 detectedGrid into the global customNet for currentFace,
   * marks the face as scanned, and advances to the next unscanned face.
   */
  captureCurrentFace(): void {
    const face = this.currentFace();
    const grid = this.detectedGrid();

    const hexColors: string[][] = grid.map((row, r) =>
      row.map((cellFace, c) => (r === 1 && c === 1 ? FACE_COLORS[face] : FACE_COLORS[cellFace]))
    );

    this.cubeStateService.setFaceStickers(face, hexColors);
    this.soundService.playTurnSound(false);

    this.scannedFaces.update((prev) => ({
      ...prev,
      [face]: true,
    }));

    // Auto-advance to the next unscanned face if any remain
    const updatedMap = this.scannedFaces();
    for (let offset = 1; offset <= 6; offset++) {
      const nextIdx = (this.currentStepIndex() + offset) % 6;
      const candidateFace = this.scanSteps[nextIdx].face;
      if (!updatedMap[candidateFace]) {
        this.currentStepIndex.set(nextIdx);
        this.detectedGrid.update((g) => {
          const copy = g.map((row) => [...row]);
          copy[1][1] = candidateFace;
          return copy;
        });
        break;
      }
    }
  }

  /**
   * Simulates scanning a realistic scrambled cube (for users without a webcam or quick demo).
   */
  simulateDemoScan(): void {
    const demoMoves = RubikGroupAlgebra.parseAlgorithm("R U R' U' F' U2 L D' B2 R2 U");
    const scrambledState = RubikGroupAlgebra.applyAlgorithm(
      RubikGroupAlgebra.createIdentityState(),
      demoMoves
    );
    const demoNet = RubikGroupAlgebra.compute2DNet(scrambledState);
    this.cubeStateService.setCustomNet(demoNet);

    const face = this.currentFace();
    const currentFaceGrid: FaceName[][] = demoNet[face].map((row) =>
      row.map((cell) => this.hexToFaceName(cell.color, face))
    );
    this.detectedGrid.set(currentFaceGrid);

    this.scannedFaces.set({
      F: true,
      R: true,
      B: true,
      L: true,
      U: true,
      D: true,
    });
    this.soundService.playTurnSound(false);
  }

  onSpaceKey(event: Event): void {
    if (!this.isCameraActive()) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON')) {
      return;
    }
    event.preventDefault();
    this.captureCurrentFace();
  }

  /**
   * Samples the 3x3 target grid region from the live video element and classifies each sticker.
   */
  private sampleVideoFrame(): void {
    const video = this.videoElement()?.nativeElement;
    const canvas = this.canvasElement()?.nativeElement;
    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = 240;
    const height = 240;
    canvas.width = width;
    canvas.height = height;

    // Crop the central square of the video feed
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - minDim) / 2;
    const sy = (video.videoHeight - minDim) / 2;

    ctx.save();
    if (this.isMirrored()) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, width, height);
    ctx.restore();

    // The 3x3 overlay box occupies the central 66% of the square viewport (from 17% to 83%)
    const gridStart = Math.round(width * 0.17);
    const gridSize = Math.round(width * 0.66);
    const cellSize = gridSize / 3;

    const newGrid: FaceName[][] = [
      ['U', 'U', 'U'],
      ['U', 'U', 'U'],
      ['U', 'U', 'U'],
    ];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const centerX = Math.round(gridStart + (c + 0.5) * cellSize);
        const centerY = Math.round(gridStart + (r + 0.5) * cellSize);
        const rgb = this.samplePatchAverageRGB(ctx, centerX, centerY, 9);
        if (r === 1 && c === 1) {
          this.lastCenterRgb.set(rgb);
        }
        newGrid[r][c] = this.classifyRubikColor(rgb.r, rgb.g, rgb.b);
      }
    }

    this.detectedGrid.set(newGrid);
  }

  private samplePatchAverageRGB(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    halfSize: number
  ): { r: number; g: number; b: number } {
    const size = halfSize * 2;
    const imgData = ctx.getImageData(cx - halfSize, cy - halfSize, size, size).data;

    let allR = 0;
    let allG = 0;
    let allB = 0;
    let allCount = 0;

    let chromR = 0;
    let chromG = 0;
    let chromB = 0;
    let chromCount = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      // Filter out dark plastic borders between cubies
      if (max < 32) continue;

      allR += r;
      allG += g;
      allB += b;
      allCount++;

      // Exclude blown-out white specular glare when sampling chromatic stickers (like glossy Yellow)
      const isSpecularGlare = min > 236 && max - min < 16;
      const sat = max === 0 ? 0 : (max - min) / max;
      if (!isSpecularGlare && sat >= 0.15) {
        chromR += r;
        chromG += g;
        chromB += b;
        chromCount++;
      }
    }

    if (allCount === 0) {
      return { r: 210, g: 210, b: 210 };
    }

    // If at least 30% of the sticker patch has non-glare chromatic signal, use it so glare doesn't wash Yellow into White
    if (chromCount >= allCount * 0.3) {
      return {
        r: chromR / chromCount,
        g: chromG / chromCount,
        b: chromB / chromCount,
      };
    }

    return {
      r: allR / allCount,
      g: allG / allCount,
      b: allB / allCount,
    };
  }

  /**
   * Classifies an RGB pixel patch into one of the 6 standard Rubik's cube faces:
   * U (White), D (Yellow), F (Green), B (Blue), L (Orange), R (Red)
   * using CIE L*a*b* opponent chroma, yellow blue-drop analysis, and HSV thresholds.
   */
  classifyRubikColor(r: number, g: number, b: number): FaceName {
    const lab = this.rgbToLab(r, g, b);

    // 1. Check user-calibrated CIE Lab references first if available
    const calibrated = this.calibratedLab();
    const calibratedEntries = Object.entries(calibrated) as [
      FaceName,
      { l: number; a: number; b: number },
    ][];
    if (calibratedEntries.length > 0) {
      let nearestCalFace: FaceName | null = null;
      let nearestCalDist = Infinity;
      for (const [cFace, cLab] of calibratedEntries) {
        const dL = (lab.l - cLab.l) * 0.65;
        const dA = lab.a - cLab.a;
        const dB = lab.b - cLab.b;
        const dist = Math.hypot(dL, dA, dB);
        if (dist < nearestCalDist) {
          nearestCalDist = dist;
          nearestCalFace = cFace;
        }
      }
      if (nearestCalFace && nearestCalDist < 19) {
        return nearestCalFace;
      }
    }

    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    const v = max;
    const s = max === 0 ? 0 : delta / max;

    let h = 0;
    if (delta !== 0) {
      if (max === rn) {
        h = 60 * (((gn - bn) / delta) % 6);
      } else if (max === gn) {
        h = 60 * ((bn - rn) / delta + 2);
      } else {
        h = 60 * ((rn - gn) / delta + 4);
      }
      if (h < 0) h += 360;
    }

    // 2. Dedicated White (U) vs Yellow (D) separation
    // Yellow stickers reflect both R and G strongly (G ~ R) while sharply absorbing B (G - B >> |R - G|).
    // Warm-lit White stickers have a smooth Planckian slope R > G > B where (G - B) is comparable to (R - G).
    const rgDiff = r - g;
    const gbDiff = g - b;
    const isYellowHueBand =
      h >= 38 &&
      h < 88 &&
      g >= r * 0.68 &&
      r >= g * 0.64;

    const hasSharpYellowBlueDrop =
      isYellowHueBand &&
      s >= 0.14 &&
      v > 0.5 &&
      lab.b >= 16 &&
      gbDiff >= 25 &&
      gbDiff >= 2.1 * Math.max(4, rgDiff);

    if (hasSharpYellowBlueDrop || (isYellowHueBand && s >= 0.28 && lab.b >= 24)) {
      return 'D'; // Yellow
    }

    // Neutral White, Shaded White, or Warm-Indoor White
    const chroma = Math.hypot(lab.a, lab.b);
    const isWarmIndoorWhite =
      s < 0.32 &&
      v > 0.45 &&
      b > 130 &&
      rgDiff > 0 &&
      gbDiff < 2.1 * Math.max(6, rgDiff) &&
      lab.b < 26;

    if ((s < 0.16 && v > 0.28) || (chroma < 16 && lab.l > 55) || isWarmIndoorWhite) {
      return 'U'; // White
    }

    // 3. Chromatic HSV + Opponent classification for R, L, D, F, B
    if (s >= 0.18) {
      if (h >= 340 || h < 13) {
        return 'R'; // Red
      }
      if (h >= 13 && h < 42) {
        if (gn / Math.max(0.01, rn) < 0.31 && h < 19) {
          return 'R';
        }
        if (s < 0.34 && gn / Math.max(0.01, rn) >= 0.8) {
          return 'U'; // Warm white fallback
        }
        return 'L'; // Orange
      }
      if (h >= 42 && h < 86) {
        return 'D'; // Yellow (including bright lemon/chartreuse speedcube yellow)
      }
      if (h >= 86 && h < 172) {
        return 'F'; // Green
      }
      if (h >= 172 && h < 272) {
        return 'B'; // Blue
      }
    }

    // 4. Perceptual CIE L*a*b* fallback across canonical Rubik palette
    const canonicalRgb: { face: FaceName; r: number; g: number; b: number }[] = [
      { face: 'U', r: 242, g: 242, b: 242 },
      { face: 'D', r: 235, g: 205, b: 20 },
      { face: 'F', r: 34, g: 197, b: 94 },
      { face: 'B', r: 59, g: 130, b: 246 },
      { face: 'L', r: 249, g: 115, b: 22 },
      { face: 'R', r: 220, g: 38, b: 38 },
    ];

    let bestFace: FaceName = 'U';
    let bestDist = Infinity;
    for (const ref of canonicalRgb) {
      const refLab = calibrated[ref.face] ?? this.rgbToLab(ref.r, ref.g, ref.b);
      const dL = (lab.l - refLab.l) * 0.55;
      const dA = lab.a - refLab.a;
      const dB = lab.b - refLab.b;
      const dist = dL * dL + dA * dA + dB * dB;
      if (dist < bestDist) {
        bestDist = dist;
        bestFace = ref.face;
      }
    }
    return bestFace;
  }

  /**
   * Converts sRGB [0..255] to perceptual CIE L*a*b* (D65).
   */
  private rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
    const toLinear = (c: number): number => {
      const v = c / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const rl = toLinear(r);
    const gl = toLinear(g);
    const bl = toLinear(b);

    const x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
    const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
    const z = (rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041) / 1.08883;

    const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

    const fx = f(x);
    const fy = f(y);
    const fz = f(z);

    return {
      l: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz),
    };
  }

  private hexToFaceName(hex: string, fallback: FaceName): FaceName {
    const normalized = hex.toLowerCase();
    for (const f of CYCLE_FACES) {
      if (FACE_COLORS[f].toLowerCase() === normalized) {
        return f;
      }
    }
    return fallback;
  }
}

