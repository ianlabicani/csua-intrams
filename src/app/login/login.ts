import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  authState,
} from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  fb = inject(FormBuilder);
  private auth = inject(Auth); // Firebase Auth instance
  private router = inject(Router); // Angular Router instance

  authState$ = authState(this.auth);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  authError = signal<string | null>(null);

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        this.authError.set(null);
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email!,
          password!
        );

        if (userCredential.user) {
          this.router.navigate(['/admin']);
        }
      } catch (err) {
        const code = (err as any)?.code as string | undefined;
        this.authError.set(this.messageForCode(code));
      }
    }
  }

  private messageForCode(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'That email address is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact an administrator.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait and try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and retry.';
      default:
        return 'Login failed. Please try again.';
    }
  }
}
