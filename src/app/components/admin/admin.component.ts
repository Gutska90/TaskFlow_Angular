import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User, UserRole } from '../../services/auth.service';

/**
 * Componente del panel de administración
 * Muestra estadísticas generales y acceso a funciones administrativas
 */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminComponent implements OnInit {
  public now = new Date();
  currentUser: User | null = null;
  totalUsers: number = 0;
  totalTasks: number = 0;
  activeUsers: number = 0;

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

    this.loadAdminStats();
  }

  /**
   * Carga las estadísticas administrativas
   */
  private loadAdminStats(): void {
    // En una aplicación real, estos datos vendrían de un servicio
    this.totalUsers = 25;
    this.totalTasks = 150;
    this.activeUsers = 18;
  }

  /**
   * Navega a la gestión de usuarios
   */
  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  /**
   * Navega a la gestión de tareas
   */
  navigateToTasks(): void {
    this.router.navigate(['/admin/tasks']);
  }
} 