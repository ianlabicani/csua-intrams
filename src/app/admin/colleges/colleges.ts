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

  private collegesRef = collection(this.firestore, 'colleges');
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

  eventCount(college: ICollege): number {
    return college.events ? Object.keys(college.events).length : 0;
  }

  totalPoints(college: ICollege): number {
    if (!college.events) return 0;
    return Object.values(college.events).reduce(
      (sum, ev) => sum + (ev.points || 0),
      0
    );
  }
}
