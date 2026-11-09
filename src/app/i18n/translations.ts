export type Language = 'en' | 'bg';

export interface Translations {
  // Navigation & Header
  appTitle: string;
  appSubtitle: string;
  groupOrder: string;
  solvedBadge: string;
  theoryGuideBtn: string;
  languageName: string;
  pageHome: string;
  pageMath: string;
  pageValidator: string;
  pageTutorial: string;
  pageCustomCube: string;

  // 3D Canvas instructions
  canvasInstructions: string;
  activeSelection: string;
  clickInstruction: string;
  resetCameraTitle: string;

  // Controls 3D
  controlsTitle: string;
  viewModeSetting: string;
  view3D: string;
  view2D: string;
  scrambleBtn: string;
  identityBtn: string;
  generatorsHeading: string;
  generatorsSub: string;
  sliceHeading: string;
  fixedCornersTag: string;
  explodedView: string;
  animSpeed: string;
  speedFast: string;
  speedMed: string;
  speedSlow: string;
  cycleVectorsToggle: string;
  hideVectors: string;
  showVectors: string;

  // Tabs
  tabOrbit: string;
  tabStabilizer: string;
  tabCycles: string;
  tabCommutator: string;
  tabOrder: string;
  tabSubgroups: string;

  // Orbit Explorer
  orbitTitle: string;
  orbitSubtitle: string;
  targetSetLabel: string;
  cornersSet: string;
  edgesSet: string;
  actingSubgroupLabel: string;
  choosePieceLabel: string;
  selectedLabel: string;
  orbitElements: string;
  transitiveAction: string;
  intransitiveAction: string;
  orbitStabilizerTheoremTitle: string;
  orbitExplanation: string;

  // Stabilizer Inspector
  stabilizerTitle: string;
  stabilizerSubtitle: string;
  fixedPointsTag: string;
  posStabilizerIndex: string;
  posStabDesc: string;
  orientedStabTitle: string;
  orientedStabDesc: string;
  generatorMembership: string;
  clickToTest: string;
  stabInsightTitle: string;
  stabInsightDesc: string;

  // Cycle Notation
  cyclesTitle: string;
  cyclesSubtitle: string;
  cornerPermutation: string;
  edgePermutation: string;
  parityLabel: string;
  elementOrderLabel: string;
  fixedCornersCount: string;
  fixedEdgesCount: string;
  identityCycle: string;
  cycleCount: string;

  // Commutator Lab
  commutatorTitle: string;
  commutatorSubtitle: string;
  modeCommutator: string;
  modeConjugate: string;
  presetsLabel: string;
  opALabel: string;
  opBLabel: string;
  expandedFormulaCommutator: string;
  expandedFormulaConjugate: string;
  applyToCubeBtn: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  applyA: string;
  applyB: string;
  undoA: string;
  undoB: string;
  commutatorInsightTitle: string;
  commutatorInsightDesc: string;

  // Order & Stepper
  orderTitle: string;
  orderSubtitle: string;
  activeElementLabel: string;
  cyclicStep: string;
  identityReached: string;
  stepOnceBtn: string;
  autoCycleBtn: string;
  pauseBtn: string;
  resetCounterTitle: string;

  // Subgroups & Patterns
  subgroupsTitle: string;
  subgroupsSubtitle: string;
  famousSubgroupsHeading: string;
  orderApprox: string;
  canonicalHeading: string;
  applyPatternBtn: string;

  // Onboarding Tour
  tourBtn: string;
  tourTitle: string;
  tourSubtitle: string;
  tourStepCount: string;
  tourPrevBtn: string;
  tourNextBtn: string;
  tourFinishBtn: string;
  tourSkipBtn: string;
  tourTryMoveBtn: string;
  tourTakeawayLabel: string;

  // Live Math HUD
  hudTitle: string;
  hudCurrentMove: string;
  hudOrder: string;
  hudOrderDesc: string;
  hudCycles: string;
  hudOrbitSize: string;
  hudParity: string;
  hudPlainExplainTitle: string;
  hudIdentityExplain: string;
  hudSingleTurnExplain: string;
  hudCommutatorExplain: string;
  hudGeneralExplain: string;

