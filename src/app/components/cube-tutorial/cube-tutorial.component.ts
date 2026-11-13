import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CubeStateService } from '../../services/cube-state.service';
import {
  TUTORIAL_STEPS,
  TutorialStep,
  TutorialCase,
  RubikGroupAlgebra,
} from '../../math/group-algebra';
import { type SolveResult } from '../../math/cube-solver';
import { StandardMove } from '../../types/cube';

export interface MoveGuideDetail {
  code: StandardMove;
  arrow: string;
  nameBg: string;
  nameEn: string;
  actionBg: string;
  actionEn: string;
}

export const MOVE_DETAILS: Record<string, MoveGuideDetail> = {
  'R': { code: 'R', arrow: '⬆️', nameBg: 'Дясна нагоре', nameEn: 'Right Up', actionBg: 'Завъртете дясната страна на 90° нагоре (по часовника)', actionEn: 'Rotate right face 90° upwards (clockwise)' },
  "R'": { code: "R'", arrow: '⬇️', nameBg: 'Дясна надолу', nameEn: 'Right Down', actionBg: 'Завъртете дясната страна на 90° надолу (обратно)', actionEn: 'Rotate right face 90° downwards (counter-clockwise)' },
  'U': { code: 'U', arrow: '⬅️', nameBg: 'Горна наляво', nameEn: 'Up Left', actionBg: 'Завъртете горната страна на 90° наляво (по часовника)', actionEn: 'Rotate top face 90° to the left (clockwise)' },
  "U'": { code: "U'", arrow: '➡️', nameBg: 'Горна надясно', nameEn: 'Up Right', actionBg: 'Завъртете горната страна на 90° надясно (обратно)', actionEn: 'Rotate top face 90° to the right (counter-clockwise)' },
  'F': { code: 'F', arrow: '↻', nameBg: 'Лице по часовника', nameEn: 'Front Clockwise', actionBg: 'Завъртете предната страна на 90° по часовника', actionEn: 'Rotate front face 90° clockwise' },
  "F'": { code: "F'", arrow: '↺', nameBg: 'Лице обратно', nameEn: 'Front Counter', actionBg: 'Завъртете предната страна на 90° обратно на часовника', actionEn: 'Rotate front face 90° counter-clockwise' },
  'L': { code: 'L', arrow: '⬇️', nameBg: 'Лява надолу', nameEn: 'Left Down', actionBg: 'Завъртете лявата страна на 90° надолу (по часовника)', actionEn: 'Rotate left face 90° downwards (clockwise)' },
  "L'": { code: "L'", arrow: '⬆️', nameBg: 'Лява нагоре', nameEn: 'Left Up', actionBg: 'Завъртете лявата страна на 90° нагоре (обратно)', actionEn: 'Rotate left face 90° upwards (counter-clockwise)' },
  'D': { code: 'D', arrow: '➡️', nameBg: 'Долна надясно', nameEn: 'Down Right', actionBg: 'Завъртете долната страна на 90° надясно (по часовника)', actionEn: 'Rotate bottom face 90° to the right (clockwise)' },
  "D'": { code: "D'", arrow: '⬅️', nameBg: 'Долна наляво', nameEn: 'Down Left', actionBg: 'Завъртете долната страна на 90° наляво (обратно)', actionEn: 'Rotate bottom face 90° to the left (counter-clockwise)' },
  'B': { code: 'B', arrow: '↺', nameBg: 'Задна страна', nameEn: 'Back Clockwise', actionBg: 'Завъртете задната страна на 90° по часовника', actionEn: 'Rotate back face 90° clockwise' },
  "B'": { code: "B'", arrow: '↻', nameBg: 'Задна обратно', nameEn: 'Back Counter', actionBg: 'Завъртете задната страна на 90° обратно на часовника', actionEn: 'Rotate back face 90° counter-clockwise' },
  'R2': { code: 'R2', arrow: '🔄', nameBg: 'Дясна 180°', nameEn: 'Right Double (180°)', actionBg: 'Завъртете десния слой на 180° (два пъти)', actionEn: 'Rotate right face 180° (two quarter turns)' },
  'U2': { code: 'U2', arrow: '🔄', nameBg: 'Горна 180°', nameEn: 'Up Double (180°)', actionBg: 'Завъртете горния слой на 180° (два пъти)', actionEn: 'Rotate top face 180° (two quarter turns)' },
  'F2': { code: 'F2', arrow: '🔄', nameBg: 'Лице 180°', nameEn: 'Front Double (180°)', actionBg: 'Завъртете предния слой на 180° (два пъти)', actionEn: 'Rotate front face 180° (two quarter turns)' },
};

