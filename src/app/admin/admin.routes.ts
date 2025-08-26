import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'colleges',
    pathMatch: 'full',
  },
  {
    path: 'colleges',
    loadComponent: () => import('./colleges/colleges').then((m) => m.Colleges),
  },
  {
    path: 'colleges/:id',
    loadComponent: () =>
      import('./colleges/college-details/college-details').then(
        (m) => m.CollegeDetails
      ),
  },
  {
    path: 'medals',
    loadComponent: () => import('./medals/medals').then((m) => m.Medals),
  },
];
