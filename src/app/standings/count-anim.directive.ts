import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[countAnim]',
  standalone: true,
})
export class CountAnimDirective implements OnInit, OnChanges {
  @Input('countAnim') value: number | null | undefined;
  @Input() countAnimDuration = 900; // ms (slower default)
  @Input() countAnimFlash = true;
  @Input() countAnimTrend = true; // apply up/down styling
  @Input() countAnimStagger = false; // small random delay to desync many cells

  private previous: number | null | undefined;
  private animating = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.previous = this.toNumber(this.value) ?? 0;
    this.setText(this.previous);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes) {
      const next = this.toNumber(this.value) ?? 0;
      const prev = this.toNumber(this.previous) ?? 0;
      if (this.previous === undefined) {
        this.previous = next;
        this.setText(next);
        return;
      }
      if (next !== prev) {
        this.animate(prev, next);
        this.previous = next;
      }
    }
  }

  private toNumber(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  private setText(n: number) {
    this.el.nativeElement.textContent = String(n);
  }

  private animate(from: number, to: number) {
    if (this.animating) return; // simple guard
    const startAnim = () => {
      this.animating = true;
      const start = performance.now();
      const dur = this.countAnimDuration;
      const diff = to - from;
      const el = this.el.nativeElement;
      const trendClass = diff > 0 ? 'count-up' : diff < 0 ? 'count-down' : null;
      this.renderer.addClass(el, 'count-animating');
      if (trendClass && this.countAnimTrend)
        this.renderer.addClass(el, trendClass);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        // easeOutBack for a lively pop
        const easeOutBack = (x: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        };
        const eased = easeOutBack(t);
        const current = Math.round(from + diff * eased);
        this.setText(current);
        if (t < 1) requestAnimationFrame(step);
        else {
          this.setText(to);
          this.animating = false;
          this.renderer.removeClass(el, 'count-animating');
          if (trendClass) this.renderer.removeClass(el, trendClass);
        }
      };
      requestAnimationFrame(step);
      if (this.countAnimFlash) this.flash(diff);
    };
    if (this.countAnimStagger) {
      const delay = Math.random() * 120; // small desync
      setTimeout(startAnim, delay);
    } else {
      startAnim();
    }
  }

  private flash(diff?: number) {
    const el = this.el.nativeElement;
    this.renderer.addClass(el, 'count-flash');
    if (typeof diff === 'number' && diff !== 0) {
      // brief scale accent immediately
      this.renderer.addClass(el, 'count-pop');
    }
    setTimeout(() => {
      this.renderer.removeClass(el, 'count-flash');
      this.renderer.removeClass(el, 'count-pop');
    }, Math.min(1200, this.countAnimDuration + 500));
  }
}
