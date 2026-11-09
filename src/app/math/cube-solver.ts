import { CubeState, StandardMove, CornerPiece, EdgePiece } from '../types/cube';
import { RubikGroupAlgebra } from './group-algebra';

export interface SolverStage {
  stageNumber: number; // 1 to 7
  stageId: string;
  nameBg: string;
  nameEn: string;
  goalBg: string;
  goalEn: string;
  moves: StandardMove[];
  algoString: string;
  stateAfter: CubeState;
  explanationBg: string;
  explanationEn: string;
}

export interface SolveResult {
  isAlreadySolved: boolean;
  isValid: boolean;
  errorBg?: string;
  errorEn?: string;
  totalMoves: number;
  stages: SolverStage[];
  allMoves: StandardMove[];
  allMovesString: string;
}

/**
 * High-performance, human-friendly Layer-by-Layer (LBL) Rubik's Cube Solver.
 * Solves any solvable physical or scrambled CubeState in 7 standard human phases.
 */
export class CubeSolver {
  private static readonly MOVES_12: StandardMove[] = [
    'U', "U'", 'U2',
    'D', "D'", 'D2',
    'F', "F'", 'F2',
    'B', "B'", 'B2',
    'L', "L'", 'L2',
    'R', "R'", 'R2',
  ];

  /**
   * Solve a given CubeState and return detailed step-by-step human phases.
   */
  static solve(initialState: CubeState): SolveResult {
    // 1. Validate state orbit
    const validation = RubikGroupAlgebra.validateSolutionOrbit(initialState);
    if (!validation.isValidOrbit) {
      const errsBg: string[] = [];
      const errsEn: string[] = [];
      if (!validation.isCornerTwistValid) {
        errsBg.push(`Усукан връх (сума: ${validation.cornerTwistSum} mod 3 ≠ 0)`);
        errsEn.push(`Corner twist sum invalid (${validation.cornerTwistSum} mod 3 ≠ 0)`);
      }
      if (!validation.isEdgeFlipValid) {
        errsBg.push(`Обърнат ръб (сума: ${validation.edgeFlipSum} mod 2 ≠ 0)`);
        errsEn.push(`Edge flip sum invalid (${validation.edgeFlipSum} mod 2 ≠ 0)`);
      }
      if (!validation.isParityValid) {
        errsBg.push(`Грешна четност (върхове: ${validation.cornerParity}, ръбове: ${validation.edgeParity})`);
        errsEn.push(`Parity mismatch (corners: ${validation.cornerParity}, edges: ${validation.edgeParity})`);
      }

      return {
        isAlreadySolved: false,
        isValid: false,
        errorBg: `Кубчето е в невалидна орбита (${errsBg.join(', ')}). Проверете въведените стикери в раздела за персонализирано кубче.`,
        errorEn: `Cube state is in an invalid orbit (${errsEn.join(', ')}). Please verify your sticker inputs.`,
        totalMoves: 0,
        stages: [],
        allMoves: [],
        allMovesString: '',
      };
    }

    if (RubikGroupAlgebra.isIdentity(initialState)) {
      return {
        isAlreadySolved: true,
        isValid: true,
        totalMoves: 0,
        stages: [],
        allMoves: [],
        allMovesString: '',
      };
    }

    let state = RubikGroupAlgebra.cloneState(initialState);
    const stages: SolverStage[] = [];
    const allMoves: StandardMove[] = [];

    // Stage 1: White Cross (Edges 8, 9, 10, 11 on D face)
    const stage1 = this.solveStage1WhiteCross(state);
    if (stage1.moves.length > 0) {
      state = stage1.stateAfter;
      stages.push(stage1);
      allMoves.push(...stage1.moves);
    }

    // Stage 2: First Layer White Corners (Corners 4, 5, 6, 7 on D face)
    const stage2 = this.solveStage2WhiteCorners(state);
    if (stage2.moves.length > 0) {
      state = stage2.stateAfter;
      stages.push(stage2);
      allMoves.push(...stage2.moves);
    }

    // Stage 3: Second Layer Middle Edges (Edges 4, 5, 6, 7 in equatorial layer)
    const stage3 = this.solveStage3SecondLayer(state);
    if (stage3.moves.length > 0) {
      state = stage3.stateAfter;
      stages.push(stage3);
      allMoves.push(...stage3.moves);
    }

    // Stage 4: Top Yellow Cross (Edges on U face oriented)
    const stage4 = this.solveStage4YellowCross(state);
    if (stage4.moves.length > 0) {
      state = stage4.stateAfter;
      stages.push(stage4);
      allMoves.push(...stage4.moves);
    }

    // Stage 5: Orient Yellow Corners (All corners on U face have yellow pointing Up)
    const stage5 = this.solveStage5OrientCorners(state);
    if (stage5.moves.length > 0) {
      state = stage5.stateAfter;
      stages.push(stage5);
      allMoves.push(...stage5.moves);
    }

    // Stage 6: Permute Yellow Corners (A-Perm / Headlights)
    const stage6 = this.solveStage6PermuteCorners(state);
    if (stage6.moves.length > 0) {
      state = stage6.stateAfter;
      stages.push(stage6);
      allMoves.push(...stage6.moves);
    }

    // Stage 7: Permute Last Layer Edges (U-Perm / Final solve)
    const stage7 = this.solveStage7PermuteEdges(state);
    if (stage7.moves.length > 0) {
      state = stage7.stateAfter;
      stages.push(stage7);
      allMoves.push(...stage7.moves);
    }

    // Optimize move sequence (cancel redundant adjacent moves like U U -> U2, R R' -> '')
    const optimizedMoves = this.compressMoves(allMoves);

    return {
      isAlreadySolved: false,
      isValid: true,
      totalMoves: optimizedMoves.length,
      stages,
      allMoves: optimizedMoves,
      allMovesString: optimizedMoves.join(' '),
    };
  }

