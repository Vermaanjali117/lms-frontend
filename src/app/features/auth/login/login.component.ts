
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
public toastr = inject(ToastrService);
  // Reactive Form
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  // Getters for easy access in template
  get email() 
  { return this.loginForm.get('email'); 
    
  }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Redirect based on role
        const role = response.data.role;
        if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'instructor') {
          this.router.navigate(['/instructor/dashboard']);
        } else {
          this.router.navigate(['/student/dashboard']);
        }
        // Show success message
        this.toastr.success('Login successful!', 'Success');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed!';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
