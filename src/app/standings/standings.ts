import { Component, computed, inject, signal } from '@angular/core';
import { CountAnimDirective } from './count-anim.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { RouterLink } from '@angular/router';
import { IMedal } from '../admin/medals/medals';
import { ICollege } from '../admin/colleges/colleges';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-standings',
  imports: [RouterLink, CountAnimDirective],
  templateUrl: './standings.html',
  styleUrl: './standings.css',
})
export class Standings {
  private firestore = inject(Firestore);
  auth = inject(Auth);
  private medalsRef = collection(this.firestore, 'medals');
  private collegesRef = collection(this.firestore, 'colleges');
  medals = signal<IMedal[]>([]);
  colleges = signal<ICollege[]>([]);
  categoryExpanded = signal<Set<string>>(new Set());
  eventExpanded = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.getMedals().subscribe((medals) => this.medals.set(medals));
    this.getColleges().subscribe((colleges) => this.colleges.set(colleges));
  }

  getMedals(): Observable<IMedal[]> {
    return collectionData(this.medalsRef, { idField: 'id' }) as Observable<
      IMedal[]
    >;
  }
  getColleges(): Observable<ICollege[]> {
    return collectionData(this.collegesRef, { idField: 'id' }) as Observable<
      ICollege[]
    >;
  }
  // Compute standings dynamically
  rows = computed(() => {
    const medals = this.medals();
    const colleges = this.colleges();
    const zeroEntry = (c: ICollege) => ({
      id: (c as any).id,
      name: c.name,
      photo_url: (c as any).photo_url,
      gold: 0,
      silver: 0,
      bronze: 0,
    });
    let base: {
      id: string;
      name: string;
      gold: number;
      silver: number;
      bronze: number;
      photo_url?: string;
    }[];
    if (medals.length) {
      const medalMap = new Map<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          photo_url?: string;
        }
      >();
      medals.forEach((m) =>
        medalMap.set((m as any).id, {
          id: (m as any).id,
          name: (m as any).name,
          gold: m.gold,
          silver: m.silver,
          bronze: m.bronze,
          photo_url: (m as any).photo_url,
        })
      );
      // ensure every college appears
      colleges.forEach((c) => {
        if (!medalMap.has(c.id)) medalMap.set(c.id, zeroEntry(c));
      });
      base = [...medalMap.values()];
    } else {
      // Derive medal counts from college event points (5=gold,3=silver,1=bronze)
      const map: Record<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          photo_url?: string;
        }
      > = {};
      colleges.forEach((c) => {
        const events = (c as any).events || ({} as Record<string, any>);
        Object.values(events).forEach((ev: any) => {
          const p = ev?.points;
          if (![5, 3, 1].includes(p)) return;
          if (!map[c.id]) map[c.id] = zeroEntry(c);
          if (p === 5) map[c.id].gold++;
          else if (p === 3) map[c.id].silver++;
          else if (p === 1) map[c.id].bronze++;
        });
        if (!map[c.id]) map[c.id] = zeroEntry(c); // include even with no events
      });
      base = Object.values(map);
    }
    return base
      .map((m) => ({ ...m, total: m.gold + m.silver + m.bronze }))
      .sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.name.localeCompare(b.name);
      })
      .map((m, i) => ({
        ...m,
        rank: i + 1,
        color: this.colors[i % this.colors.length],
      }));
  });

  // Total medals ranking (by total medals, then gold, silver, bronze)
  totalMedalsRows = computed(() => {
    const medals = this.medals();
    const colleges = this.colleges();
    const zeroEntry = (c: ICollege) => ({
      id: (c as any).id,
      name: c.name,
      gold: 0,
      silver: 0,
      bronze: 0,
      totalMedals: 0,
      photo_url: (c as any).photo_url,
    });
    let list: {
      id: string;
      name: string;
      gold: number;
      silver: number;
      bronze: number;
      totalMedals: number;
      photo_url?: string;
    }[] = [];
    if (medals.length) {
      const map = new Map<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          totalMedals: number;
          photo_url?: string;
        }
      >();
      medals.forEach((m) =>
        map.set((m as any).id, {
          id: (m as any).id,
          name: (m as any).name,
          gold: m.gold,
          silver: m.silver,
          bronze: m.bronze,
          photo_url: (m as any).photo_url,
          totalMedals: m.gold + m.silver + m.bronze,
        })
      );
      colleges.forEach((c) => {
        if (!map.has(c.id)) map.set(c.id, zeroEntry(c));
      });
      list = [...map.values()];
    } else {
      // derive from events
      const agg: Record<
        string,
        {
          id: string;
          name: string;
          gold: number;
          silver: number;
          bronze: number;
          photo_url?: string;
        }
      > = {};
      colleges.forEach((c) => {
        const events = (c as any).events || ({} as Record<string, any>);
        Object.values(events).forEach((ev: any) => {
          const p = ev?.points;
          if (![5, 3, 1].includes(p)) return;
          if (!agg[c.id])
            agg[c.id] = {
              id: c.id,
              name: c.name,
              gold: 0,
              silver: 0,
              bronze: 0,
            };
          if (p === 5) agg[c.id].gold++;
          else if (p === 3) agg[c.id].silver++;
          else if (p === 1) agg[c.id].bronze++;
        });
        if (!agg[c.id])
          agg[c.id] = { id: c.id, name: c.name, gold: 0, silver: 0, bronze: 0 };
      });
      list = Object.values(agg).map((v) => ({
        ...v,
        totalMedals: v.gold + v.silver + v.bronze,
      }));
    }
    return list
      .sort((a, b) => {
        if (b.totalMedals !== a.totalMedals)
          return b.totalMedals - a.totalMedals;
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return a.name.localeCompare(b.name);
      })
      .map((m, i) => ({
        ...m,
        rank: i + 1,
        color: this.colors[i % this.colors.length],
      }));
  });

  // Overall points-based ranking (sum all event points per college)
  pointsRows = computed(() => {
    const colleges = this.colleges();
    const rows = colleges.map((c) => {
      const events = (c as any).events || ({} as Record<string, any>);
      let points = 0;
      let gold = 0,
        silver = 0,
        bronze = 0;
      Object.values(events).forEach((ev: any) => {
        const p = ev && typeof ev.points === 'number' ? ev.points : 0;
        points += p;
        if (p === 5) gold++;
        else if (p === 3) silver++;
        else if (p === 1) bronze++;
      });
      return {
        id: (c as any).id,
        name: c.name,
        points,
        gold,
        silver,
        bronze,
        photo_url: (c as any).photo_url,
      };
    });
    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      return a.name.localeCompare(b.name);
    });
    return rows.map((r, i) => ({
      ...r,
      rank: i + 1,
      color: this.colors[i % this.colors.length],
    }));
  });

  private colors = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#6366f1',
    '#ec4899',
    '#14b8a6',
    '#8b5cf6',
  ];

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

  // Derive category similar to college details page
  private deriveCategory(key: string): string {
    let base = key.replace(/[MW]$/, '');
    const cutIdx = base.search(/[0-9(]/);
    if (cutIdx !== -1) base = base.slice(0, cutIdx);
    base = base.replace(/-$/, '');
    return base || key;
  }

  // Build category -> events -> rows structure
  categories = computed(() => {
    const map: Record<string, Record<string, any[]>> = {};
    this.colleges().forEach((c) => {
      Object.entries(c.events || {}).forEach(
        ([eventKey, ev]: [string, any]) => {
          const category = this.deriveCategory(eventKey);
          if (!map[category]) map[category] = {};
          if (!map[category][eventKey]) map[category][eventKey] = [];
          const points = ev.points || 0;
          map[category][eventKey].push({
            event: eventKey,
            college: c.name,
            collegeId: c.id,
            points,
            gold: points === 5 ? 1 : 0,
            silver: points === 3 ? 1 : 0,
            bronze: points === 1 ? 1 : 0,
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
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  toggleCategory(cat: string) {
    const set = new Set(this.categoryExpanded());
    if (set.has(cat)) set.delete(cat);
    else set.add(cat);
    this.categoryExpanded.set(set);
  }
  isCategoryOpen(cat: string) {
    return this.categoryExpanded().has(cat);
  }

  toggleEvent(event: string) {
    const set = new Set(this.eventExpanded());
    if (set.has(event)) set.delete(event);
    else set.add(event);
    this.eventExpanded.set(set);
  }
  isEventOpen(event: string) {
    return this.eventExpanded().has(event);
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