  // Theory Modal
  modalTitle: string;
  modalCloseBtn: string;
  theorySec1Title: string;
  theorySec1Desc: string;
  theorySec1AxiomsTitle: string;
  theorySec1Identity: string;
  theorySec1Compatibility: string;
  theorySec2Title: string;
  theorySec2CornersTitle: string;
  theorySec2CornersDesc: string;
  theorySec2EdgesTitle: string;
  theorySec2EdgesDesc: string;
  theorySec2StickersTitle: string;
  theorySec2StickersDesc: string;
  theorySec2StatesTitle: string;
  theorySec2StatesDesc: string;
  theorySec3Title: string;
  theorySec3Desc: string;
  theorySec3InvariantsTitle: string;
  theorySec3Inv1: string;
  theorySec3Inv2: string;
  theorySec3Inv3: string;
  theorySec3OrderDesc: string;
  theorySec4Title: string;
  theorySec4Desc: string;
  theorySec4IndexDesc: string;
  theorySec5Title: string;
  theorySec5Desc: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Rubik's Cube Group Actions",
    appSubtitle: '3D Abstract Algebra',
    groupOrder: 'Group order:',
    solvedBadge: 'Solved Identity State (e)',
    theoryGuideBtn: 'Theory Guide',
    languageName: 'Български',
    pageHome: 'Overview',
    pageMath: 'Math Concepts',
    pageValidator: 'Orbit Validator',
    pageTutorial: 'Cube Tutorial',
    pageCustomCube: 'Physical Cube',

    canvasInstructions: 'Rotate: Left Click + Drag | Pan: Right Click | Zoom: Scroll',
    activeSelection: 'Active Selection:',
    clickInstruction: 'Click any cubie to inspect its orbit & stabilizer',
    resetCameraTitle: 'Reset Camera Orientation',

    controlsTitle: 'Cube Manipulator',
    viewModeSetting: 'View Mode',
    view3D: '3D Cube',
    view2D: '2D Net',
    scrambleBtn: 'Scramble',
    identityBtn: 'Identity (e)',
    generatorsHeading: 'Generators: Quarter Turns g ∈ ⟨U, D, F, B, L, R⟩',
    generatorsSub: 'Clockwise / Inverse / 180°',
    sliceHeading: 'Slice Generators: ⟨M, E, S⟩',
    fixedCornersTag: 'Fixed corners!',
    explodedView: 'Exploded View',
    animSpeed: 'Animation Speed',
    speedFast: 'Fast',
    speedMed: 'Med',
    speedSlow: 'Slow',
    cycleVectorsToggle: '3D Cycle Permutation Arrows',
    hideVectors: 'Hide 3D Vectors',
    showVectors: 'Show 3D Vectors',

    tabOrbit: 'Orbit',
    tabStabilizer: 'Stabilizer',
    tabCycles: 'Cycles',
    tabCommutator: '[A, B]',
    tabOrder: 'Order',
    tabSubgroups: 'Subgroups',

    orbitTitle: 'Orbit Explorer: Orb_H(x)',
    orbitSubtitle: 'Visualizing the group action H × X → X and reachable states.',
    targetSetLabel: 'Target Set X',
    cornersSet: 'Corners (|X|=8)',
    edgesSet: 'Edges (|X|=12)',
    actingSubgroupLabel: 'Acting Subgroup H ≤ G',
    choosePieceLabel: 'Choose Base Piece x ∈ X:',
    selectedLabel: 'Selected:',
    orbitElements: 'Orbit Elements:',
    transitiveAction: 'Transitive Action (Full Set)',
    intransitiveAction: 'Intransitive (Partial Orbit)',
    orbitStabilizerTheoremTitle: 'Orbit-Stabilizer Theorem:',
    orbitExplanation: 'Every element h ∈ H that moves the piece belongs to a left coset of the stabilizer Stab_H(x). The total number of reachable positions equals the index [H : Stab_H(x)].',

