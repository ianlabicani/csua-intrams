import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'csua-intrams';
}
