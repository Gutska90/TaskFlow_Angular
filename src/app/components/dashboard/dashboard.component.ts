import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

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
  currentUser: string = '';

  // Estadísticas
  pendingTasks: number = 0;
  completedTasks: number = 0;
  overdueTasks: number = 0;
  categoryStats: { [key: string]: number } = {};

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
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = user.username;
    this.loadTasks();

    // Suscribirse a los cambios en las tareas
    this.taskService.tasks$.subscribe(() => {
      this.loadTasks();
    });
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
    this.updateFilteredTasks();
    this.updateStats();
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.taskService.addTask(this.taskForm.value);
      this.taskForm.reset();
    }
  }

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

  updateStats(): void {
    const stats = this.taskService.getTaskStats();
    this.pendingTasks = stats.pending;
    this.completedTasks = stats.completed;
    this.overdueTasks = stats.overdue;
    this.categoryStats = stats.categories;
  }

  toggleTaskComplete(task: Task): void {
    this.taskService.toggleTaskComplete(task.id);
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId);
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.updateFilteredTasks();
  }

  setCategory(category: string): void {
    this.currentCategory = category;
    this.updateFilteredTasks();
  }

  setSort(sort: string): void {
    this.currentSort = sort;
    this.sortTasks();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.updateFilteredTasks();
  }

  isOverdue(task: Task): boolean {
    return !task.completed && new Date(task.dueDate) < new Date();
  }

  logout(): void {
    this.authService.logout();
  }
} 