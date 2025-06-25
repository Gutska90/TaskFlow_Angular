import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../../services/auth.service';

/**
 * Componente de gestión de usuarios
 * Permite al administrador ver y gestionar todos los usuarios del sistema
 */
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser || !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios
   */
  private loadUsers(): void {
    // En una aplicación real, esto vendría de un servicio
    this.users = [
      {
        username: 'admin',
        email: 'admin@taskflow.com',
        role: UserRole.ADMIN,
        firstName: 'Administrador',
        lastName: 'Sistema'
      },
      {
        username: 'client',
        email: 'client@taskflow.com',
        role: UserRole.CLIENT,
        firstName: 'Cliente',
        lastName: 'Demo'
      }
    ];
  }

  /**
   * Obtiene el nombre del rol en español
   */
  getRoleName(role: UserRole): string {
    return role === UserRole.ADMIN ? 'Administrador' : 'Cliente';
  }

  /**
   * Obtiene la clase CSS para el badge del rol
   */
  getRoleBadgeClass(role: UserRole): string {
    return role === UserRole.ADMIN ? 'bg-danger' : 'bg-primary';
  }
} 