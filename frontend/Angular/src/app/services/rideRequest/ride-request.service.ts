import { Injectable } from '@angular/core';
import {environment} from '../../../eviroments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {rideRequestDTO} from '../../models/rideRequestDTO';
import {rideResponse} from '../../models/rideResponse';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  private readonly rideRequestUrl = `${environment.api.baseUrl}/${environment.api.rideRequestUrl}`;



  constructor( private http: HttpClient) {

  }

  create(request: rideRequestDTO): Observable<any> {

    return this.http.post(`${this.rideRequestUrl}/create`, request);
  }


  findAll() : Observable<rideRequestDTO[]> {
    return this.http.get<rideRequestDTO[]>(`${this.rideRequestUrl}/findAll`);
  }

  getAll() : Observable<rideResponse[]> {
    return this.http.get<rideResponse[]>(`${this.rideRequestUrl}/getAll`);
  }

  deletestatus()  {
    return this.http.put(`${this.rideRequestUrl}/deletestatus`,{});

  }

}