    stabilizerTitle: 'Stabilizer Subgroup: Stab_G',
    stabilizerSubtitle: 'Moves g ∈ G that leave the piece invariant: g · x = x.',
    fixedPointsTag: 'Fixed Points',
    posStabilizerIndex: 'Position Stabilizer Index',
    posStabDesc: 'elements in Stab_G(x)!',
    orientedStabTitle: 'Oriented State Stabilizer',
    orientedStabDesc: 'Preserves both piece position and facelet orientation twists.',
    generatorMembership: 'Generator Membership in Stab(x):',
    clickToTest: 'Click to test & apply:',
    stabInsightTitle: 'Abstract Algebra Insight:',
    stabInsightDesc: "By Lagrange's Theorem, the size of any stabilizer subgroup divides the order of the group |G|. Notice that slice moves ⟨M, E, S⟩ fix all corners completely — that is, ⟨M, E, S⟩ ⊆ ⋂ Stab(C_i)!",

    cyclesTitle: 'Disjoint Cycle Decomposition:',
    cyclesSubtitle: 'Permutations in symmetric groups S₈ (corners) and S₁₂ (edges).',
    cornerPermutation: 'Corner Permutation σ ∈ S₈:',
    edgePermutation: 'Edge Permutation τ ∈ S₁₂:',
    parityLabel: 'Parity sgn(σ)',
    elementOrderLabel: 'Element Order ord(g)',
    fixedCornersCount: 'Fixed Corners',
    fixedEdgesCount: 'Fixed Edges',
    identityCycle: '(e) [Identity - all pieces fixed]',
    cycleCount: 'cycle(s)',

    commutatorTitle: 'Commutator & Conjugation Lab',
    commutatorSubtitle: "The algebraic secret behind Rubik's cube algorithms and alternating groups A_n.",
    modeCommutator: 'Commutator [A, B]',
    modeConjugate: 'Conjugate A B A⁻¹',
    presetsLabel: 'Presets:',
    opALabel: 'Operation A (or Setup Move)',
    opBLabel: 'Operation B (Core Action)',
    expandedFormulaCommutator: 'Expanded Commutator Formula:',
    expandedFormulaConjugate: 'Expanded Conjugate Formula:',
    applyToCubeBtn: 'Apply to Cube',
    step1: 'Step 1',
    step2: 'Step 2',
    step3: 'Step 3',
    step4: 'Step 4',
    applyA: 'Apply A',
    applyB: 'Apply B',
    undoA: 'Undo A⁻¹',
    undoB: 'Undo B⁻¹',
    commutatorInsightTitle: 'Why Commutators Work:',
    commutatorInsightDesc: 'The commutator [A, B] can only affect pieces belonging to the intersection of the supports supp(A) ∩ supp(B). When the intersection consists of a single piece, [A, B] is guaranteed to be a pure 3-cycle, leaving 90% of the cube completely undisturbed!',

    orderTitle: 'Element Order & Cyclic Subgroups',
    orderSubtitle: 'Computing the order ord(g) = min { k ≥ 1 : g^k = e }.',
    activeElementLabel: 'Active Element g ∈ G:',
    cyclicStep: 'Cyclic Step:',
    identityReached: 'Identity Reached (e)!',
    stepOnceBtn: 'Step Once (g¹)',
    autoCycleBtn: 'Auto Cycle to Identity',
    pauseBtn: 'Pause',
    resetCounterTitle: 'Reset Step Counter',

    subgroupsTitle: 'Subgroups & Canonical Configurations',
    subgroupsSubtitle: "Explore structured subgroups H ≤ G and notable elements in the Rubik's group.",
    famousSubgroupsHeading: 'Famous Subgroups of G:',
    orderApprox: 'Order ≈',
    canonicalHeading: 'Canonical Elements & Patterns in G:',
    applyPatternBtn: 'Apply Pattern',