  // =========================================================
  // STAGE 1: WHITE CROSS (Edges 8: DF, 9: DR, 10: DB, 11: DL)
  // =========================================================
  private static solveStage1WhiteCross(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const targetEdges = [8, 9, 10, 11]; // DF, DR, DB, DL

    for (let i = 0; i < targetEdges.length; i++) {
      const edgeId = targetEdges[i];
      const solvedSoFar = targetEdges.slice(0, i);

      // Check if already in home slot with orientation 0
      const edgePiece = state.edges.find((e) => e.id === edgeId)!;
      if (edgePiece.pos === edgeId && edgePiece.orientation === 0) {
        continue;
      }

      // Find BFS path to place this edge while preserving previously placed edges
      const path = this.findBfsForCross(state, edgeId, solvedSoFar);
      for (const m of path) {
        state = RubikGroupAlgebra.applyMove(state, m);
        moves.push(m);
      }
    }

    return {
      stageNumber: 1,
      stageId: 'white_cross',
      nameBg: 'Стъпка 1: Бял Кръст',
      nameEn: 'Step 1: The White Cross',
      goalBg: 'Подреждане на 4-те бели ръба на долната страна (D) със съвпадащи странични центрове.',
      goalEn: 'Arrange the 4 white edges on bottom face (D) with matching lateral centers.',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Поставя 4-те бели ръба около белия център отдолу, запазвайки правилната ориентация.',
      explanationEn: 'Positions all 4 white edges around the bottom white center with correct orientations.',
    };
  }

  private static findBfsForCross(
    startState: CubeState,
    targetEdgeId: number,
    preservedEdges: number[]
  ): StandardMove[] {
    const queue: { state: CubeState; path: StandardMove[] }[] = [{ state: startState, path: [] }];
    const maxDepth = 5;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.path.length > maxDepth) break;

      // Check goal condition: targetEdge is at home slot with orientation 0, and all preserved are intact
      const edge = current.state.edges.find((e) => e.id === targetEdgeId)!;
      if (edge.pos === targetEdgeId && edge.orientation === 0) {
        const allPreservedIntact = preservedEdges.every((id) => {
          const p = current.state.edges.find((e) => e.id === id)!;
          return p.pos === id && p.orientation === 0;
        });

        if (allPreservedIntact) {
          return current.path;
        }
      }

