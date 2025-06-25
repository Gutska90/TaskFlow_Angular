import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { adminGuard, clientGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    title: 'Login - TaskFlow'
  },
  { 
    path: 'register', 
    component: RegisterComponent,
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
  // Rutas específicas para administradores
  { 
    path: 'admin', 
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard],
    title: 'Panel de Administración - TaskFlow'
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./components/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [adminGuard],
    title: 'Gestión de Usuarios - TaskFlow'
  },
  { 
    path: 'admin/tasks', 
    loadComponent: () => import('./components/admin/task-management/task-management.component').then(m => m.TaskManagementComponent),
    canActivate: [adminGuard],
    title: 'Gestión de Tareas - TaskFlow'
  },
  // Rutas específicas para clientes
  { 
    path: 'tasks', 
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [clientGuard],
    title: 'Mis Tareas - TaskFlow'
  },
  { 
    path: 'tasks/create', 
    loadComponent: () => import('./components/tasks/create-task/create-task.component').then(m => m.CreateTaskComponent),
    canActivate: [clientGuard],
    title: 'Crear Tarea - TaskFlow'
  },
  { 
    path: 'tasks/:id', 
    loadComponent: () => import('./components/tasks/task-detail/task-detail.component').then(m => m.TaskDetailComponent),
    canActivate: [clientGuard],
    title: 'Detalle de Tarea - TaskFlow'
  },
  { path: '**', redirectTo: '/login' }
];
