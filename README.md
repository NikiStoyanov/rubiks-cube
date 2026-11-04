# Rubik's Cube Group Actions Explorer (Angular Edition)

A high-performance Single Page Application (SPA) built with **Angular (v22 Standalone Components + Signals)**, **Three.js**, **KaTeX**, and **Tailwind CSS**, demonstrating group actions, orbits, stabilizers, commutators, and cycle decompositions on the Rubik's Cube group $\mathcal{G}$.

---

## 🚀 Quick Start

From the `rubik-angular` directory:

```bash
# Run local development server
npm start
# or: ng serve --port 4200
```

Open your browser at `http://localhost:4200/`.

To build for production:

```bash
npm run build
```

The output artifacts will be in `dist/rubik-angular/browser`.

---

## 📐 Architecture & Key Features

### 1. Angular Modern Architecture
- **Standalone Components**: Clean modular architecture with no `NgModule` boilerplate.
- **Angular Signals & Computeds**: Reactive state management with `signal()`, `computed()`, and `effect()`.
- **NgZone Isolation**: Three.js 60 FPS animation loop runs inside `runOutsideAngular()` to eliminate redundant zone-based change detection cycles. Events re-enter the zone only upon state transitions or piece clicks.

### 2. Group Theoretic Modules
- **Orbit Explorer ($\operatorname{Orb}_H(x)$)**: Visualizes the orbit of any corner ($C_i \in \mathcal{C}$) or edge ($E_j \in \mathcal{E}$) under arbitrary subgroups ($H \le \mathcal{G}$), showing orbit sizes and transitivity.
- **Stabilizer Inspector ($\operatorname{Stab}_G(x)$)**: Tests generator stability on the active piece and calculates the index $[\mathcal{G} : \operatorname{Stab}_G(x)] = |\operatorname{Orb}_G(x)|$ using the **Orbit-Stabilizer Theorem**.
- **Disjoint Cycle Decomposition**: Real-time cycle decomposition $(\cdot \to \cdot \to \dots)$ for corners and edges, computing permutation parity ($\operatorname{sgn}(\sigma) = \operatorname{sgn}(\tau) = +1$) and element order $\operatorname{ord}(g) = \operatorname{lcm}(\text{cycle lengths})$.
- **Commutator & Conjugation Lab**: Interactive breakdown of $[A, B] = A B A^{-1} B^{-1}$ and conjugates $A B A^{-1}$ with step-by-step playback.
- **Element Order Stepper**: Repeatedly powers $g \mapsto g^2 \mapsto \dots \mapsto g^{\operatorname{ord}(g)} = e$ with automatic cyclic progression and progress visualization.
- **Subgroup & Canonical Symmetries**: Explores famous subgroups (Centers group, Slice group, Quarter-Turn metric, 2-Gen subgroup $\langle R, U \rangle$, Square subgroup) and canonical patterns (Superflip, Checkerboard, Cube in a Cube, Pons Asinorum).
- **Interactive Theory Guide Modal**: Complete mathematical rigor explaining group actions $\varphi: G \times X \to X$, the 3 Fundamental Invariants of Rubikology, and group cardinality $|\mathcal{G}| \approx 4.33 \times 10^{19}$.

### 3. Bilingual Support (EN 🇬🇧 / BG 🇧🇬)
- 1-click instantaneous language switching between English and Bulgarian via `LanguageService`.
- Persistent language preference stored in `localStorage`.
