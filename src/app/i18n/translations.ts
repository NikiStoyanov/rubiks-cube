export type Language = 'en' | 'bg';

export interface Translations {
  // Navigation & Header
  appTitle: string;
  appSubtitle: string;
  groupOrder: string;
  solvedBadge: string;
  languageName: string;
  pageHome: string;
  pageMath: string;
  pageValidator: string;
  pageTutorial: string;
  pageCustomCube: string;

  // Sound & Shortcuts
  soundToggleMute: string;
  soundToggleUnmute: string;
  soundOn: string;
  soundOff: string;
  shortcutsModalTitle: string;
  shortcutsModalDesc: string;
  shortcutsFaces: string;
  shortcutsPrimes: string;
  shortcutsSlices: string;
  shortcutsUndo: string;
  shortcutsReset: string;
  shortcutsHelpBtn: string;

  // Settings Menu
  settingsTitle: string;
  settingsSubtitle: string;
  settingsBtn: string;
  settingsLanguageSection: string;
  settingsLangEn: string;
  settingsLangBg: string;
  settingsAudioSection: string;
  settingsAudioToggle: string;
  settingsAudioDesc: string;
  settingsAudioTest: string;
  settingsAudioTestLabel: string;
  settingsMotionSection: string;
  settingsMotionDesc: string;
  settingsSpeedSlow: string;
  settingsSpeedNormal: string;
  settingsSpeedFast: string;
  settingsTestMoveBtn: string;
  settingsViewSection: string;
  settingsCycleArrowsDesc: string;
  settingsExplodedDesc: string;
  settingsResetDefaults: string;
  settingsResetSuccess: string;
  settingsCloseBtn: string;

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
  tryThisLabel: string;

  // Math Concept Callouts
  orbitCalloutTitle: string;
  orbitCalloutDesc: string;
  orbitCalloutStep1: string;
  orbitCalloutStep2: string;
  stabCalloutTitle: string;
  stabCalloutDesc: string;
  stabCalloutStep1: string;
  stabCalloutStep2: string;
  cycleCalloutTitle: string;
  cycleCalloutDesc: string;
  cycleCalloutStep1: string;
  cycleCalloutStep2: string;
  commutatorCalloutTitle: string;
  commutatorCalloutDesc: string;
  commutatorCalloutStep1: string;
  commutatorCalloutStep2: string;
  orderCalloutTitle: string;
  orderCalloutDesc: string;
  orderCalloutStep1: string;
  orderCalloutStep2: string;
  subgroupCalloutTitle: string;
  subgroupCalloutDesc: string;
  subgroupCalloutStep1: string;
  subgroupCalloutStep2: string;

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

  // Header, Canvas & Solver
  brandTitle: string;
  solveBtn: string;
  paint3DBtn: string;
  paint3DBrushPrefix: string;
  paint3DInstruction: string;
  closePaintBtn: string;
  net2DTitle: string;
  clickNetInstruction: string;

  // Global Solve Modal
  solveModalBadge: string;
  solveModalTitle: string;
  solveModalSolvedTitle: string;
  solveModalAlreadyDoneTitle: string;
  solveModalAlreadyDoneDesc: string;
  solveModalScrambleBtn: string;
  solveModalTotalMoves: string;
  solveModalStages: string;
  solveModalExecutedMoves: string;
  solveModalStagePrefix: string;
  solveModalStageOf: string;
  solveModalGoalPrefix: string;
  solveModalAcademyLink: string;
  solveModalMovesForStage: string;
  solveModalStageAlreadySolved: string;
  solveModalStepBack: string;
  solveModalAutoPlay: string;
  solveModalPause: string;
  solveModalStepNext: string;
  solveModalSpeed: string;

  // Home Page
  homeBadge: string;
  homeHeroTitle: string;
  homeHeroDesc: string;
  homeStatSolvability: string;
  homeStatGodsNumber: string;
  homeQuickActions: string;
  homeQuickActionsDesc: string;
  homeExploreBtn: string;
  homeTutorialBtn: string;
  homeFeaturesTitle: string;
  homeFeaturesDesc: string;
  homeModMathTitle: string;
  homeModMathFeat1: string;
  homeModMathFeat1Desc: string;
  homeModMathFeat2: string;
  homeModMathFeat2Desc: string;
  homeModMathFeat3: string;
  homeModMathFeat3Desc: string;
  homeModMathFeat4: string;
  homeModMathFeat4Desc: string;
  homeModValidatorTitle: string;
  homeModValidatorFeat1: string;
  homeModValidatorFeat1Desc: string;
  homeModValidatorFeat2: string;
  homeModValidatorFeat2Desc: string;
  homeModValidatorFeat3: string;
  homeModValidatorFeat3Desc: string;
  homeModValidatorFeat4: string;
  homeModValidatorFeat4Desc: string;
  homeModValidatorBtn: string;
  homeModTutorialTitle: string;
  homeModTutorialFeat1: string;
  homeModTutorialFeat1Desc: string;
  homeModTutorialFeat2: string;
  homeModTutorialFeat2Desc: string;
  homeModTutorialFeat3: string;
  homeModTutorialFeat3Desc: string;
  homeModTutorialFeat4: string;
  homeModTutorialFeat4Desc: string;
  homeModTutorialBtn: string;
  homeModCustomTitle: string;
  homeModCustomFeat1: string;
  homeModCustomFeat1Desc: string;
  homeModCustomFeat2: string;
  homeModCustomFeat2Desc: string;
  homeModCustomFeat3: string;
  homeModCustomFeat3Desc: string;
  homeModCustomFeat4: string;
  homeModCustomFeat4Desc: string;
  homeModCustomBtn: string;

  // Orbit Validator Page
  valHeroBadge: string;
  valHeroTitle: string;
  valHeroDesc: string;
  valPhysicalStates: string;
  valSolvableOrbit: string;
  valProbability: string;
  valValidTitle: string;
  valValidDesc: string;
  valInvalidTitle: string;
  valInvalidDesc: string;
  valConserved: string;
  valViolated: string;
  valCornerTwistTitle: string;
  valCornerTwistDesc: string;
  valEdgeFlipTitle: string;
  valEdgeFlipDesc: string;
  valParityTitle: string;
  valParityDesc: string;
  valTamperSimTitle: string;
  valTamperSimDesc: string;
  valTwistCornerBtn: string;
  valTwistCornerDesc: string;
  valFlipEdgeBtn: string;
  valFlipEdgeDesc: string;
  valSwapPiecesBtn: string;
  valSwapPiecesDesc: string;
  valUnsolvableBannerTitle: string;
  valUnsolvableBannerDesc: string;
  valRepairBtn: string;

