// src/app/components/register/register.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['female', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    address: [''],
    dob: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  loading = false;
  error = '';
  success = false;

  passwordMatchValidator(control: AbstractControl) {
    const p = control.get('password')?.value;
    const c = control.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';
    this.success = false;

    const { confirmPassword, ...data } = this.form.value;
    this.auth.register(data as any).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  get f() { return this.form.controls; }
}
