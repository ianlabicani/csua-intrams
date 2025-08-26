import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  authState,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
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

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email!,
          password!
        );

        if (userCredential.user) {
          this.router.navigate(['/admin']);
        }
      } catch (err) {
        console.error('❌ Login failed:', err);
      }
    }
  }
}
