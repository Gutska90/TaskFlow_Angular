import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

/**
 * Componente de registro de usuarios
 * Maneja el registro de nuevos usuarios con validaciones robustas
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  passwordValidation: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('[a-zA-Z0-9_]+')
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    // Escuchar cambios en la contraseña para validación en tiempo real
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        this.passwordValidation = this.authService.validatePassword(password);
      }
    });

    // Validar coincidencia de contraseñas en tiempo real
    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.validatePasswordMatch();
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Valida que las contraseñas coincidan
   */
  private validatePasswordMatch(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else if (this.registerForm.get('confirmPassword')?.hasError('mismatch')) {
      this.registerForm.get('confirmPassword')?.setErrors(null);
    }
  }

  /**
   * Validador para confirmar que las contraseñas coinciden
   */
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.registerForm.valid) {
      this.isLoading = true;
      
      const { firstName, lastName, username, email, password } = this.registerForm.value;
      
      const result = this.authService.register(username, email, password, firstName, lastName);
      
      if (result.success) {
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage = result.message;
      }
      
      this.isLoading = false;
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
    }
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    
    if (field?.hasError('minlength')) {
      const requiredLength = field.getError('minlength').requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    
    if (field?.hasError('maxlength')) {
      const requiredLength = field.getError('maxlength').requiredLength;
      return `Máximo ${requiredLength} caracteres`;
    }
    
    if (field?.hasError('pattern')) {
      return 'Solo se permiten letras, números y guiones bajos';
    }
    
    if (field?.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }

  /**
   * Resetea el formulario
   */
  onReset(): void {
    this.registerForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.passwordValidation = {};
  }
} 