    modalTitle: "Group Actions & The Rubik's Cube Group",
    modalCloseBtn: "Got it, Let's Explore!",
    theorySec1Title: '1. What is a Group Action?',
    theorySec1Desc: 'Let (G, ·) be a group and X a set. A group action of G on X is a function:',
    theorySec1AxiomsTitle: 'satisfying two fundamental axioms:',
    theorySec1Identity: 'Identity: e · x = x for all x ∈ X.',
    theorySec1Compatibility: 'Compatibility: (g · h) · x = g · (h · x) for all g, h ∈ G and x ∈ X.',
    theorySec2Title: "2. The Natural Sets X Acted Upon by Rubik's Group",
    theorySec2CornersTitle: 'Corners: X_C (|X| = 8)',
    theorySec2CornersDesc: 'The 8 corner cubies permute in S₈ with 3 possible orientations in ℤ₃ each.',
    theorySec2EdgesTitle: 'Edges: X_E (|X| = 12)',
    theorySec2EdgesDesc: 'The 12 edge cubies permute in S₁₂ with 2 orientations in ℤ₂ each.',
    theorySec2StickersTitle: 'Stickers: X_S (|X| = 54)',
    theorySec2StickersDesc: 'The colored facelets permute under face turns as permutations in S₅₄.',
    theorySec2StatesTitle: 'Cube States: C',
    theorySec2StatesDesc: 'The legal configuration space containing ≈ 4.3 × 10¹⁹ states forming a single connected orbit.',
    theorySec3Title: '3. Group Structure & Order |G|',
    theorySec3Desc: "The Rubik's cube group decomposes as a semi-direct product:",
    theorySec3InvariantsTitle: 'Subject to the First Fundamental Theorem of Rubikology:',
    theorySec3Inv1: '1. Corner orientation sum is zero mod 3',
    theorySec3Inv2: '2. Edge flip sum is zero mod 2',
    theorySec3Inv3: '3. Equal permutation parity (sgn(σ) = sgn(τ))',
    theorySec3OrderDesc: 'Dividing the total unrestricted combinations by 3 × 2 × 2 = 12 yields:',
    theorySec4Title: '4. The Orbit-Stabilizer Theorem',
    theorySec4Desc: 'For any piece x ∈ X:',
    theorySec4IndexDesc: 'Because the group action on corners is transitive, |Orb(x)| = 8. Therefore, the subgroup of moves fixing a specific corner has size:',
    theorySec5Title: '5. Commutators and 3-Cycles',
    theorySec5Desc: 'The commutator [A, B] = A B A⁻¹ B⁻¹ isolates changes. When the supports of A and B intersect in exactly 1 element, [A, B] induces a pure 3-cycle. Since 3-cycles generate the alternating group A_n, the commutator subgroup [G, G] is the mathematical engine of all cube algorithms!',

    // Onboarding Tour
    tourBtn: 'Quick Tour',
    tourTitle: 'Interactive Tour: Rubik Algebra for Everyone',
    tourSubtitle: 'How the Rubik’s Cube demonstrates Abstract Algebra in 5 easy steps',
    tourStepCount: 'Step',
    tourPrevBtn: 'Previous',
    tourNextBtn: 'Next Step',
    tourFinishBtn: 'Start Exploring!',
    tourSkipBtn: 'Skip Tour',
    tourTryMoveBtn: 'Try this move!',
    tourTakeawayLabel: 'Key Takeaway for Engineers & Leaders:',

