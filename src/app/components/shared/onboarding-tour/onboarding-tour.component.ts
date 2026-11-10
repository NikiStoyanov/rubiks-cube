import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { CubeStateService } from '../../../services/cube-state.service';
import { MathViewComponent } from '../math-view/math-view.component';

export interface TourStepData {
  step: number;
  badge: string;
  badgeBg: string;
  title: string;
  titleBg: string;
  subtitle: string;
  subtitleBg: string;
  concept: string;
  conceptBg: string;
  explanation: string;
  explanationBg: string;
  takeaway: string;
  takeawayBg: string;
  formula?: string;
  demoMove?: string;
  demoMoveLabel?: string;
  demoMoveLabelBg?: string;
}

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MathViewComponent],
  templateUrl: './onboarding-tour.component.html',
  styleUrl: './onboarding-tour.component.css',
})
export class OnboardingTourComponent {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);

  readonly t = this.languageService.t;
  readonly language = this.languageService.language;
  readonly isTourOpen = this.cubeStateService.isTourOpen;

  readonly currentStepIndex = signal<number>(0);

  readonly steps: TourStepData[] = [
    {
      step: 1,
      badge: 'Step 1: The Machine',
      badgeBg: 'Стъпка 1: Машината',
      title: 'The Cube as an Algebraic Engine',
      titleBg: 'Кубчето като алгебричен двигател',
      subtitle: 'Every rotation is a mathematical permutation, not just an animation.',
      subtitleBg: 'Всяко завъртане е математическа пермутация, а не просто визуална анимация.',
      concept: 'Permutation Group G ⊆ S₄₈',
      conceptBg: 'Пермутационна група G ⊆ S₄₈',
      explanation:
        'The Rubik’s Cube has over 43 quintillion reachable states. In this app, the 3D graphics are purely visual: the real cube lives in a pure TypeScript algebra engine that calculates permutations, inverses, and cycles.',
      explanationBg:
        'Кубчето на Рубик има над 43 квинтилиона достижими състояния. В това приложение 3D графиката е само екран: истинското кубче живее в чист TypeScript математически двигател, който пресмята пермутации, инверсии и цикли в паметта.',
      takeaway:
        'Like immutable transactions in distributed databases: every turn preserves structural invariants and has an exact inverse (e.g. R followed by R⁻¹ cancels out).',
      takeawayBg:
        'Подобно на транзакции в разпределени бази данни: всяко действие запазва структурни инварианти и притежава точна обратна операция (напр. ход R, последван от R⁻¹, връща началното състояние).',
      formula: 'g \\circ g^{-1} = e',
      demoMove: 'R',
      demoMoveLabel: 'Try single turn: R',
      demoMoveLabelBg: 'Изпробвай ход: R',
    },
    {
      step: 2,
      badge: 'Step 2: Reachability',
      badgeBg: 'Стъпка 2: Достижимост',
      title: 'Orbit: Where Can a Piece Travel?',
      titleBg: 'Орбита: Докъде може да стигне едно парче?',
      subtitle: 'Understanding reachability and graph connectivity.',
      subtitleBg: 'Разбиране на достижимостта и свързаността в пространството от състояния.',
      concept: 'Orbit: Orb_G(x) = { g · x | g ∈ G }',
      conceptBg: 'Орбита: Orb_G(x) = { g · x | g ∈ G }',
      explanation:
        'The orbit is the set of all slots a chosen piece can visit. In the full Rubik’s group, any corner can reach all 8 corner positions. But if we restrict moves to just R and U, the orbit shrinks to 6 corners!',
      explanationBg:
        'Орбитата е списъкът от всички позиции, които избрано парче може да заеме. В пълната група всеки връх може да посети всички 8 ъгъла. Но ако ограничим ходовете само до R и U, орбитата се свива до 6 върха!',
      takeaway:
        'Visual highlight: Click any piece on the 3D canvas or 2D net to instantly highlight its entire reachable orbit in cyan!',
      takeawayBg:
        'Визуален акцент: Кликнете върху произволно парче в 3D или 2D изгледа, за да осветите веднага цялата му достижима орбита в тюркоазено!',
      formula: '|\\mathrm{Orb}_G(x)| = 8',
    },
    {
      step: 3,
      badge: 'Step 3: Protected State',
      badgeBg: 'Стъпка 3: Защитено състояние',
      title: 'Stabilizer: Moves that Leave Pieces Untouched',
      titleBg: 'Стабилизатор: Ходовете, които не развалят парчето',
      subtitle: 'The mathematical secret behind layer-by-layer solving.',
      subtitleBg: 'Математическата тайна зад подреждането слой по слой.',
      concept: 'Stabilizer: Stab_G(x) = { g ∈ G | g · x = x }',
      conceptBg: 'Стабилизатор: Stab_G(x) = { g ∈ G | g · x = x }',
      explanation:
        'How do speedcubers solve the second and third layers without destroying the already solved first layer? By choosing moves inside the stabilizer group Stab(Layer 1).',
      explanationBg:
        'Как се редят вторият и третият слой, без да се развали вече подреденият първи слой? Като се използват ходове от стабилизатора на първия слой Stab(Layer 1).',
      takeaway:
        'Orbit-Stabilizer Theorem: |G| = |Orbit| × |Stabilizer|. The larger the orbit, the smaller the stabilizer, and vice versa.',
      takeawayBg:
        'Теорема за орбитата и стабилизатора: |G| = |Орбита| × |Стабилизатор|. Колкото по-голяма е орбитата, толкова по-малък е стабилизаторът.',
      formula: '|G| = |\\mathrm{Orb}_G(x)| \\times |\\mathrm{Stab}_G(x)|',
    },
    {
      step: 4,
      badge: 'Step 4: Predictability & Cauchy',
      badgeBg: 'Стъпка 4: Предсказуемост и Коши',
      title: 'Cycles, Element Order & Cauchy’s Theorem',
      titleBg: 'Цикли, Ред на елемент и Теорема на Коши',
      subtitle: 'Why repeating the exact same move is guaranteed to return home.',
      subtitleBg: 'Защо повтарянето на едно и също действие гарантирано връща куба в началото.',
      concept: 'Cauchy Theorem: p | |H| ⇒ ∃ h ∈ H : ord(h) = p',
      conceptBg: 'Теорема на Коши: p | |H| ⇒ ∃ h ∈ H : ord(h) = p',
      explanation:
        'Every move decomposes into independent cycles. For example, the popular sequence [R, U] = R U R’ U’ has order 6. Repeating it 6 times restores the cube completely! Because 2 and 3 divide 6, Cauchy’s Theorem guarantees elements of order 2 and 3 exist inside it.',
      explanationBg:
        'Всяка операция се разлага на независими цикли. Например известната поредица [R, U] = R U R’ U’ има точен ред 6. Повтарянето ѝ 6 пъти възстановява кубчето абсолютно само! Тъй като 2 и 3 делят 6, Теоремата на Коши гарантира, че в нея живеят елементи от ред 2 и 3.',
      takeaway:
        'Deterministic state cycles: The live Math HUD automatically shows you the cycle notation and order for any move you execute!',
      takeawayBg:
        'Предсказуеми цикли: Алгебричният HUD на живо ви показва цикличния запис и реда за всяко действие, което извършите!',
      formula: '(R\\, U\\, R\'\\, U\')^6 = e',
      demoMove: "R U R' U'",
      demoMoveLabel: 'Try the Sexy Move [R, U]',
      demoMoveLabelBg: 'Изпробвай тригера [R, U]',
    },
    {
      step: 5,
      badge: 'Step 5: Solvability Invariants',
      badgeBg: 'Стъпка 5: Инварианти за решимост',
      title: 'The 12 Cosets: Why Random Assembly Fails 91.7%',
      titleBg: '12-те съседни класа: Защо произволното сглобяване е 91.7% нерешимо',
      subtitle: 'Detecting illegal physical tampering via group theory.',
      subtitleBg: 'Откриване на физически невъзможни кубчета чрез групови инварианти.',
      concept: '[G_physical : G] = 12 Cosets',
      conceptBg: '[G_physical : G] = 12 съседни класа',
      explanation:
        'If you physically take a Rubik’s cube apart and reassemble it at random, there is only an 8.33% chance (1 in 12) it can ever be solved! The other 11 states belong to unreachable cosets. Our "Orbit Validator" tab detects and fixes this with one click.',
      explanationBg:
        'Ако разглобите кубчето на части и го сглобите на случаен принцип, имате само 8.33% шанс (1 от 12) то да може да бъде наредено! Останалите 11 свята са изолирани косети. Страницата „Валидатор“ засича и поправя това с един клик.',
      takeaway:
        '3 Immutable Invariants: 1) Corner twist sum ≡ 0 (mod 3), 2) Edge flip sum ≡ 0 (mod 2), 3) Equal permutation parity sgn(corners) = sgn(edges).',
      takeawayBg:
        '3 строги инварианта: 1) Сума от завъртания ≡ 0 (mod 3), 2) Сума от обръщания ≡ 0 (mod 2), 3) Еднаква четност sgn(върхове) = sgn(ръбове).',
      formula: 'P(\\text{solvable}) = \\frac{1}{12} \\approx 8.33\\%',
    },
  ];

  readonly currentStep = computed<TourStepData>(() => {
    return this.steps[this.currentStepIndex()] || this.steps[0];
  });

  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex.set(index);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.currentStepIndex.update((i) => i + 1);
    } else {
      this.closeTour();
    }
  }

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.currentStepIndex.update((i) => i - 1);
    }
  }

  closeTour(): void {
    this.cubeStateService.closeTour();
  }

  onExecuteDemo(move: string | undefined): void {
    if (!move) return;
    this.cubeStateService.applyAlgorithm(move);
  }
}
