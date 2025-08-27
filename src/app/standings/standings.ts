import { Component, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { ICollege } from '../admin/colleges/colleges';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { CollapsibleCategories } from './collapsible-categories/collapsible-categories';
import { MedalStandings } from './medal-standings/medal-standings';
import { PointsBasedRanking } from './points-based-ranking/points-based-ranking';
export interface IMedal {
  silver: number;
  gold: number;
  bronze: number;
  name: string;
  id: string;
}
@Component({
  selector: 'app-standings',
  imports: [CollapsibleCategories, MedalStandings, PointsBasedRanking],
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
}
