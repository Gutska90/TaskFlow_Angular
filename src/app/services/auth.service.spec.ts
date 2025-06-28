import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, UserRole, PasswordValidationResult } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Password Validation', () => {
    it('should validate password with all requirements met', () => {
      const result: PasswordValidationResult = service.validatePassword('TestPass123!');
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should fail validation for password without uppercase', () => {
      const result: PasswordValidationResult = service.validatePassword('testpass123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una mayúscula');
    });

    it('should fail validation for password without lowercase', () => {
      const result: PasswordValidationResult = service.validatePassword('TESTPASS123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una minúscula');
    });

    it('should fail validation for password without numbers', () => {
      const result: PasswordValidationResult = service.validatePassword('TestPass!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('should fail validation for password without special characters', () => {
      const result: PasswordValidationResult = service.validatePassword('TestPass123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un carácter especial');
    });

    it('should fail validation for password too short', () => {
      const result: PasswordValidationResult = service.validatePassword('Test1!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return multiple errors for invalid password', () => {
      const result: PasswordValidationResult = service.validatePassword('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('User Registration', () => {
    it('should register new user successfully', () => {
      const result = service.register('newuser', 'new@example.com', 'TestPass123!', 'John', 'Doe');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Usuario registrado exitosamente');
    });

    it('should fail registration for existing username', () => {
      // Registrar primer usuario
      service.register('existinguser', 'first@example.com', 'TestPass123!', 'John', 'Doe');
      
      // Intentar registrar con mismo username
      const result = service.register('existinguser', 'second@example.com', 'TestPass123!', 'Jane', 'Doe');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('El nombre de usuario ya existe');
    });

    it('should fail registration for existing email', () => {
      // Registrar primer usuario
      service.register('user1', 'existing@example.com', 'TestPass123!', 'John', 'Doe');
      
      // Intentar registrar con mismo email
      const result = service.register('user2', 'existing@example.com', 'TestPass123!', 'Jane', 'Doe');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('El email ya está registrado');
    });

    it('should fail registration with invalid password', () => {
      const result = service.register('newuser', 'new@example.com', 'weak', 'John', 'Doe');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('La contraseña debe');
    });

    it('should set default role as CLIENT for new users', () => {
      service.register('newuser', 'new@example.com', 'TestPass123!', 'John', 'Doe');
      
      const loginResult = service.login('newuser', 'TestPass123!', false);
      expect(loginResult.success).toBe(true);
      
      const currentUser = service.getCurrentUser();
      expect(currentUser?.role).toBe(UserRole.CLIENT);
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Crear usuario de prueba
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
    });

    it('should login with valid credentials', () => {
      const result = service.login('testuser', 'TestPass123!', false);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Inicio de sesión exitoso');
    });

    it('should fail login with invalid username', () => {
      const result = service.login('wronguser', 'TestPass123!', false);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciales inválidas');
    });

    it('should fail login with invalid password', () => {
      const result = service.login('testuser', 'wrongpassword', false);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Credenciales inválidas');
    });

    it('should set current user after successful login', () => {
      service.login('testuser', 'TestPass123!', false);
      
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.username).toBe('testuser');
      expect(currentUser?.email).toBe('test@example.com');
    });

    it('should persist user data in localStorage', () => {
      service.login('testuser', 'TestPass123!', false);
      
      const storedUser = localStorage.getItem('taskflow_current_user');
      expect(storedUser).toBeTruthy();
      
      const userData = JSON.parse(storedUser!);
      expect(userData.username).toBe('testuser');
    });
  });

  describe('Authentication State', () => {
    it('should return false when not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when authenticated', () => {
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
      service.login('testuser', 'TestPass123!', false);
      
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return current user when authenticated', () => {
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
      service.login('testuser', 'TestPass123!', false);
      
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.username).toBe('testuser');
    });

    it('should return null when not authenticated', () => {
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeNull();
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      // Crear usuarios de prueba con diferentes roles
      service.register('adminuser', 'admin@example.com', 'AdminPass123!', 'Admin', 'User');
      service.register('clientuser', 'client@example.com', 'ClientPass123!', 'Client', 'User');
      
      // Simular que el adminuser tiene rol de admin (modificar directamente en localStorage)
      const users = JSON.parse(localStorage.getItem('taskflow_users') || '{}');
      users['adminuser'].role = UserRole.ADMIN;
      localStorage.setItem('taskflow_users', JSON.stringify(users));
    });

    it('should check if user has specific role', () => {
      service.login('adminuser', 'AdminPass123!', false);
      
      expect(service.hasRole(UserRole.ADMIN)).toBe(true);
      expect(service.hasRole(UserRole.CLIENT)).toBe(false);
    });

    it('should check if user is admin', () => {
      service.login('adminuser', 'AdminPass123!', false);
      
      expect(service.isAdmin()).toBe(true);
    });

    it('should check if user is client', () => {
      service.login('clientuser', 'ClientPass123!', false);
      
      expect(service.isClient()).toBe(true);
    });

    it('should return false for role checks when not authenticated', () => {
      expect(service.hasRole(UserRole.ADMIN)).toBe(false);
      expect(service.isAdmin()).toBe(false);
      expect(service.isClient()).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should clear current user on logout', () => {
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
      service.login('testuser', 'TestPass123!', false);
      
      expect(service.isAuthenticated()).toBe(true);
      
      service.logout();
      
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should clear localStorage on logout', () => {
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
      service.login('testuser', 'TestPass123!', false);
      
      expect(localStorage.getItem('taskflow_current_user')).toBeTruthy();
      
      service.logout();
      
      expect(localStorage.getItem('taskflow_current_user')).toBeNull();
    });

    it('should navigate to login on logout', () => {
      service.logout();
      
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Profile Updates', () => {
    beforeEach(() => {
      service.register('testuser', 'test@example.com', 'TestPass123!', 'Test', 'User');
      service.login('testuser', 'TestPass123!', false);
    });

    it('should update profile successfully', () => {
      const result = service.updateProfile({
        firstName: 'Updated',
        lastName: 'Name'
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Perfil actualizado exitosamente');
      
      const currentUser = service.getCurrentUser();
      expect(currentUser?.firstName).toBe('Updated');
      expect(currentUser?.lastName).toBe('Name');
    });

    it('should persist profile updates in localStorage', () => {
      service.updateProfile({
        firstName: 'Updated',
        lastName: 'Name'
      });
      
      const storedUser = localStorage.getItem('taskflow_current_user');
      const userData = JSON.parse(storedUser!);
      expect(userData.firstName).toBe('Updated');
      expect(userData.lastName).toBe('Name');
    });
  });

  describe('Test Users Initialization', () => {
    it('should create test users on first initialization', () => {
      // El servicio ya se inicializó en beforeEach, verificar que los usuarios de prueba existen
      const loginResult = service.login('admin', 'Admin123!', false);
      expect(loginResult.success).toBe(true);
      
      const adminUser = service.getCurrentUser();
      expect(adminUser?.role).toBe(UserRole.ADMIN);
    });

    it('should not recreate test users on subsequent initializations', () => {
      // Crear un nuevo servicio (simula reinicialización)
      const newService = new AuthService(router);
      
      // Los usuarios de prueba ya deberían existir
      const loginResult = newService.login('client', 'Client123!', false);
      expect(loginResult.success).toBe(true);
    });
  });
}); 