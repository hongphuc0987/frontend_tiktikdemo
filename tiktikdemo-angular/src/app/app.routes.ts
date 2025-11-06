// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(h => h.HomeComponent)
  },
  {
  path: 'register',
  loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
  path: 'verify',
  loadComponent: () => import('./components/verify/verify').then(m => m.VerifyEmailComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
