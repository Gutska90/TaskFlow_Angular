import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class RecoverComponent {
  recoveryForm: FormGroup;
  verificationForm: FormGroup;
  newPasswordForm: FormGroup;
  currentStep: 'email' | 'verification' | 'password' = 'email';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.newPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onEmailSubmit(): void {
    if (this.recoveryForm.valid) {
      // Aquí iría la lógica para enviar el código de verificación
      // Por ahora, simulamos el envío exitoso
      this.currentStep = 'verification';
      this.successMessage = 'Se ha enviado un código de verificación a tu correo electrónico';
      this.errorMessage = '';
    }
  }

  onVerificationSubmit(): void {
    if (this.verificationForm.valid) {
      // Aquí iría la lógica para verificar el código
      // Por ahora, simulamos la verificación exitosa
      this.currentStep = 'password';
      this.successMessage = 'Código verificado correctamente';
      this.errorMessage = '';
    }
  }

  onPasswordSubmit(): void {
    if (this.newPasswordForm.valid) {
      // Aquí iría la lógica para cambiar la contraseña
      // Por ahora, simulamos el cambio exitoso
      this.successMessage = 'Contraseña cambiada exitosamente';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  resendCode(): void {
    // Aquí iría la lógica para reenviar el código
    this.successMessage = 'Se ha reenviado el código de verificación';
    this.errorMessage = '';
  }
} 