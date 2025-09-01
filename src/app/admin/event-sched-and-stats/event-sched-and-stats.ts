import { Component } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { Observable, map, firstValueFrom, tap } from 'rxjs';
import { collectionData as colData } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { SchedSeeder } from './sched-seeder/sched-seeder';

@Component({
  selector: 'app-admin-event-sched-and-stats',
  imports: [CommonModule, ReactiveFormsModule, SchedSeeder],
  templateUrl: './event-sched-and-stats.html',
  styleUrl: './event-sched-and-stats.css',
})
export class EventSchedAndStats {
  schedule$!: Observable<any[]>;
  colleges$!: Observable<any[]>;
  private colorByAcronym: Record<string, string> = {};

  form = new FormGroup({
    sport: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    category: new FormControl('', { nonNullable: true }),
    event: new FormControl('', { nonNullable: true }), // optional usage
    game: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    type: new FormControl<'h2h' | 'multi'>('h2h', { nonNullable: true }),
    teams: new FormArray<FormControl<string>>([
      new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    ]),
  });

  constructor(private firestore: Firestore) {
    const schedCollection = collection(this.firestore, 'schedule');
    const collegesRef = collection(this.firestore, 'colleges-new');
    this.colleges$ = colData(collegesRef, { idField: 'id' }).pipe(
      tap((list: any[]) => {
        this.colorByAcronym = {};
        list.forEach((c: any) => {
          const acr = this.acronym(c.name || '').trim();
          if (acr)
            this.colorByAcronym[acr] =
              c.color || this.colorByAcronym[acr] || '';
        });
      })
    );
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

  get teamsArray() {
    return this.form.get('teams') as FormArray<FormControl<string>>;
  }

  addTeamField() {
    // Additional team fields are optional; we'll validate count manually.
    this.teamsArray.push(
      new FormControl('', {
        nonNullable: true,
      })
    );
  }

  removeTeamField(i: number) {
    if (this.teamsArray.length > 2) {
      this.teamsArray.removeAt(i);
    }
  }

  onTypeChange() {
    const type = this.form.get('type')!.value;
    // For head-to-head enforce exactly 2 inputs
    if (type === 'h2h') {
      while (this.teamsArray.length > 2)
        this.teamsArray.removeAt(this.teamsArray.length - 1);
      while (this.teamsArray.length < 2)
        this.teamsArray.push(
          new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
          })
        );
    } else if (type === 'multi') {
      // Ensure at least 3 slots to hint multiple teams
      if (this.teamsArray.length < 3) this.addTeamField();
    }
  }

  async addSchedule() {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    let teams: string[] = [];
    if (raw.type === 'multi') {
      // Auto-include all colleges (unique, non-empty)
      const colleges = await firstValueFrom(this.colleges$);
      teams = colleges
        .map((c: any) => this.acronym((c.name || '').trim()))
        .filter((v: string) => !!v);
      teams = [...new Set(teams)];
    } else {
      // h2h - take the two selected colleges
      teams = this.teamsArray.controls
        .map((c) => c.value.trim())
        .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
    }
    if (teams.length < 2) return; // safety
    const payload: any = {
      sport: raw.sport.trim(),
      category: raw.category?.trim() || '-',
      event: raw.event?.trim() || null,
      game: raw.game,
      teams,
      winner: null,
      createdAt: Date.now(),
      type: raw.type,
    };
    const schedCollection = collection(this.firestore, 'schedule');
    await addDoc(schedCollection, payload);
    // reset but keep type
    const keepType = raw.type;
    this.form.reset({
      type: keepType,
      sport: '',
      category: '',
      event: '',
      game: null,
    });
    // reset teams controls
    while (this.teamsArray.length) this.teamsArray.removeAt(0);
    if (keepType === 'h2h') {
      this.teamsArray.push(
        new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
      this.teamsArray.push(
        new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
    }
  }

  trackRow(_index: number, row: any) {
    return (
      row.id ||
      row.game + '|' + row.sport + '|' + row.category + '|' + row.event
    );
  }

  async updateWinner(row: any, winner: string | null) {
    if (!row?.id) return;
    const ref = doc(this.firestore, 'schedule', row.id);
    await updateDoc(ref, { winner: winner || null, updatedAt: Date.now() });
  }

  async clearWinner(row: any) {
    await this.updateWinner(row, null);
  }

  async deleteSchedule(row: any) {
    if (!row?.id) return;
    const ok = confirm(`Delete schedule entry: ${row.sport} G${row.game}?`);
    if (!ok) return;
    const ref = doc(this.firestore, 'schedule', row.id);
    await deleteDoc(ref);
  }

  canSubmit(): boolean {
    const sportValid = this.form.get('sport')?.valid;
    const gameValid = this.form.get('game')?.valid;
    if (!sportValid || !gameValid) return false;
    const type = this.form.get('type')?.value || 'h2h';
    if (type === 'multi') {
      // Rely on presence of at least 2 colleges; assume true here (data driven)
      return true;
    }
    const teams = this.teamsArray.controls
      .map((c) => c.value.trim())
      .filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);
    return teams.length === 2;
  }

  acronym(raw: string): string {
    if (!raw) return '';
    const stop = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'at', 'de']);
    return raw
      .split(/[_\s]+/)
      .filter((p) => p && !stop.has(p.toLowerCase()))
      .map((p) => p[0].toUpperCase())
      .join('');
  }

  isCollegeSelectable(name: string, index: number): boolean {
    if (!name) return false;
    const target = this.acronym(name).trim();
    const currentValue = this.teamsArray.at(index)?.value?.trim(); // already an acronym
    const chosen = this.teamsArray.controls
      .map((c, i) => (i === index ? null : c.value?.trim()))
      .filter((v): v is string => !!v);
    // Allow if acronym not chosen elsewhere OR it's the current control's value
    return !chosen.includes(target) || currentValue === target;
  }

  colorFor(acronym: string): string {
    return this.colorByAcronym[acronym] || '#475569'; // fallback slate
  }
}
