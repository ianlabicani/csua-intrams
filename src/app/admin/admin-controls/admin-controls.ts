import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-controls',
  imports: [RouterLink],
  templateUrl: './admin-controls.html',
  styleUrl: './admin-controls.css',
})
export class AdminControls {
  protected auth = inject(Auth);

  router = inject(Router);

  get isDashboard(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
