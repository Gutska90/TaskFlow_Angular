import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern('[a-zA-Z0-9_]+')
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        this.passwordValidator()
      ]],
      confirmPassword: ['', Validators.required],
      birthDate: ['', [Validators.required, this.ageValidator()]],
      shippingAddress: [''],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
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

  ngOnInit(): void {}

  // Validator para contraseña (debe contener al menos un número y una mayúscula)
  passwordValidator() {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const hasNumber = /[0-9]/.test(control.value);
      const hasUpperCase = /[A-Z]/.test(control.value);
      
      if (!hasNumber || !hasUpperCase) {
        return {
          passwordRequirements: {
            hasNumber,
            hasUpperCase
          }
        };
      }
      return null;
    };
  }

  // Validator para edad mínima (13 años)
  ageValidator() {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.value) return null;
      
      const today = new Date();
      const birthDate = new Date(control.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= 13 ? null : { minAge: true };
    };
  }

  // Validator para confirmar que las contraseñas coinciden
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
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
      const { email, password } = this.registerForm.value;
      
      try {
        if (this.authService.register(email, email, password)) {
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

  onReset() {
    this.registerForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
} 