import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  setDoc,
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export interface IMedal {
  silver: number;
  gold: number;
  bronze: number;
  name: string;
  id: string;
}

@Component({
  selector: 'app-medals',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './medals.html',
  styleUrl: './medals.css',
})
export class Medals implements OnInit {
  private firestore = inject(Firestore);

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

  async saveCollege(college: any) {
    const docRef = doc(this.firestore, 'medals', college.id);

    try {
      await updateDoc(docRef, {
        gold: college.gold,
        silver: college.silver,
        bronze: college.bronze,
      });
    } catch (e: any) {
      // If document doesn’t exist, create it
      await setDoc(docRef, {
        name: college.name,
        gold: college.gold,
        silver: college.silver,
        bronze: college.bronze,
      });
    }
  }
}
