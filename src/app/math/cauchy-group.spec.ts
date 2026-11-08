import { describe, it, expect } from 'vitest';
import { RubikGroupAlgebra, FACE_COLORS } from './group-algebra';
import { CubeState } from '../types/cube';

describe("Group Theory: Rubik's Cube & Cauchy's Theorem Suite", () => {
  const initial = RubikGroupAlgebra.createIdentityState();

  // =========================================================================
  // 1. CAUCHY'S THEOREM ON THE RIGHT TRIGGER / COMMUTATOR FRAGMENT [R, U]
  // =========================================================================
  describe("Cauchy's Theorem on g = [R, U] = R U R' U'", () => {
    const sexyMove = "R U R' U'";

    it("verifies ord(R U R' U') = 6 (6 repetitions return to identity)", () => {
      let state = RubikGroupAlgebra.cloneState(initial);

      // Verify that for k = 1..5, state is NOT identity
      for (let k = 1; k <= 5; k++) {
        state = RubikGroupAlgebra.applyAlgorithm(state, sexyMove);
        expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);
      }

      // 6th repetition returns to identity e in G
      state = RubikGroupAlgebra.applyAlgorithm(state, sexyMove);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);

      const computedOrder = RubikGroupAlgebra.computeElementOrder(sexyMove);
      expect(computedOrder).toBe(6);
    });

    it("proves Cauchy's Theorem: cyclic subgroup <[R, U]> of order 6 has element of prime order 2", () => {
      // Cauchy's Theorem statement:
      // Since prime p = 2 divides |<g>| = 6, there exists an element of order 2.
      // Candidate: h_2 = g^(6/2) = g^3 = (R U R' U')^3.
      const h2Algorithm = RubikGroupAlgebra.repeatAlgorithm(sexyMove, 3);

      let state = RubikGroupAlgebra.applyAlgorithm(initial, h2Algorithm);
      // 1. h_2 is not identity
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      // 2. (h_2)^2 = g^6 = e
      state = RubikGroupAlgebra.applyAlgorithm(state, h2Algorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);

      const h2Order = RubikGroupAlgebra.computeElementOrder(h2Algorithm);
      expect(h2Order).toBe(2);
    });

    it("proves Cauchy's Theorem: cyclic subgroup <[R, U]> of order 6 has element of prime order 3", () => {
      // Cauchy's Theorem statement:
      // Since prime p = 3 divides |<g>| = 6, there exists an element of order 3.
      // Candidate: h_3 = g^(6/3) = g^2 = (R U R' U')^2.
      const h3Algorithm = RubikGroupAlgebra.repeatAlgorithm(sexyMove, 2);

      let state = RubikGroupAlgebra.applyAlgorithm(initial, h3Algorithm);
      // 1. (h_3)^1 is not identity
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      // 2. (h_3)^2 is not identity
      state = RubikGroupAlgebra.applyAlgorithm(state, h3Algorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      // 3. (h_3)^3 = g^6 = e
      state = RubikGroupAlgebra.applyAlgorithm(state, h3Algorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);

      const h3Order = RubikGroupAlgebra.computeElementOrder(h3Algorithm);
      expect(h3Order).toBe(3);
    });

    it('proves commutator parity sgn([R, U]) = +1 (even permutation)', () => {
      const stateAfter = RubikGroupAlgebra.applyAlgorithm(initial, sexyMove);
      const analysis = RubikGroupAlgebra.analyzeTransformation(initial, stateAfter, sexyMove);

      // Every commutator [A, B] = A B A^-1 B^-1 is an even permutation:
      // sgn([A, B]) = sgn(A) * sgn(B) * sgn(A)^-1 * sgn(B)^-1 = +1
      expect(analysis.parity).toBe('even');
    });

    it('automated Cauchy verification helper returns exact witness elements', () => {
      const witness = RubikGroupAlgebra.verifyCauchyTheorem(sexyMove);
      expect(witness.order).toBe(6);
      expect(witness.primeDivisors).toEqual([2, 3]);

      const sub2 = witness.subgroups.find((s) => s.prime === 2);
      expect(sub2?.witnessOrder).toBe(2);
      expect(sub2?.isSubgroupGenerated).toBe(true);

      const sub3 = witness.subgroups.find((s) => s.prime === 3);
      expect(sub3?.witnessOrder).toBe(3);
      expect(sub3?.isSubgroupGenerated).toBe(true);
    });
  });

  // =========================================================================
  // 2. CAUCHY'S THEOREM FOR THE FULL RUBIK GROUP G
  // |G| = 2^27 * 3^14 * 5^3 * 7^2 * 11
  // =========================================================================
  describe("Cauchy's Theorem for the Rubik's Group G", () => {
    it('confirms the order |G| and prime factors {2, 3, 5, 7, 11}', () => {
      expect(RubikGroupAlgebra.PRIME_DIVISORS).toEqual([2, 3, 5, 7, 11]);

      // Check divisibility of |G| by 2, 3, 5, 7, 11
      const order = RubikGroupAlgebra.GROUP_ORDER_BIGINT;
      for (const p of RubikGroupAlgebra.PRIME_DIVISORS) {
        expect(order % BigInt(p)).toBe(0n);
      }
    });

    it('witnesses element of order 2 (p = 2)', () => {
      // By Cauchy's Theorem, an element of order 2 exists (e.g. U2 or Checkerboard)
      const witness = RubikGroupAlgebra.getCauchyWitnessForPrime(2);
      const order = RubikGroupAlgebra.computeElementOrder(witness.generatorAlgorithm);
      expect(order).toBe(2);

      let state = RubikGroupAlgebra.applyAlgorithm(initial, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);
    });

    it('witnesses element of order 3 (p = 3)', () => {
      // Niklas commutator [R, U'] is a pure 3-cycle of corners
      const witness = RubikGroupAlgebra.getCauchyWitnessForPrime(3);
      const order = RubikGroupAlgebra.computeElementOrder(witness.generatorAlgorithm);
      expect(order).toBe(3);

      let state = RubikGroupAlgebra.applyAlgorithm(initial, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);

      state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);
    });

    it('witnesses element of order 5 (p = 5)', () => {
      // Since ord(RU) = 105 = 3 * 5 * 7, (RU)^21 has order 105/21 = 5
      const witness = RubikGroupAlgebra.getCauchyWitnessForPrime(5);
      const order = RubikGroupAlgebra.computeElementOrder(witness.generatorAlgorithm);
      expect(order).toBe(5);

      // Verify (g_5)^5 = e and (g_5)^k != e for k < 5
      let state = initial;
      for (let k = 1; k < 5; k++) {
        state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
        expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);
      }
      state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);
    });

    it('witnesses element of order 7 (p = 7)', () => {
      // Since ord(RU) = 105 = 3 * 5 * 7, (RU)^15 has order 105/15 = 7
      const witness = RubikGroupAlgebra.getCauchyWitnessForPrime(7);
      const order = RubikGroupAlgebra.computeElementOrder(witness.generatorAlgorithm);
      expect(order).toBe(7);

      let state = initial;
      for (let k = 1; k < 7; k++) {
        state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
        expect(RubikGroupAlgebra.isIdentity(state)).toBe(false);
      }
      state = RubikGroupAlgebra.applyAlgorithm(state, witness.generatorAlgorithm);
      expect(RubikGroupAlgebra.isIdentity(state)).toBe(true);
    });
  });

  // =========================================================================
  // 3. GROUP ACTION, ORBIT-STABILIZER THEOREM & INVARIANTS
  // =========================================================================
  describe('Group Actions & Orbit-Stabilizer Theorem', () => {
    it('verifies corner orbit has size 8 under full generator set', () => {
      const orbit = RubikGroupAlgebra.computeOrbit('corner', 0, ['U', 'D', 'L', 'R', 'F', 'B']);
      expect(orbit.orbitPositions.length).toBe(8);
      expect(orbit.orbitNames.length).toBe(8);
    });

    it('verifies edge orbit has size 12 under full generator set', () => {
      const orbit = RubikGroupAlgebra.computeOrbit('edge', 0, ['U', 'D', 'L', 'R', 'F', 'B']);
      expect(orbit.orbitPositions.length).toBe(12);
      expect(orbit.orbitNames.length).toBe(12);
    });

    it('verifies slice subgroup <M, E, S> fixes all 8 corners (corner stabilizer)', () => {
      let state = initial;
      const sliceMoves = ["M", "E", "S", "M'", "E'", "S'"];

      for (const m of sliceMoves) {
        state = RubikGroupAlgebra.applyMove(state, m);
        // All 8 corners must remain at their initial position and orientation!
        for (let i = 0; i < 8; i++) {
          expect(state.corners[i].pos).toBe(i);
          expect(state.corners[i].orientation).toBe(0);
        }
      }
    });

    it('proves conjugation preserves element order: ord(A B A^-1) = ord(B)', () => {
      const B = "R U R' U'"; // order 6
      const setupA = "F";
      const conjugate = RubikGroupAlgebra.makeConjugate(setupA, B); // F (R U R' U') F'

      const ordB = RubikGroupAlgebra.computeElementOrder(B);
      const ordConj = RubikGroupAlgebra.computeElementOrder(conjugate);

      expect(ordB).toBe(6);
      expect(ordConj).toBe(6);
    });
  });

  // =========================================================================
  // 4. SOLUTION ORBIT & THE 12 COSETS (SOLVABILITY INVARIANTS)
  // =========================================================================
  describe('Solution Orbit & The 12 Cosets (Solvability Invariants)', () => {
    it('validates identity state is in the solvable group G (coset 0)', () => {
      const res = RubikGroupAlgebra.validateSolutionOrbit(initial);
      expect(res.isValidOrbit).toBe(true);
      expect(res.cosetIndex).toBe(0);
      expect(res.isCornerTwistValid).toBe(true);
      expect(res.isEdgeFlipValid).toBe(true);
      expect(res.isParityValid).toBe(true);
    });

    it('detects illegal corner twist: sum twist != 0 (mod 3)', () => {
      const twisted = RubikGroupAlgebra.simulateCornerTwist(initial, 0, 1);
      const res = RubikGroupAlgebra.validateSolutionOrbit(twisted);

      expect(res.isValidOrbit).toBe(false);
      expect(res.isCornerTwistValid).toBe(false);
      expect(res.cornerTwistSum).toBe(1);

      // Repair restores valid orbit
      const repaired = RubikGroupAlgebra.repairToValidOrbit(twisted);
      expect(RubikGroupAlgebra.validateSolutionOrbit(repaired).isValidOrbit).toBe(true);
    });

    it('detects illegal edge flip: sum flip != 0 (mod 2)', () => {
      const flipped = RubikGroupAlgebra.simulateEdgeFlip(initial, 0);
      const res = RubikGroupAlgebra.validateSolutionOrbit(flipped);

      expect(res.isValidOrbit).toBe(false);
      expect(res.isEdgeFlipValid).toBe(false);
      expect(res.edgeFlipSum).toBe(1);

      const repaired = RubikGroupAlgebra.repairToValidOrbit(flipped);
      expect(RubikGroupAlgebra.validateSolutionOrbit(repaired).isValidOrbit).toBe(true);
    });

    it('detects parity violation: odd permutation of corners with even permutation of edges', () => {
      const swapped = RubikGroupAlgebra.simulatePieceSwap(initial);
      const res = RubikGroupAlgebra.validateSolutionOrbit(swapped);

      expect(res.isValidOrbit).toBe(false);
      expect(res.isParityValid).toBe(false);
      expect(res.cornerParity).not.toBe(res.edgeParity);

      const repaired = RubikGroupAlgebra.repairToValidOrbit(swapped);
      expect(RubikGroupAlgebra.validateSolutionOrbit(repaired).isValidOrbit).toBe(true);
    });
  });

  // =========================================================================
  // 5. PURE REACTIVE 2D NET GENERATION
  // =========================================================================
  describe('Pure 2D Net Generation from CubeState', () => {
    it('generates 6 faces with proper face colors for identity state', () => {
      const net = RubikGroupAlgebra.compute2DNet(initial);

      expect(net.U).toBeDefined();
      expect(net.D).toBeDefined();
      expect(net.F).toBeDefined();
      expect(net.B).toBeDefined();
      expect(net.L).toBeDefined();
      expect(net.R).toBeDefined();

      // Check center colors
      expect(net.U[1][1].color).toBe(FACE_COLORS.U);
      expect(net.D[1][1].color).toBe(FACE_COLORS.D);
      expect(net.F[1][1].color).toBe(FACE_COLORS.F);
      expect(net.B[1][1].color).toBe(FACE_COLORS.B);
      expect(net.L[1][1].color).toBe(FACE_COLORS.L);
      expect(net.R[1][1].color).toBe(FACE_COLORS.R);
    });
  });
});
