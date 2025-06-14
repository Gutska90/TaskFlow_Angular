import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    // Aquí cargaríamos las tareas desde el almacenamiento local o una API
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
      this.tasksSubject.next(this.tasks);
    }
  }

  private saveTasks(): void {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.tasksSubject.next(this.tasks);
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  addTask(task: Omit<Task, 'id' | 'completed' | 'createdAt'>): void {
    const newTask: Task = {
      id: Date.now(),
      ...task,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.tasks.unshift(newTask);
    this.saveTasks();
  }

  updateTask(taskId: number, updates: Partial<Task>): void {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.saveTasks();
    }
  }

  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasks();
  }

  toggleTaskComplete(taskId: number): void {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
    }
  }

  getTasksByFilter(filter: string): Task[] {
    switch (filter) {
      case 'pending':
        return this.tasks.filter(task => !task.completed);
      case 'completed':
        return this.tasks.filter(task => task.completed);
      default:
        return this.tasks;
    }
  }

  getTasksByCategory(category: string): Task[] {
    return category === 'all' 
      ? this.tasks 
      : this.tasks.filter(task => task.category === category);
  }

  searchTasks(term: string): Task[] {
    const searchTerm = term.toLowerCase();
    return this.tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm)
    );
  }

  getOverdueTasks(): Task[] {
    const today = new Date();
    return this.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return !task.completed && dueDate < today;
    });
  }

  getTaskStats() {
    return {
      pending: this.tasks.filter(task => !task.completed).length,
      completed: this.tasks.filter(task => task.completed).length,
      overdue: this.getOverdueTasks().length,
      categories: this.tasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    };
  }
} 