import { Injectable, computed } from '@angular/core';
import { Language } from '../i18n/translations';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  readonly canNativeShare = computed<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  });

  async copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return this.fallbackCopyText(text);
      }
    }
    return this.fallbackCopyText(text);
  }

  private fallbackCopyText(text: string): boolean {
    if (typeof document === 'undefined') return false;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    }
    document.body.removeChild(textArea);
    return success;
  }

  async shareViaNative(url: string, lang: Language): Promise<void> {
    if (!this.canNativeShare()) return;
    try {
      await navigator.share({
        title: "Rubik's Cube 3D State",
        text:
          lang === 'bg'
            ? 'Виж текущата конфигурация на кубчето на Рубик в 3D:'
            : "Check out this 3D Rubik's Cube state:",
        url,
      });
    } catch {
      // User cancelled or share failed
    }
  }

  getWhatsAppShareUrl(url: string, lang: Language): string {
    const text =
      lang === 'bg'
        ? `Виж това състояние на Кубчето на Рубик: ${url}`
        : `Check out this Rubik's Cube state: ${url}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  getTelegramShareUrl(url: string, lang: Language): string {
    const text =
      lang === 'bg'
        ? '3D Кубче на Рубик - Конфигурация'
        : "3D Rubik's Cube State";
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }

  getXShareUrl(url: string, lang: Language): string {
    const text =
      lang === 'bg'
        ? '3D Кубче на Рубик - Конфигурация:'
        : "Check out this Rubik's Cube 3D state:";
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  }
}

