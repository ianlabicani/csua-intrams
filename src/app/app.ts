import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  auth = inject(Auth);
  router = inject(Router);
  protected title = 'csua-intrams';

  currentUser = signal<User | null>(null);

  ngOnInit(): void {
    authState(this.auth).subscribe((user) => {
      this.currentUser.set(user);
    });
  }

  isAdminRoute() {
    return this.router.url.startsWith('/admin');
  }
}
