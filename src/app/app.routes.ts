import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'standings',
    pathMatch: 'full',
  },
  {
    path: 'standings',
    loadComponent: () =>
      import('./standings/standings').then((m) => m.Standings),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then((m) => m.Admin),
    children: [
      {
        path: '',
        redirectTo: 'medals',
        pathMatch: 'full',
      },
      {
        path: 'medals',
        loadComponent: () =>
          import('./admin/medals/medals').then((m) => m.Medals),
      },
    ],
  },
];
