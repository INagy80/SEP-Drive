// refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private _refreshOffers = new Subject<void>();
  refreshOffers$ = this._refreshOffers.asObservable();

  notifyOffersRefresh() {
    this._refreshOffers.next();
  }
}
