import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminControls } from './admin-controls/admin-controls';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminControls],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'csua-intrams';
}
