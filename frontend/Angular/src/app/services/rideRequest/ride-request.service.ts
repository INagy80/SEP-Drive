import { Injectable } from '@angular/core';
import {environment} from '../../../eviroments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {edit, rideRequestDTO} from '../../models/rideRequestDTO';
import {rideResponse} from '../../models/rideResponse';
import {SimulationUpdate} from '../../models/simulation-state.model';
import {LatLng} from '../../models/rideRequestDTO';

@Injectable({
  providedIn: 'root'
})
export class RideRequestService {

  private readonly rideRequestUrl = `${environment.api.baseUrl}/${environment.api.rideRequestUrl}`;
  private readonly simulationUrl = `${environment.api.baseUrl}/${environment.api.simulations}`;



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

  updateRating(user:String, rideRequestId:number, rating:number)   {
    return this.http.put(`${this.rideRequestUrl}/updateRating/${user}/${rideRequestId}/${rating}`,{});

  }

  getAllactiverideRequests() : Observable<rideResponse[]> {
    return this.http.get<rideResponse[]>(`${this.rideRequestUrl}/getAllactiverideRequests`);
  }

  makeOffer(id : number) : Observable<any> {
    return this.http.put<any>(`${this.rideRequestUrl}/makeOffer/${id}`,{});
  }


  OfferRespond(id : number, isAccepted : boolean) : Observable<any> {
    return this.http.put<any>(`${this.rideRequestUrl}/OfferResponse/${id}/${isAccepted}`,{});
  }

  CancellMyOffer(id : number) : Observable<any> {
    return this.http.put<any>(`${this.rideRequestUrl}/CancellMyOffer/${id}`,{});
  }

  sendsumlationupdate(id : number, SimulationUpdate: SimulationUpdate, hasEnded: boolean ) : Observable<any> {
    return this.http.put<any>(`${this.simulationUrl}/simulation/${id}/${hasEnded}`,SimulationUpdate);
  }
  refreshsumilation(id : number) : Observable<any> {
    return this.http.get<any>(`${this.simulationUrl}/refreshsumilation/${id}`,{});
  }

  liveEdit(edit: edit): Observable<any> {
    return this.http.put(`${this.rideRequestUrl}/LiveEdit`, edit);
  }

  setZwischenStoppAsPassed(stop: LatLng): Observable<any> {
    return this.http.put(`${this.rideRequestUrl}/markAsPassed`, {stop});
  }

}
