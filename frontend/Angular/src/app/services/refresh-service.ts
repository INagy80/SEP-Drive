// refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SimulationUpdate } from '../models/simulation-state.model';

@Injectable({ providedIn: 'root' })
export class RefreshService {
  private _refreshOffers = new Subject<void>();
  refreshOffers$ = this._refreshOffers.asObservable();

  private _refreshrejectedOffers = new Subject<void>();
  refreshrejectedOffers$ = this._refreshrejectedOffers.asObservable();

  private _simulationUpdate = new Subject<void>();
  simulationUpdate$ = this._simulationUpdate.asObservable();

  private _simulationrefresh = new Subject<void>();
  simulationrefresh$ = this._simulationrefresh.asObservable();

  private _simulationUpdatePayload = new Subject<SimulationUpdate>();
  simulationUpdatePayload$ = this._simulationUpdatePayload.asObservable();

  private _refreshAfterSimulationEnds = new Subject<number>();
  refreshAfterSimulationEnds$ = this._refreshAfterSimulationEnds.asObservable();


  private _refreshStartSimulationEnds = new Subject<void>();
  refreshStartSimulationEnds$ = this._refreshStartSimulationEnds.asObservable();


  private _refreshEditSimulation = new Subject<void>();
  refreshEditSimulation$ = this._refreshEditSimulation.asObservable();



  notifyOffersRefresh() {
    this._refreshOffers.next();
  }

  notifyRejectedOffersRefresh() {
    this._refreshrejectedOffers.next();
  }

  updateSimulation(): void {
    this._simulationUpdate.next();
  }

  refreshSimulation(): void {
    this._simulationrefresh.next();
  }

  updateSimulationWithPayload(update: SimulationUpdate): void {
    this._simulationUpdatePayload.next(update);
  }


  notifyAfterSimulationEnds(rideId: number): void {
    this._refreshAfterSimulationEnds.next(rideId);
  }

  notifyStartSimulationEnds() {
    this._refreshStartSimulationEnds.next();
  }

  refreshEditSimulation() {
    this._refreshEditSimulation.next();
  }

}
