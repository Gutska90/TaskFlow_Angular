import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    
    // Marcar campos como tocados
    form.get('username')?.markAsTouched();
    form.get('password')?.markAsTouched();
    
    expect(form.get('username')?.hasError('required')).toBeTruthy();
    expect(form.get('password')?.hasError('required')).toBeTruthy();
  });

  it('should validate minimum length for username', () => {
    const usernameControl = component.loginForm.get('username');
    usernameControl?.setValue('ab');
    usernameControl?.markAsTouched();
    
    expect(usernameControl?.hasError('minlength')).toBeTruthy();
  });

  it('should validate minimum length for password', () => {
    const passwordControl = component.loginForm.get('password');
    passwordControl?.setValue('12345');
    passwordControl?.markAsTouched();
    
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
  });

  it('should show error message for required fields', () => {
    const form = component.loginForm;
    form.get('username')?.markAsTouched();
    
    expect(component.getErrorMessage('username')).toBe('Este campo es requerido');
  });

  it('should show error message for minlength validation', () => {
    const form = component.loginForm;
    form.get('username')?.setValue('ab');
    form.get('username')?.markAsTouched();
    
    expect(component.getErrorMessage('username')).toBe('Mínimo 3 caracteres');
  });

  it('should detect form errors correctly', () => {
    const form = component.loginForm;
    form.get('username')?.setValue('');
    form.get('username')?.markAsTouched();
    
    expect(component.hasError('username')).toBeTruthy();
  });

  it('should handle successful login', () => {
    authService.login.and.returnValue({ success: true, message: 'Login exitoso' });
    authService.isAuthenticated.and.returnValue(false);
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass123',
      rememberMe: false
    });
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('testuser', 'testpass123', false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle failed login', () => {
    authService.login.and.returnValue({ success: false, message: 'Credenciales inválidas' });
    authService.isAuthenticated.and.returnValue(false);
    
    component.loginForm.patchValue({
      username: 'wronguser',
      password: 'wrongpass',
      rememberMe: false
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Credenciales inválidas');
  });

  it('should not submit if form is invalid', () => {
    component.loginForm.patchValue({
      username: '',
      password: '',
      rememberMe: false
    });
    
    component.onSubmit();
    
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard if already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
}); 