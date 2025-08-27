import { Component, computed, input, signal } from '@angular/core';
import { CountAnimDirective } from '../count-anim.directive';
import { ICollege } from '../../admin/colleges/colleges';

@Component({
  selector: 'app-collapsible-categories',
  imports: [CountAnimDirective],
  templateUrl: './collapsible-categories.html',
  styleUrl: './collapsible-categories.css',
})
export class CollapsibleCategories {
  colleges = input<ICollege[]>([]);

  eventExpanded = signal<Set<string>>(new Set());
  categoryExpanded = signal<Set<string>>(new Set());
  categories = computed(() => {
    const map: Record<string, Record<string, any[]>> = {};
    this.colleges().forEach((c) => {
      Object.entries(c.events || {}).forEach(
        ([eventKey, ev]: [string, any]) => {
          const points = (ev && ev.points) || 0;
          // Skip unscored events (no points yet)
          if (points <= 0) return;
          const category = this.deriveCategory(eventKey);
          if (!map[category]) map[category] = {};
          if (!map[category][eventKey]) map[category][eventKey] = [];
          map[category][eventKey].push({
            event: eventKey,
            college: c.name,
            collegeId: c.id,
            points,
            gold: points === 5 ? 1 : 0,
            silver: points === 3 ? 1 : 0,
            bronze: points === 1 ? 1 : 0,
            color: (c as any).color || '',
          });
        }
      );
    });
    return Object.entries(map)
      .map(([category, eventsObj]) => ({
        category,
        events: Object.entries(eventsObj)
          .map(([eventName, rows]) => ({
            name: eventName,
            rows: (rows as any[])
              .sort(
                (a, b) =>
                  b.points - a.points || a.college.localeCompare(b.college)
              )
              .map((r, i) => ({ ...r, rank: i + 1 })),
          }))
          .filter((e) => e.rows.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter((cat) => cat.events.length > 0)
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  private deriveCategory(key: string): string {
    let base = key.replace(/[MW]$/, '');
    const cutIdx = base.search(/[0-9(]/);
    if (cutIdx !== -1) base = base.slice(0, cutIdx);
    base = base.replace(/-$/, '');
    return base || key;
  }

  isEventOpen(event: string) {
    return this.eventExpanded().has(event);
  }

  toggleEvent(event: string) {
    const set = new Set(this.eventExpanded());
    if (set.has(event)) set.delete(event);
    else set.add(event);
    this.eventExpanded.set(set);
  }

  isCategoryOpen(cat: string) {
    return this.categoryExpanded().has(cat);
  }

  toggleCategory(cat: string) {
    const set = new Set(this.categoryExpanded());
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    this.categoryExpanded.set(set);
  }

  expandAllCategories() {
    const set = new Set<string>();
    this.categories().forEach((c) => set.add(c.category));
    this.categoryExpanded.set(set);
  }
  collapseAllCategories() {
    this.categoryExpanded.set(new Set());
  }
}