  // Custom Physical Cube Page
  customBadge: string;
  customTitle: string;
  customSubtitle: string;
  customNetModeBtn: string;
  customPiecesModeBtn: string;
  customPaint3DOn: string;
  customPaint3DOff: string;
  customSuccessTitle: string;
  customSuccessDesc: string;
  customValidTitle: string;
  customValidPill: string;
  customValidDesc: string;
  customApplyTo3DBtn: string;
  customInspectValidatorBtn: string;
  customSolveBtn: string;
  customHideSolveBtn: string;
  customInvalidTitle: string;
  customInvalidPill: string;
  customInvalidDesc: string;
  customCornerTwistViolated: string;
  customCornerTwistViolatedDesc: string;
  customEdgeFlipViolated: string;
  customEdgeFlipViolatedDesc: string;
  customParityViolated: string;
  customParityViolatedDesc: string;
  customColorCountsTitle: string;
  customPresetsTitle: string;
  customPresetSolved: string;
  customPresetScramble: string;
  customPresetTwist: string;
  customPresetFlip: string;
  customPresetSwap: string;
  customPresetSuperflip: string;
  customNetPainterTitle: string;
  customNetPainterSubtitle: string;
  customClearBlankBtn: string;
  customResetSolvedBtn: string;
  customPaletteLabel: string;
  customPiecesTitle: string;
  customPiecesSubtitle: string;
  customCornersHeading: string;
  customEdgesHeading: string;
  customTwistBtn: string;
  customFlipBtn: string;
  customFooterReady: string;
  customFooterUnsolvable: string;
  customApplyMainBtn: string;
  customCameraModeBtn: string;
  camTitle: string;
  camSubtitle: string;
  camStartBtn: string;
  camStopBtn: string;
  camCaptureBtn: string;
  camMirrorBtn: string;
  camSwitchCameraBtn: string;
  camDemoScanBtn: string;
  camScannedFaces: string;
  camCurrentFaceLabel: string;
  camHoldInstructionF: string;
  camHoldInstructionR: string;
  camHoldInstructionB: string;
  camHoldInstructionL: string;
  camHoldInstructionU: string;
  camHoldInstructionD: string;
  camLivePreviewTitle: string;
  camLivePreviewHint: string;
  camCenterMatchOk: string;
  camCenterMatchWarn: string;
  camAllScannedTitle: string;
  camAllScannedDesc: string;
  camViewInNetBtn: string;
  camErrorPermission: string;
  camIdlePrompt: string;
  camCalibrateHint: string;
  camCalibrateBtn: string;
  camResetCalibrationBtn: string;

  // Cube Tutorial Academy
  academyBadge: string;
  stepCounterStep: string;
  stepCounterOf: string;
  tutorialNotationBtn: string;
  tutorialResetBtn: string;
  tutorialSolveBtn: string;
  tutorialHideSolveBtn: string;
  tutorialAnalysisBadge: string;
  tutorialNextStepsTitle: string;
  tutorialAlreadySolved: string;
  tutorialGoToStep: string;
  tutorialMethodTag: string;
  tutorialSelectCase: string;
  tutorialRecognition: string;
  tutorialStepObjective: string;
  tutorialSetupCubeBtn: string;
  tutorialMathBasis: string;
  tutorialPrevBtn: string;
  tutorialNextBtn: string;
  tutorialPracticeBtn: string;
  tutorialPracticeTitle: string;
  tutorialPracticeDesc: string;
  tutorialOrientationTitle: string;
  tutorialMnemonicTitle: string;
  tutorialPatternTitle: string;
  tutorialHintBtn: string;
  tutorialReloadCaseBtn: string;

  // Shared Modal Actions
  modalCloseBtn: string;

  // State Sharing
  shareBtn: string;
  shareModalTitle: string;
  shareModalDesc: string;
  shareDirectLink: string;
  shareCopyLink: string;
  shareLinkCopied: string;
  shareNativeBtn: string;
  shareScrambleTitle: string;
  shareCopyScramble: string;
  shareFaceletsTitle: string;
  shareCopyFacelets: string;
  shareStatusSolved: string;
  shareStatusSolvable: string;
  shareStatusInvalid: string;
  shareLoadedNotification: string;
  shareViaWhatsApp: string;
  shareViaTelegram: string;
  shareViaX: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Rubik's Cube Group Actions",
    appSubtitle: '3D Abstract Algebra',
    groupOrder: 'Group order:',
    solvedBadge: 'Solved Identity State (e)',
    languageName: 'Български',
    pageHome: 'Home',
    pageMath: 'Math',
    pageValidator: 'Validator',
    pageTutorial: 'Tutorial',
    pageCustomCube: 'My Cube',

    // Sound & Shortcuts
    soundToggleMute: 'Mute Audio',
    soundToggleUnmute: 'Unmute Audio',
    soundOn: 'Sound ON',
    soundOff: 'Sound OFF',
    shortcutsModalTitle: 'Keyboard Shortcuts',
    shortcutsModalDesc: "Control the 3D Rubik's Cube directly from your keyboard",
    shortcutsFaces: 'Face Turns (Clockwise)',
    shortcutsPrimes: "Inverse Turns (Shift + Key / Counter-Clockwise)",
    shortcutsSlices: 'Slice Turns (M, E, S)',
    shortcutsUndo: 'Undo Last Move (Z or Ctrl+Z)',
    shortcutsReset: 'Reset to Identity (Space / Esc)',
    shortcutsHelpBtn: 'Hotkeys',

    // Settings Menu
    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize animation speed, interface language, tactile audio, and 3D visual effects',
    settingsBtn: 'Settings',
    settingsLanguageSection: 'Interface Language',
    settingsLangEn: 'English',
    settingsLangBg: 'Български',
    settingsAudioSection: 'Audio & Sound Effects',
    settingsAudioToggle: 'Tactile Turn Sound Effects',
    settingsAudioDesc: 'Realistic magnetic snap and mechanism click on every face rotation',
    settingsAudioTest: 'Test Sound',
    settingsAudioTestLabel: 'Play Click',
    settingsMotionSection: 'Rotation & Animation Speed',
    settingsMotionDesc: 'Controls how quickly 3D cube layers rotate during manual moves and algorithm execution',
    settingsSpeedSlow: 'Slow (0.08)',
    settingsSpeedNormal: 'Normal (0.22)',
    settingsSpeedFast: 'Fast (0.42)',
    settingsTestMoveBtn: 'Test Animation Turn',
    settingsViewSection: '3D View & Visualizations',
    settingsCycleArrowsDesc: 'Show 3D permutation cycle arcs on pieces when inspecting groups',
    settingsExplodedDesc: 'Separates cubies outward from the core to inspect the internal mechanism',
    settingsResetDefaults: 'Reset to Defaults',
    settingsResetSuccess: 'All settings have been restored to defaults',
    settingsCloseBtn: 'Close',

    // State Sharing
    shareBtn: 'Share',
    shareModalTitle: 'Share Cube State',
    shareModalDesc: 'Share your exact 3D cube configuration via link, scramble sequence, or social apps',
    shareDirectLink: 'Direct Web Link',
    shareCopyLink: 'Copy Link',
    shareLinkCopied: 'Copied to clipboard!',
    shareNativeBtn: 'Share via device apps...',
    shareScrambleTitle: 'Move Sequence / Scramble',
    shareCopyScramble: 'Copy Moves',
    shareFaceletsTitle: '54-Character Facelet Code',
    shareCopyFacelets: 'Copy Facelet Code',
    shareStatusSolved: 'Identity State (Solved)',
    shareStatusSolvable: 'Solvable Configuration (Valid Orbit)',
    shareStatusInvalid: 'Non-Standard Orbit (Tampered/Twisted Pieces)',
    shareLoadedNotification: 'Shared cube state successfully loaded!',
    shareViaWhatsApp: 'WhatsApp',
    shareViaTelegram: 'Telegram',
    shareViaX: 'X / Twitter',

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
    tryThisLabel: '🎯 Try this:',

