import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5">
      <h2>Detalle de Tarea</h2>
      <p class="text-muted">Funcionalidad en desarrollo...</p>
      <a routerLink="/tasks" class="btn btn-outline-secondary mt-3">
        <i class="bi bi-arrow-left me-2"></i>Volver a Mis Tareas
      </a>
    </div>
  `
})
export class TaskDetailComponent {} 