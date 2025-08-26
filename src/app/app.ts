import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  protected title = 'csua-intrams';

  ngOnInit(): void {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigate(['/admin']);
      }
    });
  }
}
