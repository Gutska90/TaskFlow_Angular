import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    title: 'Login - TaskFlow'
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    title: 'Registro - TaskFlow'
  },
  { 
    path: 'recover', 
    loadComponent: () => import('./components/recover/recover.component').then(m => m.RecoverComponent),
    title: 'Recuperar Contraseña - TaskFlow'
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)],
    title: 'Dashboard - TaskFlow'
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)],
    title: 'Mi Perfil - TaskFlow'
  },
  { path: '**', redirectTo: '/login' }
];