    // Math Concept Callouts
    orbitCalloutTitle: 'What is an Orbit and how to experiment?',
    orbitCalloutDesc: 'The orbit Orb(x) is the set of all positions a piece can reach under allowed moves. In the 3D model, all orbit positions glow in neon cyan!',
    orbitCalloutStep1: 'Click any piece below or directly on the 3D cube.',
    orbitCalloutStep2: 'Switch subgroup (e.g. "Half-Turns only") to see the orbit shrink to just 4 pieces!',
    stabCalloutTitle: 'What is a Stabilizer and how to verify it?',
    stabCalloutDesc: 'The stabilizer Stab(x) contains only those moves that leave the chosen piece strictly fixed in its place. If a turn does not touch the piece, it belongs to its stabilizer!',
    stabCalloutStep1: 'Look at the candidate moves below: those with green checkmarks keep the piece motionless.',
    stabCalloutStep2: 'Click a green move (e.g. D or R) and observe the cube turn while the target piece stays fixed!',
    cycleCalloutTitle: 'How to read cycle notation (1 2 3)?',
    cycleCalloutDesc: 'Every cube turn is a permutation. A cycle (A → B → C) means piece A moves to B, B moves to C, and C returns to A. Pieces not shown inside parentheses remain untouched.',
    cycleCalloutStep1: 'Turn any face (e.g. R or U).',
    cycleCalloutStep2: 'Toggle "Vectors" top-right — curved arrows will appear on the 3D cube matching these exact cycles!',
    commutatorCalloutTitle: 'What is a commutator [A, B] and why is it speedcubing magic?',
    commutatorCalloutDesc: 'The commutator [A, B] = A B A⁻¹ B⁻¹ measures how two operations fail to commute. Because you apply A and B then undo both with their inverses, almost the entire cube cancels out except for a few intersecting pieces. This allows surgically cycling 3 pieces without scrambling the rest!',
    commutatorCalloutStep1: 'Select "Corner 3-cycle" from presets.',
    commutatorCalloutStep2: 'Click "Execute [A, B]" and observe how exactly 3 corners cycle while the rest of the cube remains intact!',
    orderCalloutTitle: 'What is element order and why does the cube solve itself?',
    orderCalloutDesc: 'In any finite group, repeating the exact same move sequence g enough times will inevitably return the cube to its exact initial state (g^n = e). The smallest such positive integer n is the element order ord(g).',
    orderCalloutStep1: 'Select "Sexy Move" (ord=6) and click "Auto Cycle" — at step g⁶ the cube returns to solved!',
    orderCalloutStep2: 'Try "M’ U" (ord=56) or "R U" (ord=105) to observe how simple moves generate surprisingly long cycles.',
    subgroupCalloutTitle: 'What is a Subgroup (H ≤ G) and why does it yield symmetries?',
    subgroupCalloutDesc: 'A subgroup is a closed subset of moves. Restricting yourself to specific generators (e.g. only 180° turns ⟨R², L², U², D², F², B²⟩) shrinks the state space dramatically from 4.3×10¹⁹ to a highly symmetric subgroup.',
    subgroupCalloutStep1: 'Click "Apply" (▶) on "Checkerboard" or "Cube-in-a-Cube" below to create elegant symmetric states.',
    subgroupCalloutStep2: 'Inspect the "Kociemba Subgroup" — the foundation of the 2-phase algorithm that solves any cube in ≤20 moves!',

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

    modalCloseBtn: "Got it, Let's Explore!",

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

    // Header, Canvas & Solver
    brandTitle: "Rubik's Cube Group Actions",
    solveBtn: 'Solve',
    paint3DBtn: '3D Paint',
    paint3DBrushPrefix: '3D Brush: ',
    paint3DInstruction: 'Click any 3D sticker to paint',
    closePaintBtn: 'Close 3D Paint',
    net2DTitle: '2D Unfolded Net (6 faces)',
    clickNetInstruction: 'Click any sticker on the net to inspect',

    // Global Solve Modal
    solveModalBadge: 'Layer-by-Layer Solution Guide',
    solveModalTitle: 'How to Solve Current Cube',
    solveModalSolvedTitle: 'Cube is already completely solved!',
    solveModalAlreadyDoneTitle: 'Congratulations! Cube is in identity state (e).',
    solveModalAlreadyDoneDesc: 'All corners and edges are placed and oriented. To test solving, scramble the cube or enter your physical cube!',
    solveModalScrambleBtn: '🎲 Scramble Cube',
    solveModalTotalMoves: 'total moves',
    solveModalStages: 'stages',
    solveModalExecutedMoves: 'Executed moves:',
    solveModalStagePrefix: 'Stage',
    solveModalStageOf: 'of 7',
    solveModalGoalPrefix: 'Goal:',
    solveModalAcademyLink: 'Tutorial',
    solveModalMovesForStage: 'Moves for this stage:',
    solveModalStageAlreadySolved: 'This stage is already solved on the current cube!',
    solveModalStepBack: 'Step Back',
    solveModalAutoPlay: 'Auto Play',
    solveModalPause: 'Pause',
    solveModalStepNext: 'Next Step',
    solveModalSpeed: 'Speed:',

    // Home Page
    homeBadge: 'Interactive Abstract Algebra in 3D',
    homeHeroTitle: "Where Group Theory Meets the World's Most Famous Puzzle",
    homeHeroDesc: "Explore permutations, orbits, stabilizers, commutators, and Cauchy's theorem through a real-time WebGL simulator.",
    homeStatSolvability: 'Orbit Solvability Factor',
    homeStatGodsNumber: "God's Number (HTM)",
    homeQuickActions: 'Quick Actions',
    homeQuickActionsDesc: 'Manipulate the persistent 3D cube on the left',
    homeExploreBtn: 'Explore Math Concepts',
    homeTutorialBtn: 'Tutorial Academy',
    homeFeaturesTitle: 'Four Specialized Modules',
    homeFeaturesDesc: 'A unified platform connecting group actions, orbit diagnostics, human solving steps, and physical cube reconstruction.',
    homeModMathTitle: 'Math Concepts & Subgroups',
    homeModMathFeat1: 'Group Actions:',
    homeModMathFeat1Desc: 'Action G × X → X on corners (8), edges (12), and stickers (54)',
    homeModMathFeat2: 'Orbit-Stabilizer Theorem:',
    homeModMathFeat2Desc: '|Orb(x)| · |Stab(x)| = |G|',
    homeModMathFeat3: 'Commutators & Conjugates:',
    homeModMathFeat3Desc: '[A, B] = A B A⁻¹ B⁻¹ for 3-cycles in alternating group A_n',
    homeModMathFeat4: 'Canonical Subgroups:',
    homeModMathFeat4Desc: '⟨R, U⟩, slice subgroup, and Thistlethwaite stages',
    homeModValidatorTitle: 'Orbit Validator & Invariants',
    homeModValidatorFeat1: 'Corner Twists:',
    homeModValidatorFeat1Desc: 'Σ v_i ≡ 0 (mod 3)',
    homeModValidatorFeat2: 'Edge Flips:',
    homeModValidatorFeat2Desc: 'Σ w_i ≡ 0 (mod 2)',
    homeModValidatorFeat3: 'Permutation Parity:',
    homeModValidatorFeat3Desc: 'sgn(σ) = sgn(τ)',
    homeModValidatorFeat4: '12 Coset Simulator:',
    homeModValidatorFeat4Desc: 'Tamper pieces to explore invalid cosets & repair',
    homeModValidatorBtn: 'Launch Orbit Validator',
    homeModTutorialTitle: 'Beginner Academy (LBL)',
    homeModTutorialFeat1: '7 Reduction Steps:',
    homeModTutorialFeat1Desc: 'White Cross → Layer 1 → F2L → OLL → PLL',
    homeModTutorialFeat2: 'Commutators & Triggers:',
    homeModTutorialFeat2Desc: 'Algebraic basis for each step: g = c [a, b] c⁻¹',
    homeModTutorialFeat3: 'Live Execution:',
    homeModTutorialFeat3Desc: 'Apply algorithms directly to the 3D cube with one click',
    homeModTutorialFeat4: 'Hints & Visuals:',
    homeModTutorialFeat4Desc: 'Visual guides and notations for every case',
    homeModTutorialBtn: 'Start Cube Tutorial',
    homeModCustomTitle: 'Physical Cube Input',
    homeModCustomFeat1: 'Interactive 2D & 3D Brush:',
    homeModCustomFeat1Desc: 'Paint facelets sticker by sticker with real colors',
    homeModCustomFeat2: 'Piece-by-Piece Form:',
    homeModCustomFeat2Desc: 'Inspect 8 corners & 12 edges with exact twists/flips',
    homeModCustomFeat3: 'Tampering Diagnostics:',
    homeModCustomFeat3Desc: 'Instant check if cube is trapped in an unsolvable coset',
    homeModCustomFeat4: 'Step-by-Step Solver:',
    homeModCustomFeat4Desc: 'Computes next steps to 100% solved state with 3D playback',
    homeModCustomBtn: 'Start Physical Input',

