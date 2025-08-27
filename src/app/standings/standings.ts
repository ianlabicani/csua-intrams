import { Component, computed, inject, signal } from '@angular/core';
import { CountAnimDirective } from './count-anim.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { IMedal } from '../admin/medals/medals';
import { ICollege } from '../admin/colleges/colleges';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { AdminControls } from './admin-controls/admin-controls';
import { CollapsibleCategories } from './collapsible-categories/collapsible-categories';
import { MedalStandings } from './medal-standings/medal-standings';
import { PointsBasedRanking } from './points-based-ranking/points-based-ranking';

@Component({
  selector: 'app-standings',
  imports: [
    AdminControls,
    CollapsibleCategories,
    MedalStandings,
    PointsBasedRanking,
  ],
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  private firestore = inject(Firestore);
  auth = inject(Auth);
  private collegesRef = collection(this.firestore, 'colleges');
  medals = signal<IMedal[]>([]);
  colleges = signal<ICollege[]>([]);
  categoryExpanded = signal<Set<string>>(new Set());
  eventExpanded = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.getColleges().subscribe((colleges) => this.colleges.set(colleges));
  }

  getColleges(): Observable<ICollege[]> {
    return collectionData(this.collegesRef, { idField: 'id' }) as Observable<
      ICollege[]
    >;
  }

  // Build event-centric tables (e.g., Arnis1M ... Arnis10M) filtered by prefix and gender
  eventSeries(
    prefix: string,
    gender: 'M' | 'W',
    range?: { from: number; to: number }
  ) {
    // Collect events across colleges
    const colleges = this.colleges();
    const entries: {
      event: string;
      college: string;
      collegeId: string;
      points: number;
      gold: number;
      silver: number;
      bronze: number;
    }[] = [];
    colleges.forEach((c) => {
      const events = c.events || ({} as any);
      Object.entries(events).forEach(([key, ev]: [string, any]) => {
        if (!key.startsWith(prefix)) return;
        if (!key.endsWith(gender)) return;
        // optional numeric slice
        if (range) {
          const numMatch = key.match(/(\d+)/);
          if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (num < range.from || num > range.to) return;
          }
        }
        entries.push({
          event: key,
          college: c.name,
          collegeId: c.id,
          points: ev.points || 0,
          gold: ev.points === 5 ? 1 : 0,
          silver: ev.points === 3 ? 1 : 0,
          bronze: ev.points === 1 ? 1 : 0,
        });
      });
    });
    // group by event -> ranking
    const grouped: Record<string, typeof entries> = {};
    entries.forEach((e) => {
      grouped[e.event] = grouped[e.event] || [];
      grouped[e.event].push(e);
    });
    return Object.entries(grouped)
      .map(([event, list]) => ({
        event,
        rows: list
          .sort(
            (a, b) => b.points - a.points || a.college.localeCompare(b.college)
          )
          .map((r, i) => ({ ...r, rank: i + 1 })),
      }))
      .sort((a, b) => a.event.localeCompare(b.event));
  }
}
