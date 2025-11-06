// src/app/components/verify-email/verify-email.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environment/environment';

interface VerifyResponse {
  code: number;
  message: string;
}

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';
  userId = '';
  token = '';

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.userId || !this.token) {
      this.status = 'error';
      this.message = 'Liên kết xác thực không hợp lệ.';
      return;
    }

    this.verifyEmail();
  }

  verifyEmail() {
    const url = `${environment.apiUrl}/users/verify?userId=${this.userId}&token=${this.token}`;
    
    this.http.get<VerifyResponse>(url).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.status = 'success';
          this.message = res.message || 'Email của bạn đã được xác thực thành công!';
        } else {
          this.status = 'error';
          this.message = res.message || 'Xác thực thất bại.';
        }
      },
      error: (err) => {
        this.status = 'error';
        this.message = err.error?.message || 'Liên kết đã hết hạn hoặc không hợp lệ.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}