      if (current.path.length < maxDepth) {
        const lastFace = current.path.length > 0 ? current.path[current.path.length - 1][0] : null;

        for (const m of this.MOVES_12) {
          const face = m[0];
          if (face === lastFace) continue; // Avoid redundant face turns

          const nextState = RubikGroupAlgebra.applyMove(current.state, m);
          queue.push({ state: nextState, path: [...current.path, m] });
        }
      }
    }

    return [];
  }

  // =========================================================
  // STAGE 2: FIRST LAYER CORNERS (Corners 4: DFL, 5: DFR, 6: DBR, 7: DBL)
  // =========================================================
  private static solveStage2WhiteCorners(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const targetCorners = [
      { id: 4, slotPos: 4, topSlot: 0, trigger: "L' U' L U" },   // DFL
      { id: 5, slotPos: 5, topSlot: 1, trigger: "R U R' U'" },       // DFR
      { id: 6, slotPos: 6, topSlot: 2, trigger: "R' U' R U" },     // DBR
      { id: 7, slotPos: 7, topSlot: 3, trigger: "L U L' U'" },       // DBL
    ];

    for (const tc of targetCorners) {
      let corner = state.corners.find((c) => c.id === tc.id)!;
      if (corner.pos === tc.slotPos && corner.orientation === 0) continue;

      // If corner is stuck in bottom layer (pos 4..7), pop it up to top layer
      if (corner.pos >= 4) {
        const popSlot = targetCorners.find((x) => x.slotPos === corner.pos);
        if (popSlot) {
          const popMoves = RubikGroupAlgebra.parseAlgorithm(popSlot.trigger);
          for (const m of popMoves) {
            state = RubikGroupAlgebra.applyMove(state, m);
            moves.push(m);
          }
        }
      }

      // Now corner is in top layer (pos 0..3). Rotate U until it is directly above tc.topSlot
      corner = state.corners.find((c) => c.id === tc.id)!;
      while (corner.pos !== tc.topSlot) {
        state = RubikGroupAlgebra.applyMove(state, 'U');
        moves.push('U');
        corner = state.corners.find((c) => c.id === tc.id)!;
      }

      // Apply trigger 1 to 5 times until corner is in place with orientation 0
      let guard = 0;
      const triggerMoves = RubikGroupAlgebra.parseAlgorithm(tc.trigger);
      while ((corner.pos !== tc.slotPos || corner.orientation !== 0) && guard < 6) {
        for (const m of triggerMoves) {
          state = RubikGroupAlgebra.applyMove(state, m);
          moves.push(m);
        }
        corner = state.corners.find((c) => c.id === tc.id)!;
        guard++;
      }
    }

    return {
      stageNumber: 2,
      stageId: 'first_layer_corners',
      nameBg: 'Стъпка 2: Бели Върхове (Първи Слой)',
      nameEn: 'Step 2: First Layer White Corners',
      goalBg: 'Поставяне на 4-те бели върха на техните позиции, завършвайки целия първи слой.',
      goalEn: 'Slot all 4 white corners into place, solving the entire first layer.',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Използва десни/леви тригери [R, U] за вмъкване на белите върхове в основата.',
      explanationEn: 'Applies triggers [R, U] to slot corners into the bottom layer.',
    };
  }

  // =========================================================
  // STAGE 3: SECOND LAYER (Middle Equatorial Edges: 4: FL, 5: FR, 6: BR, 7: BL)
  // =========================================================
  private static solveStage3SecondLayer(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const middleEdges = [
      { id: 4, name: 'FL', homePos: 4 },
      { id: 5, name: 'FR', homePos: 5 },
      { id: 6, name: 'BR', homePos: 6 },
      { id: 7, name: 'BL', homePos: 7 },
    ];

    // Right and Left insertion algorithms from Front:
    // Right insertion into FR: U R U' R' U' F' U F
    // Left insertion into FL: U' L' U L U F U' F'
    const slotEjections: Record<number, string> = {
      5: "U R U' R' U' F' U F", // FR
      4: "U' L' U L U F U' F'", // FL
      6: "U B U' B' U' R' U R", // BR
      7: "U' B' U B U L U' L'", // BL
    };

    for (let pass = 0; pass < 16; pass++) {
      let allDone = middleEdges.every((me) => {
        const e = state.edges.find((x) => x.id === me.id)!;
        return e.pos === me.homePos && e.orientation === 0;
      });
      if (allDone) break;

      // Check if any middle edge is in top layer (pos 0..3)
      const inTop = middleEdges.find((me) => {
        const e = state.edges.find((x) => x.id === me.id)!;
        return e.pos <= 3;
      });

      let inserted = false;
      if (inTop) {
        const insertion = this.findMiddleEdgeInsertion(state, inTop.id, middleEdges);
        if (insertion) {
          for (const m of insertion) {
            state = RubikGroupAlgebra.applyMove(state, m);
            moves.push(m);
          }
          inserted = true;
        }
      }

      if (!inserted) {
        // A middle edge is stuck in the wrong slot or inverted. Eject the specific wrong slot!
        const wrongSlot = [4, 5, 6, 7].find((pos) => {
          const e = state.edges.find((x) => x.pos === pos)!;
          return e.id !== pos || e.orientation !== 0;
        });

        const ejectAlg = wrongSlot ? slotEjections[wrongSlot] : slotEjections[5];
        const ejectMoves = RubikGroupAlgebra.parseAlgorithm(ejectAlg);
        for (const m of ejectMoves) {
          state = RubikGroupAlgebra.applyMove(state, m);
          moves.push(m);
        }
      }
    }

    return {
      stageNumber: 3,
      stageId: 'second_layer_edges',
      nameBg: 'Стъпка 3: Втори Слой (Средни Ръбове)',
      nameEn: 'Step 3: Second Layer (Middle Edges)',
      goalBg: 'Вмъкване на 4-те средни ръба (FR, FL, BR, BL) за пълно нареждане на двата долни слоя (F2L).',
      goalEn: 'Slot all 4 equatorial middle edges to complete the first two layers (F2L).',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Вмъква нежълтите ръбове от горния слой в средните слотове чрез конюгирани комутатори.',
      explanationEn: 'Slots non-yellow edges from top layer into equatorial slots.',
    };
  }

  private static findMiddleEdgeInsertion(
    state: CubeState,
    edgeId: number,
    middleEdges: { id: number; name: string; homePos: number }[]
  ): StandardMove[] | null {
    // Try U rotations (0 to 3) followed by right/left insertions from any of 4 sides
    const candidates = [
      "U R U' R' U' F' U F", // FR
      "U' L' U L U F U' F'", // FL
      "U B U' B' U' R' U R", // BR
      "U' B' U B U L U' L'", // BL
      "U F U' F' U' L' U L", // FL from left
      "U' F' U F U R U' R'", // FR from right
      "U L U' L' U' B' U B", // BL from left
      "U' L' U L U B U' B'", // BL from back
      "U R U' R' U' B' U B", // BR from back
      "U' R' U R U B U' B'", // BR from right
    ];

    const uTurns: StandardMove[][] = [[], ['U'], ['U2'], ["U'"]];

    // Find which middle edges are ALREADY solved in state
    const alreadySolved = middleEdges.filter((me) => {
      const e = state.edges.find((x) => x.id === me.id)!;
      return e.pos === me.homePos && e.orientation === 0;
    });

    for (const ut of uTurns) {
      let testState = state;
      for (const m of ut) testState = RubikGroupAlgebra.applyMove(testState, m);

      for (const cand of candidates) {
        const candMoves = RubikGroupAlgebra.parseAlgorithm(cand);
        let candState = testState;
        for (const cm of candMoves) candState = RubikGroupAlgebra.applyMove(candState, cm);

        const edge = candState.edges.find((e) => e.id === edgeId)!;
        if (edge.pos === edgeId && edge.orientation === 0) {
          // Verify it didn't disrupt first layer (both corners 4..7 and edges 8..11)
          const corners1Ok = candState.corners.slice(4).every((c) => c.pos === c.id && c.orientation === 0);
          const edges1Ok = candState.edges.slice(8).every((e) => e.pos === e.id && e.orientation === 0);

          // Verify it didn't disrupt previously solved middle edges
          const middlePreserved = alreadySolved.every((me) => {
            const e = candState.edges.find((x) => x.id === me.id)!;
            return e.pos === me.homePos && e.orientation === 0;
          });

          if (corners1Ok && edges1Ok && middlePreserved) {
            return [...ut, ...candMoves];
          }
        }
      }
    }

    return null;
  }

  // =========================================================
  // STAGE 4: TOP YELLOW CROSS (Edges on U face oriented)
  // =========================================================
  private static solveStage4YellowCross(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const algo = RubikGroupAlgebra.parseAlgorithm("F R U R' U' F'");

    for (let guard = 0; guard < 4; guard++) {
      // Edges on U are at pos 0 (UF), 1 (UR), 2 (UB), 3 (UL)
      // Check which ones have orientation === 0 (yellow up)
      const uEdges = [0, 1, 2, 3].map((pos) => {
        const edge = state.edges.find((e) => e.pos === pos)!;
        return { pos, oriented: edge.orientation === 0 };
      });

      const orientedCount = uEdges.filter((e) => e.oriented).length;
      if (orientedCount === 4) break; // Cross solved!

      if (orientedCount === 0) {
        // Dot: execute once to create L-shape
        for (const m of algo) {
          state = RubikGroupAlgebra.applyMove(state, m);
          moves.push(m);
        }
      } else if (orientedCount === 2) {
        // Either line or L-shape
        const oPositions = uEdges.filter((e) => e.oriented).map((e) => e.pos);
        const isOpposite = (oPositions[0] === 0 && oPositions[1] === 2) || (oPositions[0] === 1 && oPositions[1] === 3);

        if (isOpposite) {
          // Line: align horizontally (at 1 and 3: UR and UL)
          if (oPositions.includes(0)) {
            state = RubikGroupAlgebra.applyMove(state, 'U');
            moves.push('U');
          }
          for (const m of algo) {
            state = RubikGroupAlgebra.applyMove(state, m);
            moves.push(m);
          }
        } else {
          // L-shape: align at 9 and 12 o'clock (UB: pos 2 and UL: pos 3)
          while (!uEdges.find((e) => e.pos === 2)!.oriented || !uEdges.find((e) => e.pos === 3)!.oriented) {
            state = RubikGroupAlgebra.applyMove(state, 'U');
            moves.push('U');
            uEdges.forEach((ue) => {
              const edge = state.edges.find((e) => e.pos === ue.pos)!;
              ue.oriented = edge.orientation === 0;
            });
          }
          for (const m of algo) {
            state = RubikGroupAlgebra.applyMove(state, m);
            moves.push(m);
          }
        }
      }
    }

    return {
      stageNumber: 4,
      stageId: 'yellow_cross',
      nameBg: 'Стъпка 4: Горен Жълт Кръст',
      nameEn: 'Step 4: Top Yellow Cross',
      goalBg: 'Ориентиране на 4-те жълти ръба с жълто сочещо нагоре (Точка → L-форма → Линия → Кръст).',
      goalEn: 'Orient the 4 yellow edges so yellow faces upward (Dot → L-shape → Line → Cross).',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Конюгира десния тригер чрез F R U R\' U\' F\', обръщайки точно 2 ръба без разваляне на F2L.',
      explanationEn: 'Applies F · [R, U] · F⁻¹ to orient top edges without disturbing solved layers.',
    };
  }

  // =========================================================
  // STAGE 5: ORIENT YELLOW CORNERS (Sune: R U R' U R U2 R')
  // =========================================================
  private static solveStage5OrientCorners(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const sune = RubikGroupAlgebra.parseAlgorithm("R U R' U R U2 R'");
    const uTurns: (StandardMove | null)[] = [null, 'U', 'U2', "U'"];

    const isAllOriented = (st: CubeState): boolean => {
      return [0, 1, 2, 3].every((pos) => {
        const c = st.corners.find((x) => x.pos === pos)!;
        return c.orientation === 0;
      });
    };

    if (isAllOriented(state)) {
      return {
        stageNumber: 5,
        stageId: 'orient_corners_sune',
        nameBg: 'Стъпка 5: Ориентиране на Жълтите Върхове (Sune)',
        nameEn: 'Step 5: Orient Yellow Corners (Sune)',
        goalBg: 'Завъртане на 4-те горни върха, така че цялата горна страна да стане плътно жълта.',
        goalEn: 'Twist the top 4 corners until the entire top face is solid yellow.',
        moves: [],
        algoString: '',
        stateAfter: state,
        explanationBg: 'Всички жълти върхове са вече правилно ориентирани с жълто нагоре!',
        explanationEn: 'All yellow corners are already oriented upward!',
      };
    }

    // Try 1, 2, or 3 Sunes with AUF in between
    let solutionMoves: StandardMove[] | null = null;

    // Depth 1: ut1 + Sune
    for (const ut1 of uTurns) {
      if (solutionMoves) break;
      let s = state;
      if (ut1) s = RubikGroupAlgebra.applyMove(s, ut1);
      for (const m of sune) s = RubikGroupAlgebra.applyMove(s, m);
      if (isAllOriented(s)) {
        solutionMoves = ut1 ? [ut1, ...sune] : [...sune];
        break;
      }
    }

    // Depth 2: ut1 + Sune + ut2 + Sune
    if (!solutionMoves) {
      for (const ut1 of uTurns) {
        if (solutionMoves) break;
        let s1 = state;
        if (ut1) s1 = RubikGroupAlgebra.applyMove(s1, ut1);
        for (const m of sune) s1 = RubikGroupAlgebra.applyMove(s1, m);

        for (const ut2 of uTurns) {
          let s2 = s1;
          if (ut2) s2 = RubikGroupAlgebra.applyMove(s2, ut2);
          for (const m of sune) s2 = RubikGroupAlgebra.applyMove(s2, m);
          if (isAllOriented(s2)) {
            solutionMoves = [];
            if (ut1) solutionMoves.push(ut1);
            solutionMoves.push(...sune);
            if (ut2) solutionMoves.push(ut2);
            solutionMoves.push(...sune);
            break;
          }
        }
      }
    }

    // Depth 3: ut1 + Sune + ut2 + Sune + ut3 + Sune
    if (!solutionMoves) {
      for (const ut1 of uTurns) {
        if (solutionMoves) break;
        let s1 = state;
        if (ut1) s1 = RubikGroupAlgebra.applyMove(s1, ut1);
        for (const m of sune) s1 = RubikGroupAlgebra.applyMove(s1, m);

        for (const ut2 of uTurns) {
          if (solutionMoves) break;
          let s2 = s1;
          if (ut2) s2 = RubikGroupAlgebra.applyMove(s2, ut2);
          for (const m of sune) s2 = RubikGroupAlgebra.applyMove(s2, m);

          for (const ut3 of uTurns) {
            let s3 = s2;
            if (ut3) s3 = RubikGroupAlgebra.applyMove(s3, ut3);
            for (const m of sune) s3 = RubikGroupAlgebra.applyMove(s3, m);
            if (isAllOriented(s3)) {
              solutionMoves = [];
              if (ut1) solutionMoves.push(ut1);
              solutionMoves.push(...sune);
              if (ut2) solutionMoves.push(ut2);
              solutionMoves.push(...sune);
              if (ut3) solutionMoves.push(ut3);
              solutionMoves.push(...sune);
              break;
            }
          }
        }
      }
    }

    if (solutionMoves) {
      for (const m of solutionMoves) {
        state = RubikGroupAlgebra.applyMove(state, m);
        moves.push(m);
      }
    }

    return {
      stageNumber: 5,
      stageId: 'orient_corners_sune',
      nameBg: 'Стъпка 5: Ориентиране на Жълтите Върхове (Sune)',
      nameEn: 'Step 5: Orient Yellow Corners (Sune)',
      goalBg: 'Завъртане на 4-те горни върха, така че цялата горна страна да стане плътно жълта.',
      goalEn: 'Twist the top 4 corners until the entire top face is solid yellow.',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Алгоритъмът Sune (ред 3) завърта три върха с (+1, +1, +1), спазвайки инварианта за усукване.',
      explanationEn: 'Applies Sune transformation to orient all yellow corners up.',
    };
  }

  // =========================================================
  // STAGE 6: PERMUTE LAST LAYER CORNERS (T-Perm / Headlights)
  // =========================================================
  private static solveStage6PermuteCorners(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const tPerm = RubikGroupAlgebra.parseAlgorithm("R U R' U' R' F R2 U' R' U' R U R' F'");
    const uTurns: (StandardMove | null)[] = [null, 'U', 'U2', "U'"];

    // Check if corners are already solved or can be solved by a U rotation
    const tryFindCornerAlignment = (st: CubeState): StandardMove | null | 'already_aligned' => {
      for (const ut of uTurns) {
        let testSt = st;
        if (ut) testSt = RubikGroupAlgebra.applyMove(testSt, ut);
        const cornersOk = [0, 1, 2, 3].every((id) => {
          const c = testSt.corners.find((x) => x.id === id)!;
          return c.pos === id && c.orientation === 0;
        });
        if (cornersOk) {
          return ut ?? 'already_aligned';
        }
      }
      return null;
    };

    const initialAlign = tryFindCornerAlignment(state);
    if (initialAlign === 'already_aligned') {
      // Do nothing, corners are already 100% placed and oriented!
    } else if (initialAlign !== null) {
      state = RubikGroupAlgebra.applyMove(state, initialAlign);
      moves.push(initialAlign);
    } else {
      // Try 1 T-Perm with AUF
      let solved = false;
      for (const ut1 of uTurns) {
        if (solved) break;
        let s1 = state;
        if (ut1) s1 = RubikGroupAlgebra.applyMove(s1, ut1);
        for (const m of tPerm) s1 = RubikGroupAlgebra.applyMove(s1, m);

        const align = tryFindCornerAlignment(s1);
        if (align !== null) {
          if (ut1) {
            state = RubikGroupAlgebra.applyMove(state, ut1);
            moves.push(ut1);
          }
          for (const m of tPerm) {
            state = RubikGroupAlgebra.applyMove(state, m);
            moves.push(m);
          }
          if (align !== 'already_aligned') {
            state = RubikGroupAlgebra.applyMove(state, align);
            moves.push(align);
          }
          solved = true;
          break;
        }
      }

      // If diagonal corner swap (requires 2 T-perms)
      if (!solved) {
        for (const ut1 of uTurns) {
          if (solved) break;
          let s1 = state;
          if (ut1) s1 = RubikGroupAlgebra.applyMove(s1, ut1);
          for (const m of tPerm) s1 = RubikGroupAlgebra.applyMove(s1, m);

          for (const ut2 of uTurns) {
            let s2 = s1;
            if (ut2) s2 = RubikGroupAlgebra.applyMove(s2, ut2);
            for (const m of tPerm) s2 = RubikGroupAlgebra.applyMove(s2, m);

            const align = tryFindCornerAlignment(s2);
            if (align !== null) {
              if (ut1) {
                state = RubikGroupAlgebra.applyMove(state, ut1);
                moves.push(ut1);
              }
              for (const m of tPerm) {
                state = RubikGroupAlgebra.applyMove(state, m);
                moves.push(m);
              }
              if (ut2) {
                state = RubikGroupAlgebra.applyMove(state, ut2);
                moves.push(ut2);
              }
              for (const m of tPerm) {
                state = RubikGroupAlgebra.applyMove(state, m);
                moves.push(m);
              }
              if (align !== 'already_aligned') {
                state = RubikGroupAlgebra.applyMove(state, align);
                moves.push(align);
              }
              solved = true;
              break;
            }
          }
        }
      }
    }

    return {
      stageNumber: 6,
      stageId: 'permute_corners',
      nameBg: 'Стъпка 6: Пермутация на Върховете (Фарове)',
      nameEn: 'Step 6: Permute Corners (Headlights)',
      goalBg: 'Разполагане на всички жълти върхове на съответните им ъглови позиции.',
      goalEn: 'Position all corners in their correct slots relative to each other.',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Разменя върховете чрез T-пермутация, запазвайки долните два слоя непокътнати.',
      explanationEn: 'Permutes corners preserving the first two layers.',
    };
  }

  // =========================================================
  // STAGE 7: PERMUTE LAST LAYER EDGES (U-Perm / Final Solve!)
  // =========================================================
  private static solveStage7PermuteEdges(initialState: CubeState): SolverStage {
    let state = RubikGroupAlgebra.cloneState(initialState);
    const moves: StandardMove[] = [];
    const uPermCW = RubikGroupAlgebra.parseAlgorithm("R U' R U R U R U' R' U' R2");
    const uPermCCW = RubikGroupAlgebra.parseAlgorithm("R2 U R U R' U' R' U' R' U R'");
    const algos = [uPermCW, uPermCCW];
    const uTurns: (StandardMove | null)[] = [null, 'U', 'U2', "U'"];

    if (RubikGroupAlgebra.isIdentity(state)) {
      return {
        stageNumber: 7,
        stageId: 'permute_edges_solved',
        nameBg: 'Стъпка 7: Финално Нареждане (U-Perm)',
        nameEn: 'Step 7: Final Solve (U-Perm)',
        goalBg: 'Циклиране на последните 3 ръба за 100% наредено кубче на Рубик!',
        goalEn: 'Cycle the final edges to 100% solve the Rubik\'s Cube!',
        moves: [],
        algoString: '',
        stateAfter: state,
        explanationBg: 'Кубчето вече е напълно наредено!',
        explanationEn: 'Cube is already completely solved!',
      };
    }

    // Try single U turn first
    for (const ut of uTurns) {
      let st = state;
      if (ut) st = RubikGroupAlgebra.applyMove(st, ut);
      if (RubikGroupAlgebra.isIdentity(st)) {
        if (ut) {
          state = RubikGroupAlgebra.applyMove(state, ut);
          moves.push(ut);
        }
        break;
      }
    }

    // If not yet solved, try 1 U-perm with AUF before/after
    if (!RubikGroupAlgebra.isIdentity(state)) {
      let solved = false;
      for (const ut1 of uTurns) {
        if (solved) break;
        for (const algo of algos) {
          if (solved) break;
          for (const ut2 of uTurns) {
            let st = state;
            if (ut1) st = RubikGroupAlgebra.applyMove(st, ut1);
            for (const m of algo) st = RubikGroupAlgebra.applyMove(st, m);
            if (ut2) st = RubikGroupAlgebra.applyMove(st, ut2);

            if (RubikGroupAlgebra.isIdentity(st)) {
              if (ut1) {
                state = RubikGroupAlgebra.applyMove(state, ut1);
                moves.push(ut1);
              }
              for (const m of algo) {
                state = RubikGroupAlgebra.applyMove(state, m);
                moves.push(m);
              }
              if (ut2) {
                state = RubikGroupAlgebra.applyMove(state, ut2);
                moves.push(ut2);
              }
              solved = true;
              break;
            }
          }
        }
      }

      // If H-perm or Z-perm (requires 2 U-perms)
      if (!solved) {
        // Execute U-perm CW once to create a solved bar
        for (const m of uPermCW) {
          state = RubikGroupAlgebra.applyMove(state, m);
          moves.push(m);
        }

        for (const ut1 of uTurns) {
          if (solved) break;
          for (const algo of algos) {
            if (solved) break;
            for (const ut2 of uTurns) {
              let st = state;
              if (ut1) st = RubikGroupAlgebra.applyMove(st, ut1);
              for (const m of algo) st = RubikGroupAlgebra.applyMove(st, m);
              if (ut2) st = RubikGroupAlgebra.applyMove(st, ut2);

              if (RubikGroupAlgebra.isIdentity(st)) {
                if (ut1) {
                  state = RubikGroupAlgebra.applyMove(state, ut1);
                  moves.push(ut1);
                }
                for (const m of algo) {
                  state = RubikGroupAlgebra.applyMove(state, m);
                  moves.push(m);
                }
                if (ut2) {
                  state = RubikGroupAlgebra.applyMove(state, ut2);
                  moves.push(ut2);
                }
                solved = true;
                break;
              }
            }
          }
        }
      }
    }

    return {
      stageNumber: 7,
      stageId: 'permute_edges_solved',
      nameBg: 'Стъпка 7: Финално Нареждане (U-Perm)',
      nameEn: 'Step 7: Final Solve (U-Perm)',
      goalBg: 'Циклиране на последните 3 ръба за 100% наредено кубче на Рубик!',
      goalEn: 'Cycle the final edges to 100% solve the Rubik\'s Cube!',
      moves: this.compressMoves(moves),
      algoString: this.compressMoves(moves).join(' '),
      stateAfter: state,
      explanationBg: 'Чист 3-цикъл на ръбове, връщащ кубчето към идентитета e.',
      explanationEn: 'Pure 3-cycle of edges returning the cube to solved state.',
    };
  }

  /**
   * Compress and simplify adjacent moves on the same face.
   * e.g. U U -> U2, R R' -> (empty), F F2 -> F', etc.
   */
  static compressMoves(moves: StandardMove[]): StandardMove[] {
    if (moves.length === 0) return [];
    const result: StandardMove[] = [];

    const getQuarterTurns = (m: StandardMove): { face: string; turns: number } => {
      const face = m[0];
      if (m.endsWith('2')) return { face, turns: 2 };
      if (m.endsWith("'")) return { face, turns: 3 };
      return { face, turns: 1 };
    };

    const makeMove = (face: string, turns: number): StandardMove | null => {
      const mod = turns % 4;
      if (mod === 0) return null;
      if (mod === 1) return face as StandardMove;
      if (mod === 2) return `${face}2` as StandardMove;
      return `${face}'` as StandardMove;
    };

    for (const m of moves) {
      if (result.length === 0) {
        result.push(m);
        continue;
      }

      const prev = result[result.length - 1];
      const pInfo = getQuarterTurns(prev);
      const cInfo = getQuarterTurns(m);

      if (pInfo.face === cInfo.face) {
        result.pop();
        const combined = makeMove(pInfo.face, pInfo.turns + cInfo.turns);
        if (combined) {
          result.push(combined);
        }
      } else {
        result.push(m);
      }
    }

    return result;
  }
}
