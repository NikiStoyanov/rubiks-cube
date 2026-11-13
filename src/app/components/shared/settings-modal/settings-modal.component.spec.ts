import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsModalComponent } from './settings-modal.component';
import { CubeStateService } from '../../../services/cube-state.service';
import { LanguageService } from '../../../services/language.service';
import { SoundService } from '../../../services/sound.service';

describe('SettingsModalComponent', () => {
  let component: SettingsModalComponent;
  let fixture: ComponentFixture<SettingsModalComponent>;
  let cubeStateService: CubeStateService;
  let languageService: LanguageService;
  let soundService: SoundService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsModalComponent);
    component = fixture.componentInstance;
    cubeStateService = TestBed.inject(CubeStateService);
    languageService = TestBed.inject(LanguageService);
    soundService = TestBed.inject(SoundService);
    fixture.detectChanges();
  });

  it('should create settings modal', () => {
    expect(component).toBeTruthy();
  });

  it('updates animation speed when preset is chosen', () => {
    component.setPresetSpeed(0.08);
    expect(cubeStateService.animSpeed()).toBe(0.08);

    component.setPresetSpeed(0.42);
    expect(cubeStateService.animSpeed()).toBe(0.42);
  });

  it('updates interface language', () => {
    component.setLanguage('bg');
    expect(languageService.language()).toBe('bg');

    component.setLanguage('en');
    expect(languageService.language()).toBe('en');
  });

  it('toggles sound mute state', () => {
    const initialMuted = soundService.isMuted();
    component.toggleSound();
    expect(soundService.isMuted()).toBe(!initialMuted);
  });

  it('resets all settings to default values', () => {
    component.setPresetSpeed(0.05);
    cubeStateService.setShowCycleArrows(false);
    cubeStateService.setExplodeFactor(0.8);

    component.resetDefaults();

    expect(cubeStateService.animSpeed()).toBe(0.22);
    expect(cubeStateService.showCycleArrows()).toBe(true);
    expect(cubeStateService.explodeFactor()).toBe(0);
    expect(soundService.isMuted()).toBe(false);
  });
});

