import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title mb-0">Crear Nueva Tarea</h2>
            </div>
            <div class="card-body">
              <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="title" class="form-label">Título de la Tarea</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    [class.is-invalid]="hasError('title')"
                    id="title" 
                    formControlName="title"
                    placeholder="Ingresa el título de la tarea"
                  >
                  <div class="invalid-feedback" *ngIf="hasError('title')">
                    {{ getErrorMessage('title') }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Descripción</label>
                  <textarea 
                    class="form-control" 
                    [class.is-invalid]="hasError('description')"
                    id="description" 
                    formControlName="description"
                    rows="3"
                    placeholder="Describe la tarea"
                  ></textarea>
                  <div class="invalid-feedback" *ngIf="hasError('description')">
                    {{ getErrorMessage('description') }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="category" class="form-label">Categoría</label>
                    <select 
                      class="form-select" 
                      [class.is-invalid]="hasError('category')"
                      id="category" 
                      formControlName="category"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Trabajo">Trabajo</option>
                      <option value="Personal">Personal</option>
                      <option value="Estudio">Estudio</option>
                      <option value="Salud">Salud</option>
                      <option value="Otros">Otros</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="hasError('category')">
                      {{ getErrorMessage('category') }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="priority" class="form-label">Prioridad</label>
                    <select 
                      class="form-select" 
                      [class.is-invalid]="hasError('priority')"
                      id="priority" 
                      formControlName="priority"
                    >
                      <option value="">Seleccionar prioridad</option>
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Baja</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="hasError('priority')">
                      {{ getErrorMessage('priority') }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="dueDate" class="form-label">Fecha de Vencimiento</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    [class.is-invalid]="hasError('dueDate')"
                    id="dueDate" 
                    formControlName="dueDate"
                  >
                  <div class="invalid-feedback" *ngIf="hasError('dueDate')">
                    {{ getErrorMessage('dueDate') }}
                  </div>
                </div>

                <div *ngIf="successMessage" class="alert alert-success">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <div class="d-flex gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    [disabled]="!taskForm.valid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i *ngIf="!isLoading" class="bi bi-plus-circle me-1"></i>
                    {{ isLoading ? 'Creando...' : 'Crear Tarea' }}
                  </button>
                  <a [routerLink]="['/tasks']" class="btn btn-outline-secondary">
                    <i class="bi bi-arrow-left me-1"></i>Cancelar
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateTaskComponent implements OnInit {
  taskForm: FormGroup;
  currentUser: User | null = null;
  isLoading: boolean = false;
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      dueDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser || !this.authService.isClient()) {
      this.router.navigate(['/dashboard']);
      return;
    }
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      
      // Simular creación de tarea
      setTimeout(() => {
        this.successMessage = 'Tarea creada exitosamente';
        this.isLoading = false;
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/tasks']);
        }, 2000);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('minlength')) {
      const requiredLength = field.getError('minlength').requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    
    return '';
  }
} 