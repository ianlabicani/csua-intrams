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
    path: 'event-sched-and-stats',
    loadComponent: () =>
      import('./event-sched-and-stats/event-sched-and-stats').then(
        (m) => m.EventSchedAndStats
      ),
  },
];
