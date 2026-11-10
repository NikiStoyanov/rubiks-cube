import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly message = signal<string | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(msg: string, durationMs = 3500): void {
    this.message.set(msg);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.message.set(null);
      this.timeoutId = null;
    }, durationMs);
  }

  dismiss(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.message.set(null);
  }
}

