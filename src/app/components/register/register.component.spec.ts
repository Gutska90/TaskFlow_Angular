import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        RegisterComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
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
      
      // Too short password
      passwordControl?.setValue('abc12');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      
      // Too long password
      passwordControl?.setValue('abcdefghijklmnopqrstuvwxyz');
      expect(passwordControl?.errors?.['maxlength']).toBeTruthy();
      
      // Missing number
      passwordControl?.setValue('abcdefgH');
      expect(passwordControl?.errors?.['passwordRequirements']).toBeTruthy();
      
      // Missing uppercase
      passwordControl?.setValue('abcdefg1');
      expect(passwordControl?.errors?.['passwordRequirements']).toBeTruthy();
      
      // Valid password
      passwordControl?.setValue('abcdefG1');
      expect(passwordControl?.errors).toBeNull();
    });

    it('should validate matching passwords', () => {
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      
      passwordControl?.setValue('ValidPass1');
      confirmPasswordControl?.setValue('DifferentPass1');
      expect(component.registerForm.errors?.['mismatch']).toBeTruthy();
      
      confirmPasswordControl?.setValue('ValidPass1');
      expect(component.registerForm.errors?.['mismatch']).toBeFalsy();
    });

    it('should validate minimum age requirement', () => {
      const birthDateControl = component.registerForm.get('birthDate');
      
      // Set date for someone who is 12 years old
      const twelveYearsAgo = new Date();
      twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 12);
      birthDateControl?.setValue(twelveYearsAgo.toISOString().split('T')[0]);
      expect(birthDateControl?.errors?.['minAge']).toBeTruthy();
      
      // Set date for someone who is 14 years old
      const fourteenYearsAgo = new Date();
      fourteenYearsAgo.setFullYear(fourteenYearsAgo.getFullYear() - 14);
      birthDateControl?.setValue(fourteenYearsAgo.toISOString().split('T')[0]);
      expect(birthDateControl?.errors).toBeNull();
    });
  });

  describe('Form Actions', () => {
    it('should reset form when onReset is called', () => {
      // Fill form with valid data
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass1',
        confirmPassword: 'ValidPass1',
        birthDate: '2000-01-01',
        shippingAddress: '123 Test St',
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
      expect(component.registerForm.get('birthDate')?.value).toBeFalsy();
      expect(component.registerForm.get('shippingAddress')?.value).toBeFalsy();
      expect(component.registerForm.get('termsAccepted')?.value).toBeFalsy();
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });
  });
}); 