export interface NotationGuideItem {
  code: StandardMove;
  nameBg: string;
  nameEn: string;
  descBg: string;
  descEn: string;
  badge: string;
}

@Component({
  selector: 'app-cube-tutorial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cube-tutorial.component.html',
  styleUrl: './cube-tutorial.component.css',
})
export class CubeTutorialComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly cubeStateService = inject(CubeStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly language = this.languageService.language;
  readonly t = this.languageService.t;
  readonly isAnimating = this.cubeStateService.isAnimating;

  readonly steps = TUTORIAL_STEPS;
  readonly currentStepIndex = signal<number>(0);
  readonly selectedCaseIndex = signal<number>(0);
  readonly currentMoveIndex = signal<number>(0);

  readonly isStepExecuting = signal<boolean>(false);
  readonly completedSteps = signal<Set<number>>(new Set());
  readonly showMathNote = signal<boolean>(false);

  // Advanced learning tools
  readonly isAutoPlaying = signal<boolean>(false);
  readonly playbackSpeed = signal<number>(1);
  readonly isPracticeMode = signal<boolean>(false);
  readonly showHint = signal<boolean>(true);
  readonly showNotationGuide = signal<boolean>(false);
  readonly showSolver = signal<boolean>(false);
  readonly solveResult = signal<SolveResult | null>(null);
  readonly practiceFeedback = signal<{ success: boolean; message: string } | null>(null);

  private autoPlayTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopAutoPlay());
  }

  ngOnInit(): void {
    // Automatically prepare the practice position on the 3D cube when entering tutorial
    setTimeout(() => {
      this.setupPracticeCase();
    }, 150);
  }

  // Notation reference catalog for Rubik's cube Singmaster notation
  readonly notationList: NotationGuideItem[] = [
    {
      code: 'R',
      nameBg: 'Дясна страна (Right)',
      nameEn: 'Right Face',
      descBg: 'Завъртане на дясната страна по часовниковата стрелка на 90° (нагоре).',
      descEn: 'Clockwise 90° rotation of the right layer (upwards).',
      badge: 'R',
    },
    {
      code: "R'",
      nameBg: 'Дясна обратна (R Prime)',
      nameEn: 'Right Inverted (Prime)',
      descBg: 'Завъртане на дясната страна обратно на часовниковата стрелка (надолу).',
      descEn: 'Counter-clockwise 90° rotation of the right layer (downwards).',
      badge: "R'",
    },
    {
      code: 'U',
      nameBg: 'Горна страна (Up)',
      nameEn: 'Up Face',
      descBg: 'Завъртане на горната страна по часовниковата стрелка (наляво).',
      descEn: 'Clockwise 90° rotation of top layer (leftwards).',
      badge: 'U',
    },
    {
      code: "U'",
      nameBg: 'Горна обратна (U Prime)',
      nameEn: 'Up Inverted (Prime)',
      descBg: 'Завъртане на горната страна обратно на часовника (надясно).',
      descEn: 'Counter-clockwise 90° rotation of top layer (rightwards).',
      badge: "U'",
    },
    {
      code: 'F',
      nameBg: 'Предна страна (Front)',
      nameEn: 'Front Face',
      descBg: 'Завъртане на лицевата страна по посока на часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of front face facing you.',
      badge: 'F',
    },
    {
      code: "F'",
      nameBg: 'Предна обратна (F Prime)',
      nameEn: 'Front Inverted (Prime)',
      descBg: 'Завъртане на лицевата страна обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of front face.',
      badge: "F'",
    },
    {
      code: 'L',
      nameBg: 'Лява страна (Left)',
      nameEn: 'Left Face',
      descBg: 'Завъртане на лявата страна по часовниковата стрелка (надолу).',
      descEn: 'Clockwise 90° rotation of the left layer (downwards).',
      badge: 'L',
    },
    {
      code: "L'",
      nameBg: 'Лява обратна (L Prime)',
      nameEn: 'Left Inverted (Prime)',
      descBg: 'Завъртане на лявата страна обратно на часовника (нагоре).',
      descEn: 'Counter-clockwise 90° rotation of the left layer (upwards).',
      badge: "L'",
    },
    {
      code: 'D',
      nameBg: 'Долна страна (Down)',
      nameEn: 'Down Face',
      descBg: 'Завъртане на долната основа по часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of bottom layer.',
      badge: 'D',
    },
    {
      code: "D'",
      nameBg: 'Долна обратна (D Prime)',
      nameEn: 'Down Inverted (Prime)',
      descBg: 'Завъртане на долната основа обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of bottom layer.',
      badge: "D'",
    },
    {
      code: 'B',
      nameBg: 'Задна страна (Back)',
      nameEn: 'Back Face',
      descBg: 'Завъртане на задната страна по часовниковата стрелка.',
      descEn: 'Clockwise 90° rotation of back layer.',
      badge: 'B',
    },
    {
      code: "B'",
      nameBg: 'Задна обратна (B Prime)',
      nameEn: 'Back Inverted (Prime)',
      descBg: 'Завъртане на задната страна обратно на часовника.',
      descEn: 'Counter-clockwise 90° rotation of back layer.',
      badge: "B'",
    },
    {
      code: 'U2',
      nameBg: 'Горна двойна (U2)',
      nameEn: 'Up Double Turn (180°)',
      descBg: 'Завъртане на горния слой на 180 градуса (2 пъти U).',
      descEn: 'Half-turn 180° rotation of top face.',
      badge: 'U2',
    },
    {
      code: 'R2',
      nameBg: 'Дясна двойна (R2)',
      nameEn: 'Right Double Turn (180°)',
      descBg: 'Завъртане на десния слой на 180 градуса (2 пъти R).',
      descEn: 'Half-turn 180° rotation of right face.',
      badge: 'R2',
    },
    {
      code: 'F2',
      nameBg: 'Предна двойна (F2)',
      nameEn: 'Front Double Turn (180°)',
      descBg: 'Завъртане на предния слой на 180 градуса (2 пъти F).',
      descEn: 'Half-turn 180° rotation of front face.',
      badge: 'F2',
    },
  ];

  // Quick move buttons for interactive manual practice
  readonly manualMoveKeys: StandardMove[] = [
    'R', "R'", 'U', "U'", 'F', "F'", 'L', "L'", 'D', "D'", 'B', "B'", 'R2', 'U2', 'F2',
  ];

  get isBg(): boolean {
    return this.language() === 'bg';
  }

  readonly currentStep = computed<TutorialStep>(() => {
    return this.steps[this.currentStepIndex()] || this.steps[0];
  });

  readonly currentCase = computed<TutorialCase | null>(() => {
    const cases = this.currentStep().cases;
    if (!cases || cases.length === 0) return null;
    return cases[this.selectedCaseIndex()] || cases[0];
  });

  readonly activeAlgorithm = computed<string>(() => {
    const activeCase = this.currentCase();
    return activeCase ? activeCase.algorithm : this.currentStep().algorithm;
  });

  readonly currentStepMoves = computed<StandardMove[]>(() => {
    return this.activeAlgorithm()
      .split(' ')
      .filter(Boolean) as StandardMove[];
  });

  readonly progressPercent = computed<number>(() => {
    return Math.round(((this.currentStepIndex() + 1) / this.steps.length) * 100);
  });

  readonly isStepCompleted = computed<boolean>(() => {
    return this.currentMoveIndex() >= this.currentStepMoves().length && this.currentStepMoves().length > 0;
  });

  toggleHint(): void {
    this.showHint.update((v) => !v);
  }

  getMoveDetail(move: string | undefined): MoveGuideDetail {
    if (!move) {
      return {
        code: 'U' as StandardMove,
        arrow: '✓',
        nameBg: 'Завършено',
        nameEn: 'Done',
        actionBg: 'Алгоритъмът е завършен',
        actionEn: 'Algorithm completed',
      };
    }
    return (
      MOVE_DETAILS[move] || {
        code: move as StandardMove,
        arrow: '🔄',
        nameBg: move,
        nameEn: move,
        actionBg: `Завъртане ${move}`,
        actionEn: `Turn ${move}`,
      }
    );
  }

  readonly nextExpectedMove = computed<string>(() => {
    const moves = this.currentStepMoves();
    const idx = this.currentMoveIndex();
    return moves[idx] || '';
  });

  isNextExpectedMove(key: string): boolean {
    return this.showHint() && this.nextExpectedMove() === key;
  }

  readonly currentOrientationGuide = computed<{ icon: string; textBg: string; textEn: string }>(() => {
    const step = this.currentStep();
    const c = this.currentCase();
    const cId = c?.id;

    if (step.id === 'white_cross') {
      if (cId === 'daisy') {
        return {
          icon: '🌼',
          textBg: 'Дръжте ЖЪЛТИЯ център отгоре (U), а белия отдолу (D). Събираме 4-те бели ръба около жълтия център.',
          textEn: 'Hold YELLOW center on top (U), white on bottom (D). Gather 4 white edges around the yellow center.',
        };
      }
      return {
        icon: '⚪',
        textBg: 'Дръжте БЕЛИЯ център отдолу (D) или отгоре (U). Напаснете страничния цвят на ръба с центъра.',
        textEn: 'Hold WHITE center on bottom (D) or top (U). Match edge side color with its center.',
      };
    }

    if (step.id === 'first_layer_corners') {
      return {
        icon: '⚪',
        textBg: 'БЯЛАТА стена е отдолу (D). Завъртете горния слой така, че бялото ъгълче да застане горе-вдясно точно над целевия си слот.',
        textEn: 'WHITE face on bottom (D). Turn top layer so white corner is top-right directly above target slot.',
      };
    }

    if (step.id === 'second_layer_edges') {
      return {
        icon: '🟧',
        textBg: 'БЯЛОТО е отдолу (D), ЖЪЛТОТО е отгоре (U). Напаснете цвета на предния ръб с предния център (прави буква „Т“).',
        textEn: 'WHITE on bottom (D), YELLOW on top (U). Match front edge color with front center (forms a "T").',
      };
    }

    if (step.id === 'yellow_cross') {
      if (cId === 'l_shape') {
        return {
          icon: '↖️',
          textBg: 'ЖЪЛТОТО е отгоре (U). Дръжте малката жълта стрелка горе-вляво (на 9 и 12 часа ↖️), сочеща нагоре и наляво.',
          textEn: 'YELLOW on top (U). Hold yellow L-shape in top-left (9 and 12 o\'clock ↖️).',
        };
      }
      if (cId === 'horizontal_line') {
        return {
          icon: '➖',
          textBg: 'ЖЪЛТОТО е отгоре (U). Дръжте жълтата линия хоризонтално (отляво надясно ➖).',
          textEn: 'YELLOW on top (U). Hold yellow line horizontally (left-to-right ➖).',
        };
      }
      return {
        icon: '🟡',
        textBg: 'ЖЪЛТОТО е отгоре (U). При единична точка изпълнете формулата веднъж от произволна страна.',
        textEn: 'YELLOW on top (U). For a single dot, execute the formula from any angle.',
      };
    }

    if (step.id === 'orient_corners_sune') {
      if (cId === 'fish') {
        return {
          icon: '🐟',
          textBg: 'ЖЪЛТОТО е отгоре (U). Завъртете куба така, че главата на рибката (единственият жълт връх) да сочи долу-вляво ↙️.',
          textEn: 'YELLOW on top (U). Rotate cube so fish head (single yellow corner) points bottom-left ↙️.',
        };
      }
      if (cId === 'cross_no_corners') {
        return {
          icon: '👀',
          textBg: 'ЖЪЛТОТО е отгоре (U). Завъртете куба така, че жълтият фар на лявата страна да сочи наляво ⬅️.',
          textEn: 'YELLOW on top (U). Rotate cube so yellow headlight on left face points left ⬅️.',
        };
      }
      return {
        icon: '🟡',
        textBg: 'ЖЪЛТОТО е отгоре (U). Дръжте така, че предният ляв връх да има жълто, сочещо напред.',
        textEn: 'YELLOW on top (U). Hold so front-left corner has yellow facing front.',
      };
    }

    if (step.id === 'permute_corners') {
      if (cId === 'headlights_back') {
        return {
          icon: '🚗',
          textBg: 'Дръжте стената с двата еднакви ъгъла („фаровете“) откъм ГЪРБА (задната страна B).',
          textEn: 'Hold face with two matching corner stickers (headlights) at the BACK (B face).',
        };
      }
      return {
        icon: '🔍',
        textBg: 'Ако няма фарове никъде, изпълнете от произволна страна; след това ще се появят фарове и ги сложете отзад.',
        textEn: 'If no headlights anywhere, execute from any side; headlights will appear, then place them at the back.',
      };
    }

    if (step.id === 'permute_edges_solved') {
      if (cId === 'clockwise' || cId === 'counter_clockwise') {
        return {
          icon: '🏁',
          textBg: 'Дръжте напълно готовата едноцветна стена откъм ГЪРБА (задната страна B). Останалите 3 ръба се циклират.',
          textEn: 'Hold fully solved solid face at the BACK (B face). Remaining 3 edges cycle into place.',
        };
      }
      return {
        icon: '🔄',
        textBg: 'Ако няма готова стена, изпълнете формулата веднъж; ще получите готова стена — сложете я отзад и повторете.',
        textEn: 'If no solid face, execute once; you will get one solved face — place it at back and repeat.',
      };
    }

    return {
      icon: '🧭',
      textBg: 'Дръжте бялото отдолу, жълтото отгоре.',
      textEn: 'Hold white on bottom, yellow on top.',
    };
  });

  readonly currentMnemonic = computed<{ titleBg: string; titleEn: string; descBg: string; descEn: string } | null>(() => {
    const step = this.currentStep();
    if (step.id === 'first_layer_corners') {
      return {
        titleBg: 'Десен тригер (Sexy Move) [R U R\' U\']',
        titleEn: 'Right Trigger (Sexy Move) [R U R\' U\']',
        descBg: '⬆️ Вдигаш дясното → ⬅️ Горната бяга наляво → ⬇️ Връщаш дясното → ➡️ Горната се връща. Повтори 1 до 5 пъти, докато бялото слезе долу!',
        descEn: '⬆️ Right up → ⬅️ Top left → ⬇️ Right down → ➡️ Top right. Repeat 1 to 5 times until white faces down!',
      };
    }
    if (step.id === 'second_layer_edges') {
      return {
        titleBg: 'Конюгиран тригер: Буташ → Десен тригер → Ляв тригер',
        titleEn: 'Conjugated Trigger: Push Away → Right Trigger → Left Trigger',
        descBg: 'За вмъкване Надясно: U (буташ наляво) → правиш Десен тригер [R U R\' U\'] → завърташ към съседната стена и затваряш с Ляв тригер [F\' U F].',
        descEn: 'To insert Right: U (push away) → Right Trigger [R U R\' U\'] → turn to adjacent face and close with Left Trigger [F\' U F].',
      };
    }
    if (step.id === 'yellow_cross') {
      return {
        titleBg: 'Лице ↻ → Десен тригер → Лице ↺ [F (R U R\' U\') F\']',
        titleEn: 'Front ↻ → Right Trigger → Front ↺ [F (R U R\' U\') F\']',
        descBg: 'Сваляш лицевата стена по часовника (F) → изпълняваш познатия Десен тригер (R U R\' U\') → връщаш лицевата стена обратно (F\'). Изключително лесно!',
        descEn: 'Rotate front clockwise (F) → execute the familiar Right Trigger (R U R\' U\') → rotate front counter-clockwise (F\'). Super easy!',
      };
    }
    if (step.id === 'orient_corners_sune') {
      return {
        titleBg: 'Трансформация „Сюне“ (Sune)',
        titleEn: 'Sune Transformation',
        descBg: '⬆️ Вдигаш десния → ⬅️ Горният бяга → ⬇️ Сваляш десния → ⬅️ Горният продължава → ⬆️ Вдигаш десния → 🔄 Двойно завъртане на 180° и ⬇️ сваляш!',
        descEn: '⬆️ Right up → ⬅️ Top moves → ⬇️ Right down → ⬅️ Top moves again → ⬆️ Right up → 🔄 Double 180° turn and ⬇️ down!',
      };
    }
    if (step.id === 'permute_corners') {
      return {
        titleBg: 'A-пермутация („Фарове“)',
        titleEn: 'A-Permutation (Headlights)',
        descBg: 'R\' F R\' B2 R F\' R\' B2 R2. Разменя предните 2 върха и запазва фаровете отзад!',
        descEn: 'R\' F R\' B2 R F\' R\' B2 R2. Swaps the 2 front corners while keeping the back headlights intact!',
      };
    }
    if (step.id === 'permute_edges_solved') {
      return {
        titleBg: 'U-пермутация (Финално нареждане!)',
        titleEn: 'U-Permutation (Final Solve!)',
        descBg: 'Разменя по часовника последните 3 нерешени ръба. Дръж готовата стена отзад и кубът е 100% нареден!',
        descEn: 'Cycles the remaining 3 unsolved edges clockwise. Keep solid face at back and cube is 100% solved!',
      };
    }
    return null;
  });

  readonly currentCasePattern = computed<string[][]>(() => {
    const step = this.currentStep();
    const c = this.currentCase();
    const cId = c?.id;
    const Y = '#fbbf24'; // yellow
    const W = '#f8fafc'; // white
    const D = '#334155'; // dim / neutral grey
    const G = '#10b981'; // green
    const R = '#ef4444'; // red
    const B = '#3b82f6'; // blue
    const O = '#f97316'; // orange

    if (step.id === 'white_cross') {
      if (cId === 'daisy') {
        return [
          [D, W, D],
          [W, Y, W],
          [D, W, D],
        ];
      }
      return [
        [D, W, D],
        [W, W, W],
        [D, W, D],
      ];
    }

    if (step.id === 'first_layer_corners') {
      if (cId === 'white_up') {
        return [
          [D, W, D],
          [W, W, W],
          [D, W, W],
        ];
      }
      return [
        [D, W, D],
        [W, W, W],
        [D, W, B],
      ];
    }

    if (step.id === 'second_layer_edges') {
      if (cId === 'insert_left') {
        return [
          [D, G, D],
          [D, G, D],
          [B, G, D],
        ];
      }
      return [
        [D, G, D],
        [D, G, D],
        [D, G, R],
      ];
    }

    if (step.id === 'yellow_cross') {
      if (cId === 'dot') {
        return [
          [D, D, D],
          [D, Y, D],
          [D, D, D],
        ];
      }
      if (cId === 'l_shape') {
        return [
          [D, Y, D],
          [Y, Y, D],
          [D, D, D],
        ];
      }
      if (cId === 'horizontal_line') {
        return [
          [D, D, D],
          [Y, Y, Y],
          [D, D, D],
        ];
      }
      return [
        [D, Y, D],
        [Y, Y, Y],
        [D, Y, D],
      ];
    }

    if (step.id === 'orient_corners_sune') {
      if (cId === 'fish') {
        return [
          [D, Y, D],
          [Y, Y, Y],
          [Y, Y, D],
        ];
      }
      if (cId === 'cross_no_corners') {
        return [
          [D, Y, D],
          [Y, Y, Y],
          [D, Y, D],
        ];
      }
      if (cId === 'two_corners') {
        return [
          [Y, Y, D],
          [Y, Y, Y],
          [Y, Y, D],
        ];
      }
      return [
        [D, Y, D],
        [Y, Y, Y],
        [Y, Y, D],
      ];
    }

    if (step.id === 'permute_corners') {
      if (cId === 'headlights_back') {
        return [
          [G, D, G],
          [D, Y, D],
          [R, D, B],
        ];
      }
      return [
        [G, D, O],
        [D, Y, D],
        [R, D, B],
      ];
    }

    if (step.id === 'permute_edges_solved') {
      if (cId === 'clockwise' || cId === 'counter_clockwise') {
        return [
          [G, G, G],
          [O, Y, R],
          [B, G, B],
        ];
      }
      return [
        [G, R, G],
        [O, Y, B],
        [B, O, B],
      ];
    }

    return [
      [D, Y, D],
      [Y, Y, Y],
      [D, Y, D],
    ];
  });

  prevStep(): void {
    if (this.currentStepIndex() > 0) {
      this.stopAutoPlay();
      this.currentStepIndex.update((i) => i - 1);
      this.selectedCaseIndex.set(0);
      this.currentMoveIndex.set(0);
      this.showMathNote.set(false);
      this.practiceFeedback.set(null);
      this.setupPracticeCase();
    }
  }

  nextStep(): void {
    if (this.currentStepIndex() < this.steps.length - 1) {
      this.stopAutoPlay();
      this.currentStepIndex.update((i) => i + 1);
      this.selectedCaseIndex.set(0);
      this.currentMoveIndex.set(0);
      this.showMathNote.set(false);
      this.practiceFeedback.set(null);
      this.setupPracticeCase();
    }
  }

  selectStep(index: number): void {
    this.stopAutoPlay();
    this.currentStepIndex.set(index);
    this.selectedCaseIndex.set(0);
    this.currentMoveIndex.set(0);
    this.showMathNote.set(false);
    this.practiceFeedback.set(null);
    this.setupPracticeCase();
  }

  selectCase(index: number): void {
    this.stopAutoPlay();
    this.selectedCaseIndex.set(index);
    this.currentMoveIndex.set(0);
    this.practiceFeedback.set(null);
    this.setupPracticeCase();
  }

  toggleMathNote(): void {
    this.showMathNote.update((v) => !v);
  }

  toggleNotationGuide(): void {
    this.showNotationGuide.update((v) => !v);
  }

  togglePracticeMode(): void {
    this.isPracticeMode.update((v) => !v);
    this.practiceFeedback.set(null);
  }

  toggleSolver(): void {
    if (this.showSolver()) {
      this.showSolver.set(false);
      return;
    }
    const res = this.cubeStateService.solveCurrentCube();
    this.solveResult.set(res);
    this.showSolver.set(true);
  }

  jumpToStage(stageNumber: number): void {
    this.showSolver.set(false);
    this.selectStep(stageNumber - 1);
  }

  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed.set(speed);
  }

  /**
   * Set up the exact practice position on the 3D cube for the selected case/step.
   * Resets 3D cube and physically applies the setup moves instantly.
   */
  setupPracticeCase(): void {
    this.stopAutoPlay();
    const curCase = this.currentCase();
    const curStep = this.currentStep();

    // Priority: case setupMoves -> step setupAlgorithm -> algebraic inverse of algorithm
    const setupSeq =
      curCase?.setupMoves ||
      curStep.setupAlgorithm ||
      RubikGroupAlgebra.invertAlgorithm(this.activeAlgorithm());

    const label = this.isBg
      ? `Позиция: ${curCase ? curCase.nameBg : curStep.titleBg}`
      : `Setup: ${curCase ? curCase.name : curStep.title}`;

    this.cubeStateService.setupPracticePosition(setupSeq, label);
    this.currentMoveIndex.set(0);

    this.practiceFeedback.set({
      success: true,
      message: this.isBg
        ? '🎯 Позицията за упражнение е заредена на 3D куба! Натиснете "Следващ ход" (⏭️) или пуснете авто-плей (▶️).'
        : '🎯 Practice position loaded on 3D cube! Click "Next Move" (⏭️) or play auto-play (▶️).',
    });
  }

  /**
   * Execute the next single move in the step's algorithm sequence.
   */
  executeNextMove(): void {
    if (this.isAnimating()) return;
    const moves = this.currentStepMoves();
    const curIdx = this.currentMoveIndex();

    if (curIdx >= moves.length) {
      this.practiceFeedback.set({
        success: true,
        message: this.isBg
          ? '🎉 Всички ходове за тази ситуация са изпълнени!'
          : '🎉 All moves for this case have been executed!',
      });
      return;
    }

    const move = moves[curIdx];
    this.cubeStateService.applyMove(move, () => {
      const nextIdx = curIdx + 1;
      this.currentMoveIndex.set(nextIdx);

      if (nextIdx >= moves.length) {
        this.completedSteps.update((set) => {
          const next = new Set(set);
          next.add(this.currentStepIndex());
          return next;
        });

        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? '✨ Браво! Алгоритъмът беше завършен успешно. Натиснете "Следваща стъпка"!'
            : '✨ Great job! Algorithm completed successfully. Proceed to next step!',
        });
      }
    });
  }

  /**
   * Undo/revert the previous move in the sequence.
   */
  executePrevMove(): void {
    if (this.isAnimating()) return;
    const curIdx = this.currentMoveIndex();
    if (curIdx <= 0) return;

    const moves = this.currentStepMoves();
    const move = moves[curIdx - 1];
    const invertedMove = RubikGroupAlgebra.invertAlgorithm(move) as StandardMove;

    this.cubeStateService.applyMove(invertedMove, () => {
      this.currentMoveIndex.update((i) => Math.max(0, i - 1));
      this.practiceFeedback.set(null);
    });
  }

  /**
   * Toggle auto-play through the algorithm.
   */
  toggleAutoPlay(): void {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  private startAutoPlay(): void {
    if (this.currentMoveIndex() >= this.currentStepMoves().length) {
      this.setupPracticeCase();
      setTimeout(() => this.runAutoPlayStep(), 350);
    } else {
      this.runAutoPlayStep();
    }
    this.isAutoPlaying.set(true);
  }

  private runAutoPlayStep(): void {
    if (!this.isAutoPlaying()) return;

    if (this.currentMoveIndex() >= this.currentStepMoves().length) {
      this.stopAutoPlay();
      return;
    }

    const moves = this.currentStepMoves();
    const move = moves[this.currentMoveIndex()];

    this.cubeStateService.applyMove(move, () => {
      const nextIdx = this.currentMoveIndex() + 1;
      this.currentMoveIndex.set(nextIdx);

      if (nextIdx >= moves.length) {
        this.completedSteps.update((set) => new Set(set).add(this.currentStepIndex()));
        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? '✨ Алгоритъмът завърши с успех!'
            : '✨ Algorithm finished successfully!',
        });
        this.stopAutoPlay();
      } else if (this.isAutoPlaying()) {
        const delay = Math.round(550 / this.playbackSpeed());
        this.autoPlayTimer = setTimeout(() => {
          this.runAutoPlayStep();
        }, delay);
      }
    });
  }

  stopAutoPlay(): void {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  /**
   * Execute entire algorithm at once with 3D animation.
   */
  onExecuteAlgorithm(): void {
    const stepIdx = this.currentStepIndex();
    const algo = this.activeAlgorithm();
    this.isStepExecuting.set(true);
    this.stopAutoPlay();

    this.cubeStateService.applyAlgorithm({
      algo,
      onComplete: () => {
        this.isStepExecuting.set(false);
        this.currentMoveIndex.set(this.currentStepMoves().length);
        this.completedSteps.update((set) => {
          const next = new Set(set);
          next.add(stepIdx);
          return next;
        });
        this.practiceFeedback.set({
          success: true,
          message: this.isBg
            ? 'Алгоритъмът беше приложен напълно върху 3D куба!'
            : 'Algorithm executed completely on the 3D cube!',
        });
      },
    });
  }

  /**
   * Handle user clicking a manual move button in "Опитай сам" mode.
   */
  onManualMove(move: StandardMove): void {
    if (this.isAnimating()) return;

    const moves = this.currentStepMoves();
    const expectedMove = moves[this.currentMoveIndex()];

    this.cubeStateService.applyMove(move, () => {
      if (move === expectedMove) {
        const nextIdx = this.currentMoveIndex() + 1;
        this.currentMoveIndex.set(nextIdx);

        if (nextIdx >= moves.length) {
          this.completedSteps.update((set) => new Set(set).add(this.currentStepIndex()));
          this.practiceFeedback.set({
            success: true,
            message: this.isBg
              ? '🎉 БРАВО! Изпълнихте целия алгоритъм самостоятелно без грешка!'
              : '🎉 AWESOME! You successfully executed the entire algorithm on your own!',
          });
        } else {
          this.practiceFeedback.set({
            success: true,
            message: this.isBg
              ? `✓ Верен ход ${move}! Следващ ход: ${moves[nextIdx]}`
              : `✓ Correct move ${move}! Next move: ${moves[nextIdx]}`,
          });
        }
      } else {
        this.practiceFeedback.set({
          success: false,
          message: this.isBg
            ? `⚠️ Натиснахте ${move}, а очакваният ход по алгоритъма беше ${expectedMove || 'друг'}. Можете да натиснете "⏮️ Отмени" или да презаредите позицията.`
            : `⚠️ You played ${move}, but expected move was ${expectedMove || 'different'}. Click "⏮️ Undo" or reload case.`,
        });
      }
    });
  }

  /**
   * Directly test a notation move from the Notation Guide.
   */
  testNotationMove(move: StandardMove): void {
    this.cubeStateService.applyMove(move);
  }

  onReset(): void {
    this.stopAutoPlay();
    this.currentMoveIndex.set(0);
    this.practiceFeedback.set(null);
    this.cubeStateService.reset();
  }
}
