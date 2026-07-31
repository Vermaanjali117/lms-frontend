import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  isLoading = signal(false);
  isSaving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  avatarPreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.pattern('^[0-9]{10}$')]],
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  get name() { return this.profileForm.get('name'); }
  get phone() { return this.profileForm.get('phone'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  user = this.authService.currentUser;

  passwordMatchValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  ngOnInit() {
    // Subscribe to signal changes!
    const user = this.authService.currentUser();

    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        phone: user.phone || ''
      });
    } else {
      // If user not loaded yet, call getMe first!
      this.authService.getMe().subscribe({
        next: () => {
          const loadedUser = this.authService.currentUser();
          if (loadedUser) {
            this.profileForm.patchValue({
              name: loadedUser.name,
              phone: loadedUser.phone || ''
            });
          }
        }
      });
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreview.set(e.target.result);
    };
    reader.readAsDataURL(file);
    this.selectedFile.set(file);
  }

  uploadAvatar() {
    if (!this.selectedFile()) return;

    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('avatar', this.selectedFile()!);

    this.http.post<any>(`${this.apiUrl}/upload/avatar`, formData)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.authService.getMe().subscribe();
          this.successMessage.set('Avatar updated successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Upload failed!');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  updateProfile() {
    // Logs FIRST!
    console.log('Form value:', this.profileForm.value);
    console.log('Form valid:', this.profileForm.valid);
    console.log('Name value:', this.profileForm.get('name')?.value);
    console.log('Name valid:', this.profileForm.get('name')?.valid);

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage.set('Please fill required fields!');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    this.isSaving.set(true);
    this.http.put<any>(`${this.apiUrl}/auth/update-profile`,
      this.profileForm.value)
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.authService.getMe().subscribe();
          this.successMessage.set('Profile updated successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.error?.message || 'Update failed!');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.http.put<any>(`${this.apiUrl}/auth/change-password`, {
      currentPassword: this.currentPassword?.value,
      newPassword: this.newPassword?.value
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.passwordForm.reset();
        this.successMessage.set('Password changed successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to change password!');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }
}
