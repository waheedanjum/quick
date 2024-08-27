// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Directive, ElementRef, Output, EventEmitter, OnDestroy, NgZone } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

declare let bootstrap: {
  Tab: {
    getOrCreateInstance: (arg: string) => { show: () => void }
  }
}

export interface EventArg { type: string; target: Element; relatedTarget: Element; }

@Directive({
  selector: '[appBootstrapTab]',
  exportAs: 'bootstrap-tab'
})
export class BootstrapTabDirective implements OnDestroy {
  @Output()
  showBSTab = new EventEmitter<EventArg>();

  @Output()
  hideBSTab = new EventEmitter<EventArg>();

  private tabShownSubscription: Subscription;
  private tabHiddenSubscription: Subscription;

  constructor(private el: ElementRef, private zone: NgZone) {
    this.tabShownSubscription = fromEvent(this.el.nativeElement, 'show.bs.tab')
      .subscribe(e => {
        const arg = e as EventArg;
        this.runInZone(() => this.showBSTab.emit({ type: arg.type, target: arg.target, relatedTarget: arg.relatedTarget }));
      });

    this.tabHiddenSubscription = fromEvent(this.el.nativeElement, 'hidden.bs.tab')
      .subscribe(e => {
        const arg = e as EventArg;
        this.runInZone(() => this.hideBSTab.emit({ type: arg.type, target: arg.target, relatedTarget: arg.relatedTarget }));
      });
  }

  ngOnDestroy() {
    this.tabShownSubscription.unsubscribe();
    this.tabHiddenSubscription.unsubscribe();
  }

  private runInZone(delegate: () => void) {
    this.zone.run(() => {
      delegate();
    });
  }

  show(selector: string) {
    const tab = bootstrap.Tab.getOrCreateInstance(selector);
    setTimeout(() => tab.show());
  }
}
