// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; // ← Thêm Router
import { BehaviorSubject, Observable, throwError, catchError, tap } from 'rxjs';
import { environment } from '../../environment/environment';
// ĐƯA INTERFACE RA NGOÀI CLASS
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

interface RegisterRequest {
  name: string;
  phoneNumber: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  password: string;
  address?: string;
  dob: string;
}

interface RegisterResponse {
  code: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/users`;

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  // ==================== LOGIN ====================
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(res => {
        if (res.code === 200) {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);

          const user = {
            id: res.data.userId,
            name: res.data.fullName,
            email: res.data.fullName,
            role: res.data.roleName
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
          this.router.navigate(['/home']);
        }
      }),
       catchError((error: HttpErrorResponse) => {
      // LẤY NGUYÊN MESSAGE TỪ BACKEND
      const backendMessage = error.error?.message;

      // Nếu có message → dùng nó
      // Nếu không → fallback
      const msg = backendMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại!';

      // Throw lại để component bắt
      return throwError(() => new Error(msg));
    })
  );
}

  // ==================== REGISTER ====================
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/create`, data).pipe(
      tap(res => {
        if (res.code === 200 || res.message?.toLowerCase().includes('success')) {
          // Không lưu token
        }
      }),
       catchError((error: HttpErrorResponse) => {
        // Trả về message từ backend trực tiếp
        const msg = error.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        return throwError(() => msg);
      })
    );
  }

  // ==================== UTILS ====================
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
  navigateToLogin() {
  this.router.navigate(['/login']);
}
}