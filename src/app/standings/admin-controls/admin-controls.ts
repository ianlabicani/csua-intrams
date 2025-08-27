import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-controls',
  imports: [RouterLink],
  templateUrl: './admin-controls.html',
  styleUrl: './admin-controls.css',
})
export class AdminControls {
  protected auth = inject(Auth);
}
