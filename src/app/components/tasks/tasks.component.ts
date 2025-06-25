import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  dueDate: string;
  createdAt: string;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class TasksComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: string = 'all';

  // Propiedades computadas para los contadores
  get totalTasks(): number {
    return this.tasks.length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(task => task.status === 'pending').length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.status === 'completed').length;
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser || !this.authService.isClient()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadTasks();
  }

  /**
   * Carga las tareas de ejemplo
   */
  private loadTasks(): void {
    this.tasks = [
      {
        id: 1,
        title: 'Completar proyecto Angular',
        description: 'Finalizar el desarrollo del proyecto TaskFlow',
        category: 'Trabajo',
        priority: 'high',
        status: 'pending',
        dueDate: '2024-01-15',
        createdAt: '2024-01-10'
      },
      {
        id: 2,
        title: 'Revisar documentación',
        description: 'Revisar y actualizar la documentación del proyecto',
        category: 'Trabajo',
        priority: 'medium',
        status: 'completed',
        dueDate: '2024-01-12',
        createdAt: '2024-01-08'
      },
      {
        id: 3,
        title: 'Ejercicio físico',
        description: 'Realizar rutina de ejercicios diaria',
        category: 'Personal',
        priority: 'low',
        status: 'pending',
        dueDate: '2024-01-14',
        createdAt: '2024-01-11'
      }
    ];
    this.filteredTasks = [...this.tasks];
  }

  /**
   * Filtra las tareas según el estado
   */
  filterTasks(filter: string): void {
    this.currentFilter = filter;
    if (filter === 'all') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(task => task.status === filter);
    }
  }

  /**
   * Cambia el estado de una tarea
   */
  toggleTaskStatus(task: Task): void {
    task.status = task.status === 'pending' ? 'completed' : 'pending';
  }

  /**
   * Elimina una tarea
   */
  deleteTask(taskId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.filterTasks(this.currentFilter);
    }
  }

  /**
   * Obtiene la clase CSS para el badge de prioridad
   */
  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getStatusBadgeClass(status: string): string {
    return status === 'completed' ? 'bg-success' : 'bg-primary';
  }
} 