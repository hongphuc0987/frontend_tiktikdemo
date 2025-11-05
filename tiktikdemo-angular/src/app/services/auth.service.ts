// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message: string;
  timestamp: number;
  data: {
    refreshToken: string;
    accessToken: string;
    userId: number;
    fullName: string;
    roleName: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/v1/users/signin'; // ← ĐÚNG

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe( // ← Không /login
      tap(res => {
        if (res.code === 200) {
          // Lưu token
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);

          // Lưu user
          const user = {
            id: res.data.userId,
            name: res.data.fullName,
            email: res.data.fullName, // backend dùng fullName = email
            role: res.data.roleName
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);

          // Chuyển hướng
          this.router.navigate(['/home']);
        }
      }),
      catchError(err => {
        const msg = err.error?.message?.includes('credentials')
          ? 'Email hoặc mật khẩu không đúng!'
          : 'Lỗi kết nối. Vui lòng thử lại.';
        throw new Error(msg);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}