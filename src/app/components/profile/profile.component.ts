import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface UserPreferences {
  theme: 'light' | 'dark';
  notifyTasks: boolean;
  notifyDue: boolean;
  language: 'es' | 'en';
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  personalForm: FormGroup;
  passwordForm: FormGroup;
  preferencesForm: FormGroup;
  currentTab: 'personal' | 'password' | 'preferences' = 'personal';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern('[A-Za-zÀ-ÿ\\s]+')]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.pattern('[a-zA-Z0-9_]+')]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.preferencesForm = this.fb.group({
      theme: ['light'],
      notifyTasks: [true],
      notifyDue: [true],
      language: ['es']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del usuario
    this.personalForm.patchValue({
      username: user.username,
      email: user.username + '@example.com', // Simulado
      fullName: 'Usuario de Ejemplo' // Simulado
    });

    // Deshabilitar el campo de email
    this.personalForm.get('email')?.disable();

    // Cargar preferencias (simulado)
    const preferences: UserPreferences = {
      theme: 'light',
      notifyTasks: true,
      notifyDue: true,
      language: 'es'
    };
    this.preferencesForm.patchValue(preferences);
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { 'mismatch': true };
  }

  onPersonalSubmit(): void {
    if (this.personalForm.valid) {
      // Aquí iría la lógica para actualizar la información personal
      this.successMessage = 'Información personal actualizada correctamente';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      // Aquí iría la lógica para cambiar la contraseña
      this.successMessage = 'Contraseña actualizada correctamente';
      setTimeout(() => this.successMessage = '', 3000);
      this.passwordForm.reset();
    }
  }

  onPreferencesSubmit(): void {
    if (this.preferencesForm.valid) {
      // Aquí iría la lógica para guardar las preferencias
      this.successMessage = 'Preferencias guardadas correctamente';
      setTimeout(() => this.successMessage = '', 3000);
    }
  }

  setTab(tab: 'personal' | 'password' | 'preferences'): void {
    this.currentTab = tab;
  }

  logout(): void {
    this.authService.logout();
  }
} 