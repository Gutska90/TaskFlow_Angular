import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

/**
 * Guard que verifica si el usuario tiene un rol específico
 * @param requiredRole - El rol requerido para acceder a la ruta
 * @returns true si el usuario tiene el rol requerido, false en caso contrario
 */
export const roleGuard = (requiredRole: UserRole): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.hasRole(requiredRole)) {
      return true;
    }

    // Redirigir al dashboard si está autenticado pero no tiene el rol requerido
    if (authService.isAuthenticated()) {
      router.navigate(['/dashboard']);
    } else {
      router.navigate(['/login']);
    }
    
    return false;
  };
};

/**
 * Guard específico para administradores
 */
export const adminGuard: CanActivateFn = roleGuard(UserRole.ADMIN);

/**
 * Guard específico para clientes
 */
export const clientGuard: CanActivateFn = roleGuard(UserRole.CLIENT); 