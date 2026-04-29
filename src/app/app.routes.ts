import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pensum',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: 'pensum',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pensum/pensum-page/pensum.component').then(m => m.PensumComponent),
  },
  {
    path: '**',
    redirectTo: 'pensum',
  },
];
