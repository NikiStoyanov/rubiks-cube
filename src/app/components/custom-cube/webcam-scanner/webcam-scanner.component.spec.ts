import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebcamScannerComponent } from './webcam-scanner.component';
import { CubeStateService } from '../../../services/cube-state.service';
import { FACE_COLORS } from '../../../math/group-algebra';

describe('WebcamScannerComponent', () => {
  let component: WebcamScannerComponent;
  let fixture: ComponentFixture<WebcamScannerComponent>;
  let cubeStateService: CubeStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebcamScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebcamScannerComponent);
    component = fixture.componentInstance;
    cubeStateService = TestBed.inject(CubeStateService);
    fixture.detectChanges();
  });

  it('should create and start on Front (F) face step', () => {
    expect(component).toBeTruthy();
    expect(component.currentFace()).toBe('F');
    expect(component.scannedCount()).toBe(0);
  });

  it('accurately classifies standard Rubik RGB colors into U, D, F, B, L, R', () => {
    expect(component.classifyRubikColor(245, 245, 245)).toBe('U'); // White
    expect(component.classifyRubikColor(235, 200, 15)).toBe('D');  // Yellow
    expect(component.classifyRubikColor(30, 195, 85)).toBe('F');   // Green
    expect(component.classifyRubikColor(45, 115, 235)).toBe('B');  // Blue
    expect(component.classifyRubikColor(248, 120, 20)).toBe('L');  // Orange
    expect(component.classifyRubikColor(215, 30, 30)).toBe('R');   // Red
  });

  it('distinguishes White (U) and Yellow (D) under warm lighting, glare, and neon shades', () => {
    // Overexposed / glare-washed webcam yellow stickers
    expect(component.classifyRubikColor(250, 246, 175)).toBe('D');
    expect(component.classifyRubikColor(250, 248, 200)).toBe('D');
    // Neon / chartreuse speedcube yellow
    expect(component.classifyRubikColor(210, 238, 45)).toBe('D');
    // Warm-lit golden yellow
    expect(component.classifyRubikColor(234, 179, 8)).toBe('D');

    // Warm indoor bulb (2700K) on white sticker
    expect(component.classifyRubikColor(235, 212, 175)).toBe('U');
    // Shaded / greyish white sticker
    expect(component.classifyRubikColor(150, 155, 162)).toBe('U');
  });

  it('captures current face into CubeStateService.customNet and advances to next step', () => {
    // Tweak cell (0,0) on F face to 'U' (White)
    component.selectCorrectionBrush('U');
    component.cyclePreviewCell(0, 0);
    expect(component.detectedGrid()[0][0]).toBe('U');

    component.captureCurrentFace();

    expect(cubeStateService.customNet().F[0][0].color).toBe(FACE_COLORS.U);
    expect(cubeStateService.customNet().F[1][1].color).toBe(FACE_COLORS.F);
    expect(component.scannedFaces().F).toBe(true);
    expect(component.currentFace()).toBe('R');
  });

  it('simulates full 6-face scan in demo mode', () => {
    component.simulateDemoScan();
    expect(component.allFacesScanned()).toBe(true);
    expect(component.scannedCount()).toBe(6);
  });
});

