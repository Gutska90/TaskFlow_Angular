import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  username: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface UserData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client'
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly USERS_KEY = 'taskflow_users';
  private readonly CURRENT_USER_KEY = 'taskflow_current_user';

  constructor(private router: Router) {
    this.initializeTestUsers();
    this.loadUserFromStorage();
  }

  /**
   * Inicializa usuarios de prueba para desarrollo
   */
  private initializeTestUsers(): void {
    const users = this.getUsers();
    if (Object.keys(users).length === 0) {
      const testUsers: UserData[] = [
        {
          username: 'admin',
          email: 'admin@taskflow.com',
          password: 'Admin123!',
          role: UserRole.ADMIN,
          firstName: 'Administrador',
          lastName: 'Sistema'
        },
        {
          username: 'client',
          email: 'client@taskflow.com',
          password: 'Client123!',
          role: UserRole.CLIENT,
          firstName: 'Cliente',
          lastName: 'Demo'
        }
      ];

      testUsers.forEach(user => {
        users[user.username] = user;
      });
      
      this.saveUsers(users);
      console.log('Usuarios de prueba creados:', testUsers);
    }
  }

  /**
   * Obtiene todos los usuarios del almacenamiento local
   */
  private getUsers(): { [key: string]: UserData } {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
  }

  /**
   * Guarda los usuarios en el almacenamiento local
   */
  private saveUsers(users: { [key: string]: UserData }): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Carga el usuario actual desde el almacenamiento
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userJson) {
      const userData: User = JSON.parse(userJson);
      this.currentUserSubject.next(userData);
    }
  }

  /**
   * Valida la contraseña según las reglas de seguridad
   */
  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Registra un nuevo usuario
   */
  register(username: string, email: string, password: string, firstName?: string, lastName?: string): { success: boolean; message: string } {
    console.log('Intentando registrar usuario:', { username, email });
    const users = this.getUsers();

    // Verificar si el usuario ya existe
    if (users[username]) {
      return { success: false, message: 'El nombre de usuario ya existe' };
    }

    // Verificar si el email ya existe
    const existingUser = Object.values(users).find(user => user.email === email);
    if (existingUser) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Validar contraseña
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.errors.join(', ') };
    }

    // Crear nuevo usuario con rol por defecto
    const newUser: UserData = {
      username,
      email,
      password,
      role: UserRole.CLIENT, // Por defecto es cliente
      firstName,
      lastName
    };

    // Guardar el nuevo usuario
    users[username] = newUser;
    this.saveUsers(users);
    console.log('Usuario registrado exitosamente');

    return { success: true, message: 'Usuario registrado exitosamente' };
  }

  /**
   * Inicia sesión de un usuario
   */
  login(username: string, password: string, rememberMe: boolean): { success: boolean; message: string } {
    console.log('Intentando iniciar sesión:', username);
    const users = this.getUsers();
    const user = users[username];

    if (user && user.password === password) {
      const userData: User = {
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      // Guardar usuario actual
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
      this.currentUserSubject.next(userData);
      console.log('Inicio de sesión exitoso');
      return { success: true, message: 'Inicio de sesión exitoso' };
    }

    console.log('Inicio de sesión fallido');
    return { success: false, message: 'Usuario o contraseña incorrectos' };
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    console.log('Sesión cerrada');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === role;
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Verifica si el usuario actual es cliente
   */
  isClient(): boolean {
    return this.hasRole(UserRole.CLIENT);
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile(updates: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'No hay usuario autenticado' };
    }

    const users = this.getUsers();
    const userData = users[currentUser.username];
    
    if (!userData) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Actualizar datos del usuario
    const updatedUserData: UserData = {
      ...userData,
      ...updates
    };

    // Actualizar en almacenamiento
    users[currentUser.username] = updatedUserData;
    this.saveUsers(users);

    // Actualizar usuario actual
    const updatedUser: User = {
      username: updatedUserData.username,
      email: updatedUserData.email,
      role: updatedUserData.role,
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);

    return { success: true, message: 'Perfil actualizado exitosamente' };
  }

  /**
   * Método de utilidad para ver los usuarios registrados (solo para desarrollo)
   */
  debugUsers(): void {
    console.log('Usuarios registrados:', this.getUsers());
  }
} 