    // Orbit Validator Page
    valHeroBadge: '12 Cosets of G',
    valHeroTitle: 'Orbit Validator & Physical Invariants',
    valHeroDesc: 'Test whether any given cube state is legally reachable in G or trapped in an unreachable coset.',
    valPhysicalStates: 'Physical states:',
    valSolvableOrbit: 'Solvable orbit |G|:',
    valProbability: 'Probability:',
    valValidTitle: 'Valid Orbit: The cube belongs to G',
    valValidDesc: 'This cube is in the legal orbit and is 100% solvable through standard face rotations without disassembly.',
    valInvalidTitle: 'Invalid Orbit: Physically Unsolvable State',
    valInvalidDesc: 'At least one invariant is violated. The cube resides in one of the 11 unreachable cosets. It cannot be solved without physical disassembly!',
    valConserved: 'Conserved',
    valViolated: 'Violated',
    valCornerTwistTitle: '1. Corner Orientation Invariant',
    valCornerTwistDesc: 'Total corner twist sum must be 0 mod 3: Σ v_i ≡ 0 (mod 3).',
    valEdgeFlipTitle: '2. Edge Flip Invariant',
    valEdgeFlipDesc: 'Total edge flip sum must be 0 mod 2: Σ w_i ≡ 0 (mod 2).',
    valParityTitle: '3. Permutation Parity Invariant',
    valParityDesc: 'Corner and edge permutations must share the same sign: sgn(σ) = sgn(τ).',
    valTamperSimTitle: 'Physical Tampering Simulator (Cosets of G)',
    valTamperSimDesc: 'Simulate physical cubie manipulations to observe how invariants break.',
    valTwistCornerBtn: 'Twist 1 Corner (+120°)',
    valTwistCornerDesc: 'Breaks corner twist invariant: creates an unsolvable coset (ord 3).',
    valFlipEdgeBtn: 'Flip 1 Edge',
    valFlipEdgeDesc: 'Breaks edge flip invariant: creates an unsolvable coset (ord 2).',
    valSwapPiecesBtn: 'Swap 2 Pieces (Parity)',
    valSwapPiecesDesc: 'Swaps 2 corners: breaks permutation parity sgn(σ) ≠ sgn(τ).',
    valUnsolvableBannerTitle: 'Cube is currently unsolvable!',
    valUnsolvableBannerDesc: 'You can apply an algebraic repair back into the legal solvable orbit.',
    valRepairBtn: 'Repair to Solvable Orbit',

    // Custom Physical Cube Page
    customBadge: 'Physical State Input',
    customTitle: 'Physical Cube Custom State Input',
    customSubtitle: "Input colors from your real physical Rubik's cube sticker by sticker, or inspect piece by piece.",
    customNetModeBtn: '2D Net Painter',
    customPiecesModeBtn: 'Piece-by-Piece',
    customPaint3DOn: '3D Paint (On)',
    customPaint3DOff: 'Paint in 3D',
    customSuccessTitle: 'State applied successfully to the 3D cube!',
    customSuccessDesc: 'The 3D cube on the left now matches your physical cube. You can turn faces, run algorithms, or follow the tutorial.',
    customValidTitle: 'Valid & Solvable Cube (Belongs to G)',
    customValidPill: '100% Legally Solvable',
    customValidDesc: 'All 3 Rubik invariants are conserved: corner twist sum ≡ 0 (mod 3), edge flip sum ≡ 0 (mod 2), and permutation parity sgn(σ) = sgn(τ).',
    customApplyTo3DBtn: 'Apply to 3D Cube',
    customInspectValidatorBtn: 'Inspect in Validator',
    customSolveBtn: '🧩 Solve My Cube (Step-by-Step)',
    customHideSolveBtn: 'Hide Solver',
    customInvalidTitle: 'Physically Tampered / Unsolvable Coset',
    customInvalidPill: 'Unsolvable with standard moves',
    customInvalidDesc: 'All pieces exist, but the cube is trapped in one of the 11 unsolvable cosets. Invariants violated:',
    customCornerTwistViolated: 'Corner Twists:',
    customCornerTwistViolatedDesc: 'At least one corner was manually twisted.',
    customEdgeFlipViolated: 'Edge Flips:',
    customEdgeFlipViolatedDesc: 'At least one edge was manually flipped.',
    customParityViolated: 'Permutation Parity:',
    customParityViolatedDesc: 'An odd permutation occurred: exactly two pieces were swapped.',
    customColorCountsTitle: 'Sticker Color Distribution (Must be 9 per color)',
    customPresetsTitle: 'Quick Test Presets & Demonstrations',
    customPresetSolved: 'Solved Cube',
    customPresetScramble: 'Legal Scramble',
    customPresetTwist: 'Twisted Corner',
    customPresetFlip: 'Flipped Edge',
    customPresetSwap: 'Swapped Pieces',
    customPresetSuperflip: 'The Superflip',
    customNetPainterTitle: '2D Net Painter',
    customNetPainterSubtitle: 'Select a color from the palette, then click stickers on the net to paint them.',
    customClearBlankBtn: 'Clear to Blank',
    customResetSolvedBtn: 'Reset to Solved Colors',
    customPaletteLabel: 'Active Color Palette:',
    customPiecesTitle: 'Piece-by-Piece Verification',
    customPiecesSubtitle: 'Directly view and adjust the 8 corners and 12 edges with their twists and flips.',
    customCornersHeading: '8 Corner Pieces (X_C)',
    customEdgesHeading: '12 Edge Pieces (X_E)',
    customTwistBtn: 'Twist (+120°)',
    customFlipBtn: 'Flip Edge',
    customFooterReady: 'Ready to apply to 3D cube',
    customFooterUnsolvable: 'Unsolvable or incomplete state',
    customApplyMainBtn: 'Apply to 3D Simulator',
    customCameraModeBtn: 'Webcam Scanner',
    camTitle: 'Webcam Cube Scanner',
    camSubtitle: 'Hold each face of your physical cube inside the 3×3 target grid and capture all 6 faces.',
    camStartBtn: 'Start Camera',
    camStopBtn: 'Stop Camera',
    camCaptureBtn: 'Capture Face',
    camMirrorBtn: 'Mirror',
    camSwitchCameraBtn: 'Switch Camera',
    camDemoScanBtn: 'Simulate Scan (Demo)',
    camScannedFaces: 'Scanned Faces',
    camCurrentFaceLabel: 'Target Face:',
    camHoldInstructionF: 'Hold GREEN center facing camera, YELLOW on top (U)',
    camHoldInstructionR: 'Hold RED center facing camera, YELLOW on top (U)',
    camHoldInstructionB: 'Hold BLUE center facing camera, YELLOW on top (U)',
    camHoldInstructionL: 'Hold ORANGE center facing camera, YELLOW on top (U)',
    camHoldInstructionU: 'Hold YELLOW center facing camera, GREEN on bottom (towards you)',
    camHoldInstructionD: 'Hold WHITE center facing camera, GREEN on top (away from you)',
    camLivePreviewTitle: 'Detected 3×3 Face Preview',
    camLivePreviewHint: 'Click any sticker below to manually correct its color before or after capturing.',
    camCenterMatchOk: 'Center matches target face',
    camCenterMatchWarn: 'Center looks different — check lighting or orientation',
    camAllScannedTitle: 'All 6 faces scanned!',
    camAllScannedDesc: 'Review the 2D Net or click Solve My Cube above to see the step-by-step solution.',
    camViewInNetBtn: 'Review in 2D Net',
    camErrorPermission: 'Camera access was denied or no webcam was found. Check browser permissions or use Simulate Scan.',
    camIdlePrompt: 'Click "Start Camera" to scan your physical Rubik\'s Cube using your webcam',
    camCalibrateHint: 'Tip: Avoid strong glare on stickers. Tap any detected cell on the right to cycle its color.',
    camCalibrateBtn: 'Calibrate Color from Center',
    camResetCalibrationBtn: 'Reset Calibration',

