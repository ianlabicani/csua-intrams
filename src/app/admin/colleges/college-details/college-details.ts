import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

interface EventData {
  playerCount: number;
  points: number;
}

interface CollegeDoc {
  name: string;
  color: string;
  events: { [key: string]: EventData };
}

type Medal = 'gold' | 'silver' | 'bronze' | 'none';

const MEDAL_POINTS: Record<Exclude<Medal, 'none'>, number> = {
  gold: 5,
  silver: 3,
  bronze: 1,
};

@Component({
  selector: 'app-college-details',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './college-details.html',
  styleUrl: './college-details.css',
})
export class CollegeDetails {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  collegeId = signal<string>('');
  college = signal<CollegeDoc | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  expanded = signal<Set<string>>(new Set());

  form = this.fb.group({});

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No college id.');
      return;
    }
    this.collegeId.set(id);
    const ref = doc(this.firestore, 'colleges', id);
    docData(ref)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.college.set(data as CollegeDoc);
          // build form controls for each event points
          const events = (data as any).events || {};
          Object.entries(events).forEach(([key, ev]: [string, any]) => {
            this.form.addControl(
              key,
              this.fb.control(ev.points, { nonNullable: true })
            );
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load college');
          this.loading.set(false);
        },
      });
  }

  totalPoints(): number {
    const c = this.college();
    if (!c) return 0;
    return Object.values(c.events || {}).reduce(
      (sum, ev: any) => sum + (ev.points || 0),
      0
    );
  }

  async setMedal(eventKey: string, medal: Medal) {
    const ctrl = this.form.get(eventKey);
    if (!ctrl) return;
    if (medal === 'none') {
      ctrl.setValue(0);
    } else {
      ctrl.setValue(MEDAL_POINTS[medal]);
    }
    ctrl.markAsDirty();
    // Auto-save after setting medal
    await this.save();
  }

  currentMedal(points: number): Medal {
    if (points === 5) return 'gold';
    if (points === 3) return 'silver';
    if (points === 1) return 'bronze';
    return 'none';
  }

  async save() {
    if (!this.form.valid) return;
    const id = this.collegeId();
    const ref = doc(this.firestore, 'colleges', id);
    const current = this.college();
    if (!current) return;
    const updatedEvents: any = { ...current.events };
    Object.keys(this.form.controls).forEach((k) => {
      if (!updatedEvents[k]) updatedEvents[k] = { playerCount: 0, points: 0 };
      updatedEvents[k].points = this.form.get(k)?.value ?? 0;
    });
    try {
      this.saving.set(true);
      await updateDoc(ref, { events: updatedEvents });
      this.college.set({ ...current, events: updatedEvents });
      this.form.markAsPristine();
    } catch (e: any) {
      this.error.set(e.message || 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  // Group events by first word
  groupedEvents(): {
    category: string;
    events: { key: string; data: EventData }[];
  }[] {
    const c = this.college();
    if (!c?.events) return [];
    const groups: Record<string, { key: string; data: EventData }[]> = {};
    Object.entries(c.events).forEach(([key, data]) => {
      const category = this.deriveCategory(key);
      if (!groups[category]) groups[category] = [];
      groups[category].push({ key, data });
    });
    return Object.entries(groups)
      .map(([category, events]) => ({
        category,
        events: [...events].sort((a, b) => a.key.localeCompare(b.key)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  private deriveCategory(key: string): string {
    // Remove trailing gender letter
    let base = key.replace(/[MW]$/, '');
    // Find first digit or parenthesis
    const cutIdx = base.search(/[0-9(]/);
    if (cutIdx !== -1) {
      base = base.slice(0, cutIdx);
    }
    // Trim trailing dash
    base = base.replace(/-$/, '');
    return base || key; // fallback to original if empty
  }

  toggleCategory(cat: string) {
    const set = new Set(this.expanded());
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    this.expanded.set(set);
  }

  isExpanded(cat: string): boolean {
    return this.expanded().has(cat);
  }
}
