import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9_]+')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    });

    // Agregar validador de coincidencia de contraseñas
    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true });
      } else {
        this.registerForm.get('confirmPassword')?.setErrors(null);
      }
    });

    // Mostrar usuarios existentes en la consola
    this.authService.debugUsers();
  }

  getFormValidationErrors() {
    const errors: string[] = [];
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control?.errors) {
        Object.keys(control.errors).forEach(keyError => {
          errors.push(`${key} - ${keyError}`);
        });
      }
    });

    console.log('Form Errors:', errors);
    console.log('Form Values:', this.registerForm.value);
    console.log('Form Valid:', this.registerForm.valid);
    return errors;
  }

  onSubmit(): void {
    console.log('Form submitted');
    this.getFormValidationErrors();
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.registerForm.valid) {
      console.log('Form is valid');
      const { username, email, password } = this.registerForm.value;
      
      try {
        if (this.authService.register(username, email, password)) {
          console.log('Registration successful');
          this.successMessage = 'Registro exitoso. Redirigiendo...';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          console.log('Registration failed - username exists');
          this.errorMessage = 'El nombre de usuario ya está en uso';
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.errorMessage = 'Error al registrar el usuario';
      }
    } else {
      console.log('Form is invalid');
      this.errorMessage = 'Por favor, complete todos los campos correctamente';
      
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
    }
  }
} 