    // Cube Tutorial Academy
    academyBadge: 'Beginner Academy',
    stepCounterStep: 'Step',
    stepCounterOf: 'of',
    tutorialNotationBtn: 'Notation',
    tutorialResetBtn: 'Reset',
    tutorialSolveBtn: 'Solve My Cube',
    tutorialHideSolveBtn: 'Hide Solver',
    tutorialAnalysisBadge: 'Current State Solution',
    tutorialNextStepsTitle: 'Next Steps to Complete Solution',
    tutorialAlreadySolved: 'The cube is already completely solved!',
    tutorialGoToStep: 'Go to step',
    tutorialMethodTag: 'LBL Method',
    tutorialSelectCase: 'Select your case / pattern:',
    tutorialRecognition: 'Recognition:',
    tutorialStepObjective: 'Step Objective',
    tutorialSetupCubeBtn: 'Position Cube for this Case',
    tutorialMathBasis: 'Abstract Algebra Basis',
    tutorialPrevBtn: 'Previous Step',
    tutorialNextBtn: 'Next Step',
    tutorialPracticeBtn: 'Try It Yourself',
    tutorialPracticeTitle: 'Interactive Move Pad:',
    tutorialPracticeDesc: 'Execute the moves using the interactive buttons below or follow the step-by-step player.',
    tutorialOrientationTitle: 'How to Hold the Cube:',
    tutorialMnemonicTitle: 'Easy Memory Trick:',
    tutorialPatternTitle: 'Target Pattern (Top View):',
    tutorialHintBtn: '💡 Hint',
    tutorialReloadCaseBtn: '🔄 Reload Case',
  },
  bg: {
    appTitle: 'Групови действия върху Кубчето на Рубик',
    appSubtitle: '3D Абстрактна Алгебра',
    groupOrder: 'Ред на групата:',
    solvedBadge: 'Решено състояние / Идентитет (e)',
    languageName: 'English',
    pageHome: 'Начало',
    pageMath: 'Математика',
    pageValidator: 'Валидатор',
    pageTutorial: 'Урок',
    pageCustomCube: 'Моето кубче',

    // Sound & Shortcuts
    soundToggleMute: 'Заглуши звука',
    soundToggleUnmute: 'Пусни звука',
    soundOn: 'Звук ВКЛ',
    soundOff: 'Звук ИЗКЛ',
    shortcutsModalTitle: 'Клавиатурни Комбинации',
    shortcutsModalDesc: 'Управлявайте 3D кубчето директно от вашата клавиатура',
    shortcutsFaces: 'Завъртания на стени (по часовника)',
    shortcutsPrimes: 'Обратни завъртания (Shift + клавиш)',
    shortcutsSlices: 'Слойни завъртания (M, E, S)',
    shortcutsUndo: 'Отмени последния ход (Z или Ctrl+Z)',
    shortcutsReset: 'Ресет към идентитет (Esc)',
    shortcutsHelpBtn: 'Клавиши',

    // Settings Menu
    settingsTitle: 'Настройки',
    settingsSubtitle: 'Персонализиране на бързина на въртене, език на интерфейса, звукови ефекти и 3D визуализация',
    settingsBtn: 'Настройки',
    settingsLanguageSection: 'Език на интерфейса',
    settingsLangEn: 'English',
    settingsLangBg: 'Български',
    settingsAudioSection: 'Звук и аудио ефекти',
    settingsAudioToggle: 'Тактилни звукови ефекти при въртене',
    settingsAudioDesc: 'Реалистично магнитно щракване на механизма при всяко завъртане на слой',
    settingsAudioTest: 'Тествай звука',
    settingsAudioTestLabel: 'Чуй щракване',
    settingsMotionSection: 'Бързина на въртене и анимация',
    settingsMotionDesc: 'Регулира колко бързо се завъртат слоевете на 3D кубчето при ръчни ходове и алгоритми',
    settingsSpeedSlow: 'Бавно (0.08)',
    settingsSpeedNormal: 'Нормално (0.22)',
    settingsSpeedFast: 'Бързо (0.42)',
    settingsTestMoveBtn: 'Тест завъртане',
    settingsViewSection: '3D Изглед и Визуализации',
    settingsCycleArrowsDesc: 'Показва 3D стрелки на пермутационните цикли върху елементите при изследване',
    settingsExplodedDesc: 'Разглобява елементите навън от ядрото за инспекция на вътрешния механизъм',
    settingsResetDefaults: 'Възстанови по подразбиране',
    settingsResetSuccess: 'Всички настройки бяха възстановени по подразбиране',
    settingsCloseBtn: 'Затвори',

    // State Sharing
    shareBtn: 'Сподели',
    shareModalTitle: 'Споделяне на текущото състояние',
    shareModalDesc: 'Споделете точната конфигурация на 3D кубчето чрез уникален линк, последователност от ходове или в приложения',
    shareDirectLink: 'Директен линк за зареждане',
    shareCopyLink: 'Копирай връзката',
    shareLinkCopied: 'Копирано в клипборда!',
    shareNativeBtn: 'Сподели чрез мобилно приложение...',
    shareScrambleTitle: 'Последователност от ходове / Разбъркване',
    shareCopyScramble: 'Копирай ходовете',
    shareFaceletsTitle: '54-символен код на стикерите (Facelets)',
    shareCopyFacelets: 'Копирай кода',
    shareStatusSolved: 'Идентитет (Наредено кубче)',
    shareStatusSolvable: 'Валидна орбита (Може да се нареди)',
    shareStatusInvalid: 'Нестандартна орбита (Разменени/завъртени елементи)',
    shareLoadedNotification: 'Споделеното състояние на кубчето бе заредено успешно!',
    shareViaWhatsApp: 'WhatsApp',
    shareViaTelegram: 'Telegram',
    shareViaX: 'X / Twitter',

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
    tryThisLabel: '🎯 Опитайте следното:',

    // Math Concept Callouts
    orbitCalloutTitle: 'Какво е орбита и как да експериментирате тук?',
    orbitCalloutDesc: 'Орбитата Orb(x) е съвкупността от абсолютно всички места по кубчето, до които избраното парче може да стигне чрез позволените ходове. В 3D модела тези позиции светят в неоново синьо!',
    orbitCalloutStep1: 'Кликнете върху парче долу или направо върху 3D кубчето.',
    orbitCalloutStep2: 'Сменете подгрупата (напр. "Само 180° ходове") и вижте как орбитата веднага се свива само до 4 позиции!',
    stabCalloutTitle: 'Какво е стабилизатор и как да го проверите?',
    stabCalloutDesc: 'Стабилизаторът Stab(x) включва само онези ходове, които оставят избраното парче абсолютно неподвижно на мястото му. Ако завъртането не засяга избраното парче (или прави 360° на неговия слой), то е в неговия стабилизатор!',
    stabCalloutStep1: 'Погледнете списъка с ходове долу: тези със зелена отметка не мърдат парчето.',
    stabCalloutStep2: 'Кликнете върху зелен ход (напр. D или R за горно парче) и вижте как кубчето се върти, но избраното парче остава неподвижно!',
    cycleCalloutTitle: 'Как да разчитате цикличния запис (1 2 3)?',
    cycleCalloutDesc: 'Всеки ход на кубчето е пермутация. Записът (UFL → UBR → UBR) означава, че парчето от първата позиция отива във втората, от втората в третата, а от последната се връща в първата (затворен цикъл). Парчета, които не участват в скобите, остават неподвижни.',
    cycleCalloutStep1: 'Завъртете произволна страна (напр. R или U).',
    cycleCalloutStep2: 'Включете бутона "Вектори" горе вдясно — по 3D модела ще се появят дъги със стрелки, описващи точно тези цикли!',
    commutatorCalloutTitle: 'Какво е комутатор [A, B] и защо е магическото оръжие на спийдкюбърите?',
    commutatorCalloutDesc: 'Комутаторът [A, B] = A B A⁻¹ B⁻¹ измерва колко два хода "не комутират". Тъй като първо правите A и B, а после ги отменяте наобратно с техните инверсии, почти всичко по кубчето се възстановява, освен малкото парчета, където действията са се пресекли. Това позволява хирургично разменяне на точно 3 парчета!',
    commutatorCalloutStep1: 'Изберете "3-цикъл на ъгли" от готовите шаблони.',
    commutatorCalloutStep2: 'Кликнете "Изпълни [A, B]" и вижте как точно 3 ъгъла сменят местата си, а останалата част от кубчето остава непокътната!',
    orderCalloutTitle: 'Какво е порядък на елемент и защо кубчето се връща обратно?',
    orderCalloutDesc: 'Във всяка крайна група, ако повтаряте една и съща последователност от ходове g достатъчно пъти (g * g * ... * g), кубчето неизбежно се връща в първоначалното си състояние (g^n = e). Най-малкото такова положително число n е порядъкът ord(g).',
    orderCalloutStep1: 'Изберете "Суперфлип" (ord=2) и кликнете "Автоматичен цикъл" — на стъпка g⁶ кубчето се самонарежда отново!',
    orderCalloutStep2: 'Опитайте "M’ U" (ord=56) или "R U" (ord=105), за да видите как прости движения пораждат дълги орбити.',
    subgroupCalloutTitle: 'Какво е подгрупа (H ≤ G) и защо поражда симетрии?',
    subgroupCalloutDesc: 'Подгрупата е затворено подмножество от ходове. Ограничавайки се само до определени генератори (например само 180° ходове ⟨R², L², U², D², F², B²⟩), пространството от възможни състояния намалява драстично от 4.3×10¹⁹ до малка група с висока симетрия.',
    subgroupCalloutStep1: 'Кликнете "Приложи" (▶) на "Шахматна дъска" или "Cube-in-a-Cube" долу, за да генерирате красиви симетрични конфигурации.',
    subgroupCalloutStep2: 'Разгледайте "Подгрупа на Косиемба" — това е основата на 2-фазовия алгоритъм, с който решаващите ботове решават всяко кубче за под 20 хода!',

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

    modalCloseBtn: 'Разбрах, да започваме!',

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

    // Header, Canvas & Solver
    brandTitle: 'Кубче на Рубик',
    solveBtn: 'Реши',
    paint3DBtn: '3D Четка',
    paint3DBrushPrefix: '3D Четка: ',
    paint3DInstruction: 'Кликнете върху стикер от 3D куба',
    closePaintBtn: 'Затвори 3D оцветяване',
    net2DTitle: '2D Разгъвка на всички 6 стени',
    clickNetInstruction: 'Кликнете върху стикер от разгъвката за избор',

    // Global Solve Modal
    solveModalBadge: 'Стъпки до нареждане (LBL Метод)',
    solveModalTitle: 'Как да наредите текущото кубче',
    solveModalSolvedTitle: 'Кубчето вече е напълно наредено!',
    solveModalAlreadyDoneTitle: 'Поздравления! Кубчето е в начално състояние (e).',
    solveModalAlreadyDoneDesc: 'Всички 8 върха и 12 ръба са на съответните си места с правилна ориентация. За да изпробвате решаването, разбъркайте кубчето с бутона „Разбъркай“ или въведете ваше физическо кубче!',
    solveModalScrambleBtn: '🎲 Разбъркай кубчето',
    solveModalTotalMoves: 'хода общо',
    solveModalStages: 'етапа',
    solveModalExecutedMoves: 'Изпълнени ходове:',
    solveModalStagePrefix: 'Етап',
    solveModalStageOf: 'от 7',
    solveModalGoalPrefix: 'Цел:',
    solveModalAcademyLink: 'Урок в Академията',
    solveModalMovesForStage: 'Ходове за този етап:',
    solveModalStageAlreadySolved: 'Този етап вече е нареден на текущото кубче!',
    solveModalStepBack: 'Предишен ход',
    solveModalAutoPlay: 'Пусни Автоматично',
    solveModalPause: 'Пауза',
    solveModalStepNext: 'Следващ ход',
    solveModalSpeed: 'Скорост:',

    // Home Page
    homeBadge: 'Интерактивна Абстрактна Алгебра в 3D',
    homeHeroTitle: 'Където Теорията на Групите среща най-известния пъзел в света',
    homeHeroDesc: 'Изследвайте пермутации, орбити, стабилизатори, комутатори и теоремата на Коши чрез симулатор в реално време.',
    homeStatSolvability: 'Фактор на разрешимост',
    homeStatGodsNumber: 'Число на Бог (HTM)',
    homeQuickActions: 'Бързи действия',
    homeQuickActionsDesc: 'Манипулирайте директно 3D куба вляво',
    homeExploreBtn: 'Към Математическия Лаб',
    homeTutorialBtn: 'Академия за уроци',
    homeFeaturesTitle: 'Четири специализирани модула',
    homeFeaturesDesc: 'Обединена платформа, свързваща групови действия, диагностика на орбити, уроци за нареждане и физическо въвеждане.',
    homeModMathTitle: 'Математически Концепции',
    homeModMathFeat1: 'Групови действия:',
    homeModMathFeat1Desc: 'Действие G × X → X върху върхове (8), ръбове (12) и стикери (54)',
    homeModMathFeat2: 'Теорема за орбитата и стабилизатора:',
    homeModMathFeat2Desc: '|Orb(x)| · |Stab(x)| = |G|',
    homeModMathFeat3: 'Комутатори и конюгати:',
    homeModMathFeat3Desc: '[A, B] = A B A⁻¹ B⁻¹ за 3-цикли в алтерниращата група A_n',
    homeModMathFeat4: 'Канонични подгрупи:',
    homeModMathFeat4Desc: '⟨R, U⟩, слойна подгрупа и етапи на Тикълтуейт',
    homeModValidatorTitle: 'Валидатор на Орбитата',
    homeModValidatorFeat1: 'Ъглова ориентация:',
    homeModValidatorFeat1Desc: 'Σ v_i ≡ 0 (mod 3)',
    homeModValidatorFeat2: 'Ръбова ориентация:',
    homeModValidatorFeat2Desc: 'Σ w_i ≡ 0 (mod 2)',
    homeModValidatorFeat3: 'Четност на пермутациите:',
    homeModValidatorFeat3Desc: 'sgn(σ) = sgn(τ)',
    homeModValidatorFeat4: 'Симулатор на неразрешимост:',
    homeModValidatorFeat4Desc: 'Тествайте единични завъртания и възстановете валидна орбита',
    homeModValidatorBtn: 'Към Валидатора',
    homeModTutorialTitle: 'Интерактивен Урок',
    homeModTutorialFeat1: '7 Етапа на редукция:',
    homeModTutorialFeat1Desc: 'Бял кръст → Първи пласт → Среден пласт → OLL → PLL',
    homeModTutorialFeat2: 'Комутатори и тригери:',
    homeModTutorialFeat2Desc: 'Алгебрична обосновка на всяка стъпка: [A, B] = A B A⁻¹ B⁻¹',
    homeModTutorialFeat3: 'Интерактивно изпълнение:',
    homeModTutorialFeat3Desc: 'Бутон за директно прилагане на алгоритмите върху 3D куба',
    homeModTutorialFeat4: 'Интерактивни съвети:',
    homeModTutorialFeat4Desc: 'Визуални насоки и съвети за всяка позиция',
    homeModTutorialBtn: 'Към Интерактивния Урок',
    homeModCustomTitle: 'Въвеждане на Физическо Кубче',
    homeModCustomFeat1: 'Интерактивна 2D и 3D четка:',
    homeModCustomFeat1Desc: 'Нанесете цветовете от реалното си кубче стикер по стикер',
    homeModCustomFeat2: 'Инспектор парче по парче:',
    homeModCustomFeat2Desc: 'Преглед на 8-те ъгъла и 12-те ръба с техните завъртания',
    homeModCustomFeat3: 'Проверка за разглобяване:',
    homeModCustomFeat3Desc: 'Моментален тест дали кубчето е сглобено в разрешим клас',
    homeModCustomFeat4: 'Пошагов решител:',
    homeModCustomFeat4Desc: 'Изчислява следващите стъпки до наредено състояние с 3D плейър',
    homeModCustomBtn: 'Към Въвеждането',

    // Orbit Validator Page
    valHeroBadge: '12 Косета на G',
    valHeroTitle: 'Валидатор на Орбитата и Физически Инварианти',
    valHeroDesc: 'Проверете дали дадено състояние е легално достижимо в групата G или е разглобено в нерешим клас.',
    valPhysicalStates: 'Физически състояния:',
    valSolvableOrbit: 'Решима орбита |G|:',
    valProbability: 'Вероятност:',
    valValidTitle: 'Валидна Орбита: Кубчето принадлежи към G',
    valValidDesc: 'Това кубче се намира в легалната орбита и е 100% решимо чрез стандартни завъртания без разглобяване.',
    valInvalidTitle: 'Невалидна Орбита: Физически Нерешимо Състояние',
    valInvalidDesc: 'Поне един инвариант е нарушен. Кубчето е в един от 11-те недостижими косета и не може да бъде наредено без разглобяване!',
    valConserved: 'Спазен',
    valViolated: 'Нарушен',
    valCornerTwistTitle: '1. Ъглова Ориентация',
    valCornerTwistDesc: 'Сумата от завъртанията на всички 8 върха трябва да е кратна на 3: Σ v_i ≡ 0 (mod 3).',
    valEdgeFlipTitle: '2. Ръбова Ориентация',
    valEdgeFlipDesc: 'Сумата от обръщанията на всички 12 ръба трябва да е четно число: Σ w_i ≡ 0 (mod 2).',
    valParityTitle: '3. Четност на Пермутациите',
    valParityDesc: 'Пермутациите на върховете и на ръбовете трябва да имат еднакъв паритет (четност): sgn(σ) = sgn(τ).',
    valTamperSimTitle: 'Симулатор на Физическо Разглобяване (Косети на G)',
    valTamperSimDesc: 'Симулирайте физическо вадене и завъртане на парчета, за да видите как се нарушават инвариантите.',
    valTwistCornerBtn: 'Завърти 1 ъгъл (+120°)',
    valTwistCornerDesc: 'Нарушава ъгловата ориентация: създава нерешим клас (ред 3).',
    valFlipEdgeBtn: 'Обърни 1 ръб (Flip)',
    valFlipEdgeDesc: 'Нарушава ръбовата ориентация: създава нерешим клас (ред 2).',
    valSwapPiecesBtn: 'Размени 2 ъгъла (Паритет)',
    valSwapPiecesDesc: 'Разменя 2 върха: нарушава паритета sgn(σ) ≠ sgn(τ).',
    valUnsolvableBannerTitle: 'Кубчето в момента е неразрешимо!',
    valUnsolvableBannerDesc: 'Можете да приложите математическо възстановяване до най-близката валидна орбита.',
    valRepairBtn: 'Възстанови до Валидна Орбита',

    // Custom Physical Cube Page
    customBadge: 'Физическо Въвеждане',
    customTitle: 'Въвеждане на Физическо Кубче',
    customSubtitle: 'Въведете цветовете от вашето реално кубче на Рубик стикер по стикер или проверете състоянието му парче по парче.',
    customNetModeBtn: '2D Разгъвка с Палитра',
    customPiecesModeBtn: 'По Парчета (Върхове & Ръбове)',
    customPaint3DOn: '3D Четка (Вкл)',
    customPaint3DOff: 'Оцвети в 3D',
    customSuccessTitle: 'Състоянието беше приложено успешно към 3D куба!',
    customSuccessDesc: 'Сега кубчето вляво отразява вашето физическо кубче. Можете да го въртите, да пускате ходове или да използвате уроците за решаване.',
    customValidTitle: 'Напълно Валидно и Решимо Кубче (Принадлежи към G)',
    customValidPill: 'Решимо в 100% от ходовете',
    customValidDesc: 'Всички 3 инварианта на Рубик са спазени: сумата на завъртанията на върховете е 0 (mod 3), сумата на обръщанията на ръбовете е 0 (mod 2), а четността на върховете съвпада с четността на ръбовете.',
    customApplyTo3DBtn: 'Зареди в 3D Куба',
    customInspectValidatorBtn: 'Провери във Валидатора',
    customSolveBtn: '🧩 Реши моето кубче (Стъпка по стъпка)',
    customHideSolveBtn: 'Скрий Решението',
    customInvalidTitle: 'Физически Разглобено / Нерешимо Състояние (Невалиден Coset)',
    customInvalidPill: 'Нерешимо само с въртене',
    customInvalidDesc: 'Кубчето е сглобено правилно по парчета, но е в един от 11-те нерешими класа на неразложимост. Открити нарушения:',
    customCornerTwistViolated: 'Ъглова ориентация:',
    customCornerTwistViolatedDesc: 'Има поне един физически завъртян ъгъл на ръка.',
    customEdgeFlipViolated: 'Ръбова ориентация:',
    customEdgeFlipViolatedDesc: 'Има поне един физически обърнат ръб на ръка.',
    customParityViolated: 'Четност на пермутациите:',
    customParityViolatedDesc: 'Получена е нечетна пермутация: точно две парчета са били разменени.',
    customColorCountsTitle: 'Брой Стикери по Цвят (трябва да са точно по 9)',
    customPresetsTitle: 'Бързи Шаблони за Тест и Демонстрация',
    customPresetSolved: 'Наредено кубче',
    customPresetScramble: 'Валидно разбъркване',
    customPresetTwist: 'Завъртян ъгъл (+120°)',
    customPresetFlip: 'Обърнат ръб',
    customPresetSwap: 'Разменени върхове',
    customPresetSuperflip: 'Суперфлип',
    customNetPainterTitle: '2D Разгъвка с Палитра',
    customNetPainterSubtitle: 'Изберете цвят от палитрата, след което кликайте върху стикерите на разгъвката за оцветяване.',
    customClearBlankBtn: 'Изчисти за попълване',
    customResetSolvedBtn: 'Върни наредени цветове',
    customPaletteLabel: 'Активна палитра:',
    customPiecesTitle: 'Проверка Парче по Парче',
    customPiecesSubtitle: 'Директен преглед и корекция на 8-те върха и 12-те ръба с техните завъртания и обръщания.',
    customCornersHeading: '8-те Върхови Парчета (X_C)',
    customEdgesHeading: '12-те Ръбови Парчета (X_E)',
    customTwistBtn: 'Завърти (+120°)',
    customFlipBtn: 'Обърни ръба (Flip)',
    customFooterReady: 'Готово за прилагане към 3D симулатора',
    customFooterUnsolvable: 'Невалидно/Нерешимо състояние',
    customApplyMainBtn: 'Приложи към 3D Симулатора',
    customCameraModeBtn: 'Сканер с Камера',
    camTitle: 'Сканиране на Кубчето с Камера',
    camSubtitle: 'Позиционирайте всяка стена на физическото си кубче в 3×3 решетката и заснемете всички 6 страни.',
    camStartBtn: 'Включи Камерата',
    camStopBtn: 'Спри Камерата',
    camCaptureBtn: 'Заснеми Стената',
    camMirrorBtn: 'Огледално',
    camSwitchCameraBtn: 'Смени Камерата',
    camDemoScanBtn: 'Симулирай Сканиране (Демо)',
    camScannedFaces: 'Сканирани Стени',
    camCurrentFaceLabel: 'Текуща Стена:',
    camHoldInstructionF: 'Дръжте ЗЕЛЕНИЯ център към камерата, ЖЪЛТОТО отгоре (U)',
    camHoldInstructionR: 'Дръжте ЧЕРВЕНИЯ център към камерата, ЖЪЛТОТО отгоре (U)',
    camHoldInstructionB: 'Дръжте СИНИЯ център към камерата, ЖЪЛТОТО отгоре (U)',
    camHoldInstructionL: 'Дръжте ОРАНЖЕВИЯ център към камерата, ЖЪЛТОТО отгоре (U)',
    camHoldInstructionU: 'Дръжте ЖЪЛТИЯ център към камерата, ЗЕЛЕНОТО отдолу (към вас)',
    camHoldInstructionD: 'Дръжте БЕЛИЯ център към камерата, ЗЕЛЕНОТО отгоре (напред)',
    camLivePreviewTitle: 'Разпознати Цветове (3×3 Преглед)',
    camLivePreviewHint: 'Кликнете върху който и да е стикер долу, за да коригирате цвета му ръчно при нужда.',
    camCenterMatchOk: 'Центърът съвпада с търсената стена',
    camCenterMatchWarn: 'Центърът изглежда различен — проверете светлината или ориентацията',
    camAllScannedTitle: 'Всички 6 стени са сканирани!',
    camAllScannedDesc: 'Прегледайте 2D разгъвката или натиснете „Реши моето кубче“ горе за стъпките до нареждане.',
    camViewInNetBtn: 'Преглед в 2D Разгъвката',
    camErrorPermission: 'Достъпът до камерата бе отказан или не бе открита камера. Проверете разрешенията на браузъра или използвайте Демо режима.',
    camIdlePrompt: 'Натиснете „Включи Камерата“, за да сканирате реалното си кубче на Рубик',
    camCalibrateHint: 'Съвет: Избягвайте силен отблясък върху стикерите. Кликнете всяка клетка вдясно за корекция на цвета.',
    camCalibrateBtn: 'Калибрирай цвета от центъра',
    camResetCalibrationBtn: 'Нулирай калибрацията',

    // Cube Tutorial Academy
    academyBadge: 'Академия за начинаещи',
    stepCounterStep: 'Стъпка',
    stepCounterOf: 'от',
    tutorialNotationBtn: 'Нотация',
    tutorialResetBtn: 'Ресет',
    tutorialSolveBtn: 'Реши моето кубче',
    tutorialHideSolveBtn: 'Скрий Решителя',
    tutorialAnalysisBadge: 'Анализ на твоето кубче',
    tutorialNextStepsTitle: 'Следващи стъпки до пълно нареждане',
    tutorialAlreadySolved: 'Кубчето вече е напълно наредено в начално състояние!',
    tutorialGoToStep: 'Към урок',
    tutorialMethodTag: 'LBL Метод',
    tutorialSelectCase: 'Изберете вашия случай (форма на кубчето):',
    tutorialRecognition: 'Как да разпознаете:',
    tutorialStepObjective: 'Цел на стъпката',
    tutorialSetupCubeBtn: 'Зареди позицията на куба',
    tutorialMathBasis: 'Алгебрична обосновка',
    tutorialPrevBtn: 'Предишна стъпка',
    tutorialNextBtn: 'Следваща стъпка',
    tutorialPracticeBtn: 'Опитай сам',
    tutorialPracticeTitle: 'Интерактивен контролер:',
    tutorialPracticeDesc: 'Изпълнете ходовете с бутоните по-долу или следвайте пошаговия плейър.',
    tutorialOrientationTitle: 'Как да държите кубчето:',
    tutorialMnemonicTitle: 'Лесно запомняне на формулата:',
    tutorialPatternTitle: 'Търсен модел (Изглед отгоре):',
    tutorialHintBtn: '💡 Подсказка',
    tutorialReloadCaseBtn: '🔄 Зареди отначало',
  },
};
