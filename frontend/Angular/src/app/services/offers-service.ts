import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../eviroments/environment';
import * as http from 'node:http';
import {rideResponse} from '../models/rideResponse';
import { Observable } from 'rxjs';
import {Offer} from '../components/fahrt-angebote/fahrt-angebote.component';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private readonly rideOfferstUrl = `${environment.api.baseUrl}/${environment.api.rideOffers}`;


  constructor( private http: HttpClient) { }


  getAllRideOffersForUser(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.rideOfferstUrl}/getAllRideOffersForUser`);
  }

}
