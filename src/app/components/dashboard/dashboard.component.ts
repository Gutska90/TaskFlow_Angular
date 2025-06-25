import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService, User, UserRole } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

/**
 * Componente principal del dashboard
 * Muestra el menú dinámico según el rol del usuario y las estadísticas
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, DatePipe]
})
export class DashboardComponent implements OnInit {
  taskForm: FormGroup;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: string = 'all';
  currentCategory: string = 'all';
  currentSort: string = 'date';
  searchTerm: string = '';
  currentUser: User | null = null;
  isMenuCollapsed: boolean = false;

  // Estadísticas
  pendingTasks: number = 0;
  completedTasks: number = 0;
  overdueTasks: number = 0;
  categoryStats: { [key: string]: number } = {};

  // Menú dinámico según rol
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'bi bi-speedometer2',
      route: '/dashboard',
      roles: [UserRole.ADMIN, UserRole.CLIENT]
    },
    {
      label: 'Mis Tareas',
      icon: 'bi bi-list-task',
      route: '/tasks',
      roles: [UserRole.CLIENT]
    },
    {
      label: 'Crear Tarea',
      icon: 'bi bi-plus-circle',
      route: '/tasks/create',
      roles: [UserRole.CLIENT]
    },
    {
      label: 'Panel Admin',
      icon: 'bi bi-gear',
      route: '/admin',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Gestión Usuarios',
      icon: 'bi bi-people',
      route: '/admin/users',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Gestión Tareas',
      icon: 'bi bi-kanban',
      route: '/admin/tasks',
      roles: [UserRole.ADMIN]
    },
    {
      label: 'Mi Perfil',
      icon: 'bi bi-person',
      route: '/profile',
      roles: [UserRole.ADMIN, UserRole.CLIENT]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      dueDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadTasks();

    // Suscribirse a los cambios en las tareas
    this.taskService.tasks$.subscribe(() => {
      this.loadTasks();
    });
  }

  /**
   * Obtiene los elementos del menú filtrados por el rol del usuario actual
   */
  getMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => 
      item.roles.includes(this.currentUser?.role || UserRole.CLIENT)
    );
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.authService.hasRole(role);
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Verifica si el usuario actual es cliente
   */
  isClient(): boolean {
    return this.authService.isClient();
  }

  /**
   * Carga las tareas del usuario
   */
  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
    this.updateFilteredTasks();
    this.updateStats();
  }

  /**
   * Maneja el envío del formulario de nueva tarea
   */
  onSubmit(): void {
    if (this.taskForm.valid) {
      this.taskService.addTask(this.taskForm.value);
      this.taskForm.reset();
    }
  }

  /**
   * Actualiza las tareas filtradas según los criterios actuales
   */
  updateFilteredTasks(): void {
    let filtered = this.taskService.getTasksByFilter(this.currentFilter);
    
    if (this.currentCategory !== 'all') {
      filtered = this.taskService.getTasksByCategory(this.currentCategory);
    }
    
    if (this.searchTerm) {
      filtered = this.taskService.searchTasks(this.searchTerm);
    }

    this.filteredTasks = filtered;
    this.sortTasks();
  }

  /**
   * Ordena las tareas según el criterio seleccionado
   */
  sortTasks(): void {
    switch (this.currentSort) {
      case 'date':
        this.filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        this.filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'category':
        this.filteredTasks.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }
  }

  /**
   * Actualiza las estadísticas de las tareas
   */
  updateStats(): void {
    const stats = this.taskService.getTaskStats();
    this.pendingTasks = stats.pending;
    this.completedTasks = stats.completed;
    this.overdueTasks = stats.overdue;
    this.categoryStats = stats.categories;
  }

  /**
   * Cambia el estado de completado de una tarea
   */
  toggleTaskComplete(task: Task): void {
    this.taskService.toggleTaskComplete(task.id);
  }

  /**
   * Elimina una tarea
   */
  deleteTask(taskId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  /**
   * Establece el filtro de tareas
   */
  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.updateFilteredTasks();
  }

  /**
   * Establece la categoría de filtro
   */
  setCategory(category: string): void {
    this.currentCategory = category;
    this.updateFilteredTasks();
  }

  /**
   * Establece el orden de las tareas
   */
  setSort(sort: string): void {
    this.currentSort = sort;
    this.sortTasks();
  }

  /**
   * Maneja la búsqueda de tareas
   */
  onSearch(term: string): void {
    this.searchTerm = term;
    this.updateFilteredTasks();
  }

  /**
   * Verifica si una tarea está vencida
   */
  isOverdue(task: Task): boolean {
    return !task.completed && new Date(task.dueDate) < new Date();
  }

  /**
   * Alterna el estado del menú lateral
   */
  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.logout();
    }
  }

  /**
   * Obtiene las estadísticas de categorías en formato de array
   */
  getCategoryStats(): Array<{name: string, count: number}> {
    return Object.entries(this.categoryStats).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count
    }));
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
} 