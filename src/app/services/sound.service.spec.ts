import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle mute state and persist in signal', () => {
    const initial = service.isMuted();
    service.toggleMute();
    expect(service.isMuted()).toBe(!initial);
    service.toggleMute();
    expect(service.isMuted()).toBe(initial);
  });

  it('should safely handle playTurnSound and playSolvedFanfare without crashing in test environment', () => {
    expect(() => service.playTurnSound()).not.toThrow();
    expect(() => service.playTurnSound(true)).not.toThrow();
    expect(() => service.playSolvedFanfare()).not.toThrow();
  });
});
