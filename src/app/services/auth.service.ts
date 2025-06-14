import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  username: string;
  email: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
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
    this.initializeTestUser();
    this.loadUserFromStorage();
  }

  private initializeTestUser(): void {
    // Si no hay usuarios en el almacenamiento, crear el usuario de prueba
    const users = this.getUsers();
    if (Object.keys(users).length === 0) {
      const testUser: UserData = {
        username: 'test',
        email: 'test@example.com',
        password: 'test123'
      };
      users[testUser.username] = testUser;
      this.saveUsers(users);
      console.log('Usuario de prueba creado:', testUser);
    }
  }

  private getUsers(): { [key: string]: UserData } {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
  }

  private saveUsers(users: { [key: string]: UserData }): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userJson) {
      const userData: User = JSON.parse(userJson);
      this.currentUserSubject.next(userData);
    }
  }

  register(username: string, email: string, password: string): boolean {
    console.log('Intentando registrar usuario:', { username, email });
    const users = this.getUsers();

    // Verificar si el usuario ya existe
    if (users[username]) {
      console.log('El usuario ya existe');
      return false;
    }

    // Crear nuevo usuario
    const newUser: UserData = {
      username,
      email,
      password
    };

    // Guardar el nuevo usuario
    users[username] = newUser;
    this.saveUsers(users);
    console.log('Usuario registrado exitosamente');

    // Iniciar sesión automáticamente
    return this.login(username, password, false);
  }

  login(username: string, password: string, rememberMe: boolean): boolean {
    console.log('Intentando iniciar sesión:', username);
    const users = this.getUsers();
    const user = users[username];

    if (user && user.password === password) {
      const userData: User = {
        username: user.username,
        email: user.email
      };

      // Guardar usuario actual
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
      this.currentUserSubject.next(userData);
      console.log('Inicio de sesión exitoso');
      return true;
    }

    console.log('Inicio de sesión fallido');
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    console.log('Sesión cerrada');
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Método de utilidad para ver los usuarios registrados (solo para desarrollo)
  debugUsers(): void {
    console.log('Usuarios registrados:', this.getUsers());
  }
} 