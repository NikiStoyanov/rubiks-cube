import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SpeedTimerComponent } from './speed-timer.component';
import { CubeStateService } from '../../services/cube-state.service';
import { LanguageService } from '../../services/language.service';
import { SoundService } from '../../services/sound.service';

describe('SpeedTimerComponent', () => {
  let component: SpeedTimerComponent;
  let fixture: ComponentFixture<SpeedTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeedTimerComponent],
      providers: [CubeStateService, LanguageService, SoundService],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the timer component', () => {
    expect(component).toBeTruthy();
  });

  it('should generate a valid 20-move WCA scramble without immediate duplicate faces', () => {
    component.generateNewScramble();
    const scramble = component.currentScramble();
    const tokens = scramble.trim().split(/\s+/);
    expect(tokens.length).toBe(20);

    for (let i = 1; i < tokens.length; i++) {
      const prevFace = tokens[i - 1][0];
      const curFace = tokens[i][0];
      expect(curFace).not.toBe(prevFace);
    }
  });

  it('should format times correctly into mm:ss.xx or s.xx', () => {
    expect(component.formatTime(9520)).toBe('9.52');
    expect(component.formatTime(65430)).toBe('1:05.43');
    expect(component.formatTime(0)).toBe('0.00');
  });

  it('should compute PB, Ao5 and Ao12 correctly', () => {
    // 5 solves: 10s, 12s, 11s, 15s, 9s
    // Sorted: 9, 10, 11, 12, 15 -> drop 9 and 15 -> mean of (10 + 11 + 12) = 11.00s
    component.solves.set([
      { id: '1', timeMs: 9000, formatted: '9.00', date: 'now', scramble: '' },
      { id: '2', timeMs: 15000, formatted: '15.00', date: 'now', scramble: '' },
      { id: '3', timeMs: 11000, formatted: '11.00', date: 'now', scramble: '' },
      { id: '4', timeMs: 12000, formatted: '12.00', date: 'now', scramble: '' },
      { id: '5', timeMs: 10000, formatted: '10.00', date: 'now', scramble: '' },
    ]);

    expect(component.bestTime()).toBe('9.00');
    expect(component.ao5()).toBe('11.00');
    expect(component.ao12()).toBe('—');
  });

  it('should toggle inspection state', () => {
    const initial = component.useInspection();
    component.toggleInspection();
    expect(component.useInspection()).toBe(!initial);
  });
});

