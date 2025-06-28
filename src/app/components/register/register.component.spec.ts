import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated', 'validatePassword']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    expect(component.registerForm.get('termsAccepted')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    
    // Marcar campos como tocados
    form.get('firstName')?.markAsTouched();
    form.get('lastName')?.markAsTouched();
    form.get('username')?.markAsTouched();
    form.get('email')?.markAsTouched();
    form.get('password')?.markAsTouched();
    form.get('confirmPassword')?.markAsTouched();
    form.get('termsAccepted')?.markAsTouched();
    
    expect(form.get('firstName')?.hasError('required')).toBeTruthy();
    expect(form.get('lastName')?.hasError('required')).toBeTruthy();
    expect(form.get('username')?.hasError('required')).toBeTruthy();
    expect(form.get('email')?.hasError('required')).toBeTruthy();
    expect(form.get('password')?.hasError('required')).toBeTruthy();
    expect(form.get('confirmPassword')?.hasError('required')).toBeTruthy();
    expect(form.get('termsAccepted')?.hasError('required')).toBeTruthy();
  });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
      
    expect(emailControl?.hasError('email')).toBeTruthy();
    });

  it('should validate username pattern', () => {
    const usernameControl = component.registerForm.get('username');
    usernameControl?.setValue('user@name');
    usernameControl?.markAsTouched();
    
    expect(usernameControl?.hasError('pattern')).toBeTruthy();
    });

  it('should validate minimum length for names', () => {
    const firstNameControl = component.registerForm.get('firstName');
    firstNameControl?.setValue('a');
    firstNameControl?.markAsTouched();
    
    expect(firstNameControl?.hasError('minlength')).toBeTruthy();
    });

  it('should validate maximum length for names', () => {
      const firstNameControl = component.registerForm.get('firstName');
    firstNameControl?.setValue('a'.repeat(51));
    firstNameControl?.markAsTouched();
    
    expect(firstNameControl?.hasError('maxlength')).toBeTruthy();
  });

  it('should validate password match', () => {
    const form = component.registerForm;
    form.patchValue({
      password: 'TestPass123!',
      confirmPassword: 'DifferentPass123!'
    });
    
    form.get('confirmPassword')?.markAsTouched();
    
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBeTruthy();
    });

  it('should not show mismatch error when passwords match', () => {
    const form = component.registerForm;
    form.patchValue({
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    });
    
    form.get('confirmPassword')?.markAsTouched();
    
    expect(form.get('confirmPassword')?.hasError('mismatch')).toBeFalsy();
  });

  it('should show correct error messages', () => {
    const form = component.registerForm;
    form.get('firstName')?.markAsTouched();
    form.get('email')?.setValue('invalid-email');
    form.get('email')?.markAsTouched();
    
    expect(component.getErrorMessage('firstName')).toBe('Este campo es requerido');
    expect(component.getErrorMessage('email')).toBe('Ingrese un email válido');
    });

    it('should handle successful registration', () => {
    authService.register.and.returnValue({ success: true, message: 'Usuario registrado exitosamente' });
    authService.isAuthenticated.and.returnValue(false);
      
      component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
        termsAccepted: true
      });
      
      component.onSubmit();
      
    expect(authService.register).toHaveBeenCalledWith('johndoe', 'john@example.com', 'TestPass123!', 'John', 'Doe');
      expect(component.successMessage).toBe('Registro exitoso. Redirigiendo al login...');
    });

  it('should handle failed registration', () => {
    authService.register.and.returnValue({ success: false, message: 'El usuario ya existe' });
    authService.isAuthenticated.and.returnValue(false);
      
      component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'existinguser',
      email: 'john@example.com',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
        termsAccepted: true
      });
      
      component.onSubmit();
      
    expect(component.errorMessage).toBe('El usuario ya existe');
    });

  it('should not submit if form is invalid', () => {
    component.registerForm.patchValue({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    });
    
    component.onSubmit();
    
    expect(authService.register).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Por favor, complete todos los campos correctamente');
  });

  it('should redirect to dashboard if already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should reset form correctly', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      termsAccepted: true
    });
    
    component.errorMessage = 'Some error';
    component.successMessage = 'Some success';
    
    component.onReset();
    
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });
}); 