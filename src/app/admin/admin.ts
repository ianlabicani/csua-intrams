import { Component, inject } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private auth = inject(Auth);
  private router = inject(Router);

  async logout() {
    await signOut(this.auth);
    console.log('✅ Logged out');
    // Optionally route to login page
    this.router.navigate(['/standings']);
  }
}