    // Live Math HUD
    hudTitle: 'Live Algebraic Feedback',
    hudCurrentMove: 'Current Move g ∈ G',
    hudOrder: 'Element Order ord(g)',
    hudOrderDesc: 'repeats return cube to initial state',
    hudCycles: 'Disjoint Cycles Decomposition',
    hudOrbitSize: 'Orbit Reachability',
    hudParity: 'Permutation Parity',
    hudPlainExplainTitle: 'Plain Language "Translation":',
    hudIdentityExplain: 'The cube is currently in identity state (e). All 54 stickers and 20 movable pieces match their home positions.',
    hudSingleTurnExplain: 'You rotated a single face. Exactly 4 corners and 4 edges moved in closed 4-cycles, leaving the other 18 pieces completely untouched in the stabilizer.',
    hudCommutatorExplain: 'A commutator or sequence was applied. Notice how it isolates changes, swapping targeted pieces while keeping most of the cube invariant.',
    hudGeneralExplain: 'A transformation occurred. The math engine tracked every cycle, permutation parity, and element order purely in algebraic memory.',
  },
  bg: {
    appTitle: 'Групови действия върху Кубчето на Рубик',
    appSubtitle: '3D Абстрактна Алгебра',
    groupOrder: 'Ред на групата:',
    solvedBadge: 'Решено състояние / Идентитет (e)',
    theoryGuideBtn: 'Теоретично ръководство',
    languageName: 'English',
    pageHome: 'Преглед',
    pageMath: 'Математически Концепции',
    pageValidator: 'Валидатор на Орбитата',
    pageTutorial: 'Интерактивен Урок',
    pageCustomCube: 'Физическо кубче',

    canvasInstructions: 'Въртене: Ляв бутон + влачене | Панорама: Десен бутон | Мащаб: Скрол',
    activeSelection: 'Активен избор:',
    clickInstruction: 'Кликнете върху кубче за преглед на орбитата и стабилизатора',
    resetCameraTitle: 'Възстановяване на камерата',

    controlsTitle: 'Управление на Куба',
    viewModeSetting: 'Режим на изгледа',
    view3D: '3D Куб',
    view2D: '2D Разгъвка',
    scrambleBtn: 'Разбъркване',
    identityBtn: 'Идентитет (e)',
    generatorsHeading: 'Генератори: Четвърт завъртания g ∈ ⟨U, D, F, B, L, R⟩',
    generatorsSub: 'По часовника / Обратно / 180°',
    sliceHeading: 'Слойни генератори (Слайсове): ⟨M, E, S⟩',
    fixedCornersTag: 'Фиксирани върхове!',
    explodedView: 'Разглобен изглед',
    animSpeed: 'Скорост на анимацията',
    speedFast: 'Бързо',
    speedMed: 'Средно',
    speedSlow: 'Бавно',
    cycleVectorsToggle: '3D Векторни стрелки на циклите',
    hideVectors: 'Скрий 3D векторите',
    showVectors: 'Покажи 3D векторите',

    tabOrbit: 'Орбита',
    tabStabilizer: 'Стабилизатор',
    tabCycles: 'Цикли',
    tabCommutator: '[A, B]',
    tabOrder: 'Ред',
    tabSubgroups: 'Подгрупи',

    orbitTitle: 'Изследване на Орбитата: Orb_H(x)',
    orbitSubtitle: 'Визуализация на груповото действие H × X → X и достижимите състояния.',
    targetSetLabel: 'Целево множество X',
    cornersSet: 'Върхове (|X|=8)',
    edgesSet: 'Ръбове (|X|=12)',
    actingSubgroupLabel: 'Действаща подгрупа H ≤ G',
    choosePieceLabel: 'Избор на базов елемент x ∈ X:',
    selectedLabel: 'Избран:',
    orbitElements: 'Елементи на орбитата:',
    transitiveAction: 'Транзитивно действие (Пълно множество)',
    intransitiveAction: 'Нетранзитивно действие (Частична орбита)',
    orbitStabilizerTheoremTitle: 'Теорема за орбитата и стабилизатора:',
    orbitExplanation: 'Всеки елемент h ∈ H, който премества елемента, принадлежи на ляв съседен клас на стабилизатора Stab_H(x). Общият брой достижими позиции е равен на индекса [H : Stab_H(x)].',

    stabilizerTitle: 'Подгрупа на стабилизатора: Stab_G',
    stabilizerSubtitle: 'Движения g ∈ G, които оставят елемента инвариантен: g · x = x.',
    fixedPointsTag: 'Фиксирани точки',
    posStabilizerIndex: 'Индекс на позиционния стабилизатор',
    posStabDesc: 'елемента в Stab_G(x)!',
    orientedStabTitle: 'Стабилизатор на ориентираното състояние',
    orientedStabDesc: 'Запазва както позицията на парчето, така и ориентацията на стикерите.',
    generatorMembership: 'Принадлежност на генераторите към Stab(x):',
    clickToTest: 'Кликнете за тест и прилагане:',
    stabInsightTitle: 'Прозрение от Абстрактната Алгебра:',
    stabInsightDesc: 'По теоремата на Лагранж редът на всяка подгрупа на стабилизатора дели реда на групата |G|. Забележете, че слойните движения ⟨M, E, S⟩ фиксират напълно всички върхове — т.е. ⟨M, E, S⟩ ⊆ ⋂ Stab(C_i)!',

    cyclesTitle: 'Разлагане на непресичащи се цикли:',
    cyclesSubtitle: 'Пермутации в симетричните групи S₈ (върхове) и S₁₂ (ръбове).',
    cornerPermutation: 'Пермутация на върховете σ ∈ S₈:',
    edgePermutation: 'Пермутация на ръбовете τ ∈ S₁₂:',
    parityLabel: 'Четност sgn(σ)',
    elementOrderLabel: 'Ред на елемента ord(g)',
    fixedCornersCount: 'Фиксирани върхове',
    fixedEdgesCount: 'Фиксирани ръбове',
    identityCycle: '(e) [Идентитет - всички елементи са фиксирани]',
    cycleCount: 'цикъл(а)',

    commutatorTitle: 'Лаборатория за Комутатори и Конюгация',
    commutatorSubtitle: 'Алгебричната тайна зад алгоритмите за Кубчето на Рубик и алтерниращите групи A_n.',
    modeCommutator: 'Комутатор [A, B]',
    modeConjugate: 'Конюгат A B A⁻¹',
    presetsLabel: 'Шаблони:',
    opALabel: 'Операция A (Подготвително движение)',
    opBLabel: 'Операция B (Основно действие)',
    expandedFormulaCommutator: 'Разширена формула на комутатора:',
    expandedFormulaConjugate: 'Разширена формула на конюгата:',
    applyToCubeBtn: 'Приложи върху куба',
    step1: 'Стъпка 1',
    step2: 'Стъпка 2',
    step3: 'Стъпка 3',
    step4: 'Стъпка 4',
    applyA: 'Приложи A',
    applyB: 'Приложи B',
    undoA: 'Върни A⁻¹',
    undoB: 'Върни B⁻¹',
    commutatorInsightTitle: 'Защо работят комутаторите:',
    commutatorInsightDesc: 'Комутаторът [A, B] може да засегне само елементи, принадлежащи на сечението на носителите supp(A) ∩ supp(B). Когато сечението се състои от точно един елемент, [A, B] гарантирано индуцира чист 3-цикъл, оставяйки 90% от куба напълно незасегнат!',

    orderTitle: 'Ред на елемент и циклични подгрупи',
    orderSubtitle: 'Изчисляване на реда ord(g) = min { k ≥ 1 : g^k = e }.',
    activeElementLabel: 'Активен елемент g ∈ G:',
    cyclicStep: 'Циклична стъпка:',
    identityReached: 'Достигнат е идентитет (e)!',
    stepOnceBtn: 'Единична стъпка (g¹)',
    autoCycleBtn: 'Автоматично циклиране до идентитет',
    pauseBtn: 'Пауза',
    resetCounterTitle: 'Нулиране на брояча',

    subgroupsTitle: 'Подгрупи и Канонични Конфигурации',
    subgroupsSubtitle: 'Изследване на структурирани подгрупи H ≤ G и забележителни елементи в групата на Рубик.',
    famousSubgroupsHeading: 'Известни подгрупи на G:',
    orderApprox: 'Ред ≈',
    canonicalHeading: 'Канонични елементи и симетрии в G:',
    applyPatternBtn: 'Приложи конфигурация',

    modalTitle: 'Групови действия и Групата на Кубчето на Рубик',
    modalCloseBtn: 'Разбрах, да започваме!',
    theorySec1Title: '1. Какво е групово действие?',
    theorySec1Desc: 'Нека (G, ·) е група и X е множество. Групово действие на G върху X е изображение:',
    theorySec1AxiomsTitle: 'удовлетворяващо двете фундаментални аксиоми:',
    theorySec1Identity: 'Идентитет: e · x = x за всяко x ∈ X.',
    theorySec1Compatibility: 'Съвместимост: (g · h) · x = g · (h · x) за всички g, h ∈ G и x ∈ X.',
    theorySec2Title: '2. Естествените множества X в Кубчето на Рубик',
    theorySec2CornersTitle: 'Върхове: X_C (|X| = 8)',
    theorySec2CornersDesc: 'Осемте върхови кубчета се пермутират в S₈ с по 3 възможни ориентации в ℤ₃ всяко.',
    theorySec2EdgesTitle: 'Ръбове: X_E (|X| = 12)',
    theorySec2EdgesDesc: 'Дванадесетте ръбови кубчета се пермутират в S₁₂ с по 2 ориентации в ℤ₂ всяко.',
    theorySec2StickersTitle: 'Стикери: X_S (|X| = 54)',
    theorySec2StickersDesc: 'Цветните стикери се пермутират при завъртания като пермутации в S₅₄.',
    theorySec2StatesTitle: 'Състояния на куба: C',
    theorySec2StatesDesc: 'Пространството от легални конфигурации съдържа ≈ 4.3 × 10¹⁹ състояния, образуващи една свързана орбита.',
    theorySec3Title: '3. Структура и ред на групата |G|',
    theorySec3Desc: 'Групата на Рубик се разлага като полудиректно произведение:',
    theorySec3InvariantsTitle: 'Съгласно Първата фундаментална теорема на Рубикологията:',
    theorySec3Inv1: '1. Сумата от ориентациите на върховете е нула по модул 3',
    theorySec3Inv2: '2. Сумата от обръщанията на ръбовете е нула по модул 2',
    theorySec3Inv3: '3. Еднаква четност на пермутациите (sgn(σ) = sgn(τ))',
    theorySec3OrderDesc: 'Разделянето на общите неограничени комбинации на 3 × 2 × 2 = 12 дава:',
    theorySec4Title: '4. Теорема за орбитата и стабилизатора',
    theorySec4Desc: 'За всяко парче x ∈ X:',
    theorySec4IndexDesc: 'Тъй като действието на групата върху върховете е транзитивно, |Orb(x)| = 8. Следователно подгрупата от движения, фиксиращи даден връх, има мощност:',
    theorySec5Title: '5. Комутатори и 3-цикли',
    theorySec5Desc: 'Комутаторът [A, B] = A B A⁻¹ B⁻¹ изолира промените. Когато носителите на A и B се пресичат в точно 1 елемент, [A, B] индуцира чист 3-цикъл. Тъй като 3-циклите пораждат алтерниращата група A_n, комутаторната подгрупа [G, G] е математическият двигател на всички алгоритми!',

    // Onboarding Tour
    tourBtn: 'Обиколка за неспециалисти',
    tourTitle: 'Интерактивна обиколка: Алгебрата за всеки',
    tourSubtitle: 'Как Кубчето на Рубик демонстрира абстрактна алгебра в 5 лесни стъпки',
    tourStepCount: 'Стъпка',
    tourPrevBtn: 'Предишна',
    tourNextBtn: 'Следваща стъпка',
    tourFinishBtn: 'Да започваме!',
    tourSkipBtn: 'Пропусни',
    tourTryMoveBtn: 'Изпробвай този ход!',
    tourTakeawayLabel: 'Ключов извод за инженери и лидери:',

    // Live Math HUD
    hudTitle: 'Алгебрично състояние на живо',
    hudCurrentMove: 'Последен ход g ∈ G',
    hudOrder: 'Ред на елемента ord(g)',
    hudOrderDesc: 'повторения връщат кубчето в изходно състояние',
    hudCycles: 'Разлагане на цикли',
    hudOrbitSize: 'Достижимост на орбитата',
    hudParity: 'Четност на пермутацията',
    hudPlainExplainTitle: 'Превод на човешки език:',
    hudIdentityExplain: 'Кубчето е в наредено състояние (идентитет e). Всички 54 стикера и 20 подвижни парчета съвпадат с началната си позиция.',
    hudSingleTurnExplain: 'Завъртяхте една стена. Точно 4 върха и 4 ръба смениха местата си в затворени 4-цикли, докато останалите 18 парчета останаха незасегнати в стабилизатора.',
    hudCommutatorExplain: 'Приложен беше комутатор или последователност. Забележете как той изолира промените, разменяйки точно таргетираните парчета, запазвайки останалото непокътнато.',
    hudGeneralExplain: 'Извърши се трансформация. Алгебричният двигател изчисли всеки цикъл, четност и ред на елемента директно в паметта.',
  },
};
