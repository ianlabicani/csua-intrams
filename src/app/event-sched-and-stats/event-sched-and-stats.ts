import { Component } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-event-sched-and-stats',
  imports: [CommonModule],
  templateUrl: './event-sched-and-stats.html',
  styleUrl: './event-sched-and-stats.css',
})
export class EventSchedAndStats {
  schedule$!: Observable<any[]>;

  constructor(private firestore: Firestore) {
    const schedCollection = collection(this.firestore, 'schedule');
    this.schedule$ = collectionData(schedCollection, { idField: 'id' }).pipe(
      map((rows: any[]) =>
        [...rows].sort((a, b) => {
          return (
            (a.sport || '').localeCompare(b.sport || '') ||
            (a.category || '').localeCompare(b.category || '') ||
            (a.event || '').localeCompare(b.event || '') ||
            (a.game || 0) - (b.game || 0)
          );
        })
      )
    );
  }

  trackRow(_index: number, row: any) {
    return (
      row.id ||
      row.game + '|' + row.sport + '|' + row.category + '|' + row.event
    );
  }
}
