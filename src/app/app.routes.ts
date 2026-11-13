import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'math',
    loadComponent: () =>
      import('./components/math-concepts/math-concepts.component').then(
        (m) => m.MathConceptsComponent
      ),
  },
  {
    path: 'validator',
    loadComponent: () =>
      import('./components/orbit-validator/orbit-validator.component').then(
        (m) => m.OrbitValidatorComponent
      ),
  },
  {
    path: 'tutorial',
    loadComponent: () =>
      import('./components/cube-tutorial/cube-tutorial.component').then(
        (m) => m.CubeTutorialComponent
      ),
  },
  {
    path: 'custom',
    loadComponent: () =>
      import('./components/custom-cube/custom-cube.component').then(
        (m) => m.CustomCubeComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
