import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { IMedal } from '../admin/medals/medals';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-standings',
  imports: [RouterLink],
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  private firestore = inject(Firestore);
  auth = inject(Auth);
  private medalsRef = collection(this.firestore, 'medals');
  medals = signal<IMedal[]>([]);

  ngOnInit(): void {
    this.getMedals().subscribe((medals) => {
      this.medals.set(medals);
    });
  }

  getMedals(): Observable<IMedal[]> {
    return collectionData(this.medalsRef, { idField: 'id' }) as Observable<
      IMedal[]
    >;
  }
  // Compute standings dynamically
  rows = computed(() =>
    [...this.medals()]
      .map((m) => ({
        ...m,
        total: m.gold + m.silver + m.bronze,
      }))
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold; // gold first
        if (b.silver !== a.silver) return b.silver - a.silver; // then silver
        return b.bronze - a.bronze; // then bronze
      })
      .map((m, i) => ({
        ...m,
        rank: i + 1,
        // assign colors (optional, can be dynamic or fixed palette)
        color: this.colors[i % this.colors.length],
      }))
  );

  private colors = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#6366f1',
    '#ec4899',
    '#14b8a6',
    '#8b5cf6',
  ];
}
