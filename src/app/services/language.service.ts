import { Injectable, signal, computed } from '@angular/core';
import { Language, translations, Translations } from '../i18n/translations';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly defaultLang: Language = (() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('rubik_app_lang');
      if (saved === 'bg' || saved === 'en') return saved;
      if (navigator.language?.toLowerCase().startsWith('bg')) return 'bg';
    }
    return 'en';
  })();

  readonly language = signal<Language>(this.defaultLang);
  readonly t = computed<Translations>(() => translations[this.language()]);

  setLanguage(lang: Language): void {
    this.language.set(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('rubik_app_lang', lang);
    }
  }

  toggleLanguage(): void {
    this.setLanguage(this.language() === 'en' ? 'bg' : 'en');
  }
}
