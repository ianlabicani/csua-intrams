import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'standings',
    loadComponent: () =>
      import('./standings/standings').then((m) => m.Standings),
  },
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full',
  },
];
