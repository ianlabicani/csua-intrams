import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ICollege {
  name: string;
  events: { [key: string]: IEvent };
  color: string;
  id: string;
  photo_url?: string; // logo / image URL
}

export interface IEvent {
  playerCount: number;
  points: number;
}

@Component({
  selector: 'app-colleges',
  imports: [CommonModule, RouterLink],
  templateUrl: './colleges.html',
  styleUrl: './colleges.css',
})
export class Colleges {
  private firestore = inject(Firestore);

  private collegesRef = collection(this.firestore, 'colleges-new');
  colleges = signal<ICollege[]>([]);

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => {
      this.colleges.set(colleges);
    });
  }

  getColleges(): Observable<ICollege[]> {
    return collectionData(this.collegesRef, { idField: 'id' }) as Observable<
      ICollege[]
    >;
  }

  totalPoints(college: ICollege): number {
    if (!college.events) return 0;
    let gold = 0,
      silver = 0,
      bronze = 0;
    Object.values(college.events).forEach((ev) => {
      const p = typeof ev.points === 'number' ? ev.points : 0;
      if (![5, 3, 1].includes(p)) return; // ignore other point values
      const pc =
        typeof ev.playerCount === 'number' && ev.playerCount > 0
          ? ev.playerCount
          : 1;
      if (p === 5) gold += pc;
      else if (p === 3) silver += pc;
      else if (p === 1) bronze += pc;
    });
    return gold * 5 + silver * 3 + bronze * 1;
  }

  // Build an acronym from a snake_case id, skipping common stop words (e.g. 'of')
  acronym(id: string): string {
    if (!id) return '';
    const stop = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'at', 'de']);
    return id
      .split(/[_\s]+/)
      .filter((part) => part && !stop.has(part.toLowerCase()))
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
