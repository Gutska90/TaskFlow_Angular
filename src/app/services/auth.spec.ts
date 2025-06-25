import { TestBed } from '@angular/core/testing';
import { AuthService, UserRole } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Limpiar localStorage antes de cada test para que sean independientes
    localStorage.clear();
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication', () => {
    it('should return false for isAuthenticated when no user is logged in', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true for isAuthenticated after successful login', () => {
      const result = service.login('admin', 'Admin123!', false);
      expect(result.success).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false for isAuthenticated after logout', () => {
      service.login('admin', 'Admin123!', false);
      service.logout();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('Login', () => {
    it('should successfully login with valid admin credentials', () => {
      const result = service.login('admin', 'Admin123!', false);
      expect(result.success).toBeTrue();
      expect(result.message).toBe('Inicio de sesión exitoso');
    });

    it('should successfully login with valid client credentials', () => {
      const result = service.login('client', 'Client123!', false);
      expect(result.success).toBeTrue();
      expect(result.message).toBe('Inicio de sesión exitoso');
    });

    it('should fail login with invalid credentials', () => {
      const result = service.login('invalid', 'wrongpassword', false);
      expect(result.success).toBeFalse();
      expect(result.message).toBe('Usuario o contraseña incorrectos');
    });
  });

  describe('Registration', () => {
    it('should successfully register a new user', () => {
      const result = service.register('newuser', 'new@example.com', 'NewPass123!', 'New', 'User');
      expect(result.success).toBeTrue();
      expect(result.message).toBe('Usuario registrado exitosamente');
    });

    it('should fail registration with existing username', () => {
      service.register('existinguser', 'existing@example.com', 'Pass123!', 'Existing', 'User');
      const result = service.register('existinguser', 'another@example.com', 'Pass123!', 'Another', 'User');
      expect(result.success).toBeFalse();
      expect(result.message).toBe('El nombre de usuario ya existe');
    });

    it('should fail registration with existing email', () => {
      service.register('user1', 'existing@example.com', 'Pass123!', 'User', 'One');
      const result = service.register('user2', 'existing@example.com', 'Pass123!', 'User', 'Two');
      expect(result.success).toBeFalse();
      expect(result.message).toBe('El email ya está registrado');
    });
  });

  describe('Password Validation', () => {
    it('should validate password requirements', () => {
      const weakPassword = service.validatePassword('weak');
      expect(weakPassword.isValid).toBeFalse();
      expect(weakPassword.errors.length).toBeGreaterThan(0);

      const strongPassword = service.validatePassword('StrongPass1!');
      expect(strongPassword.isValid).toBeTrue();
      expect(strongPassword.errors.length).toBe(0);
    });
  });

  describe('Profile Management', () => {
    it('should get current user after login', () => {
      service.login('admin', 'Admin123!', false);
      const user = service.getCurrentUser();
      expect(user).toBeTruthy();
      expect(user?.username).toBe('admin');
      expect(user?.role).toBe(UserRole.ADMIN);
    });

    it('should update user profile', () => {
      service.login('client', 'Client123!', false);
      const result = service.updateProfile({ firstName: 'Updated', lastName: 'User', email: 'updated@example.com' });
      expect(result.success).toBeTrue();
      expect(result.message).toBe('Perfil actualizado exitosamente');
      
      const user = service.getCurrentUser();
      expect(user?.firstName).toBe('Updated');
      expect(user?.lastName).toBe('User');
      expect(user?.email).toBe('updated@example.com');
      expect(user?.role).toBe(UserRole.CLIENT);
    });
  });
});
