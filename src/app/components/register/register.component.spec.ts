import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

class MockAuthService {
  register(username: string, email: string, password: string, firstName?: string, lastName?: string) { return { success: true, message: '' }; }
  isAuthenticated() { return false; }
  validatePassword() { return {}; }
  login() { return { success: true, message: '' }; }
  logout() { }
  getCurrentUser() { return null; }
  updateProfile() { return { success: true, message: '' }; }
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        RegisterComponent
      ],
      providers: [{ provide: AuthService, useClass: MockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      
      emailControl?.setValue('');
      expect(emailControl?.errors?.['required']).toBeTruthy();
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors).toBeNull();
    });

    it('should validate password requirements', () => {
      const passwordControl = component.registerForm.get('password');
      
      // Empty password
      passwordControl?.setValue('');
      expect(passwordControl?.errors?.['required']).toBeTruthy();
      
      // Valid password
      passwordControl?.setValue('Abcdef1!');
      expect(passwordControl?.errors).toBeNull();
    });

    it('should validate matching passwords', () => {
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      
      passwordControl?.setValue('ValidPass1!');
      confirmPasswordControl?.setValue('DifferentPass1!');
      expect(component.registerForm.errors?.['mismatch']).toBeTruthy();
      
      confirmPasswordControl?.setValue('ValidPass1!');
      expect(component.registerForm.errors?.['mismatch']).toBeFalsy();
    });

    it('should validate required fields', () => {
      const firstNameControl = component.registerForm.get('firstName');
      const lastNameControl = component.registerForm.get('lastName');
      const usernameControl = component.registerForm.get('username');
      
      firstNameControl?.setValue('');
      expect(firstNameControl?.errors?.['required']).toBeTruthy();
      
      lastNameControl?.setValue('');
      expect(lastNameControl?.errors?.['required']).toBeTruthy();
      
      usernameControl?.setValue('');
      expect(usernameControl?.errors?.['required']).toBeTruthy();
    });
  });

  describe('Form Actions', () => {
    it('should reset form when onReset is called', () => {
      // Fill form with valid data
      component.registerForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
        termsAccepted: true
      });
      
      // Verify form is filled
      expect(component.registerForm.get('email')?.value).toBe('test@example.com');
      
      // Reset form
      component.onReset();
      
      // Verify all fields are reset
      expect(component.registerForm.get('username')?.value).toBeFalsy();
      expect(component.registerForm.get('email')?.value).toBeFalsy();
      expect(component.registerForm.get('password')?.value).toBeFalsy();
      expect(component.registerForm.get('confirmPassword')?.value).toBeFalsy();
      expect(component.registerForm.get('firstName')?.value).toBeFalsy();
      expect(component.registerForm.get('lastName')?.value).toBeFalsy();
      expect(component.registerForm.get('termsAccepted')?.value).toBeFalsy();
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });

    it('should handle successful registration', () => {
      spyOn(authService, 'register').and.returnValue({ success: true, message: 'Registro exitoso' });
      
      component.registerForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
        termsAccepted: true
      });
      
      component.onSubmit();
      
      expect(component.successMessage).toBe('Registro exitoso. Redirigiendo al login...');
    });

    it('should handle registration error', () => {
      spyOn(authService, 'register').and.returnValue({ success: false, message: 'Usuario ya existe' });
      
      component.registerForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!',
        termsAccepted: true
      });
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Usuario ya existe');
    });
  });
}); 