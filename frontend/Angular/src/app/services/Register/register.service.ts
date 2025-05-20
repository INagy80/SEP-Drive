import { Injectable } from '@angular/core';
import {environment} from '../../../eviroments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TwoFaRequest} from '../../models/two-fa-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import {kundeDto} from '../../models/kunde-dto';
import { FahrerDTO} from '../../models/fahrerDTO';


@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly kundeUrl = `${environment.api.baseUrl}/${environment.api.kunderegisterUrl}`;
  private readonly fahrerUrl = `${environment.api.baseUrl}/${environment.api.fahrerregisterUrl}`;
  private readonly kundeWithImageUrl = `${environment.api.baseUrl}/${environment.api.kunderegisterWithImageUrl}`;
  private readonly fahrerWithImageUrl = `${environment.api.baseUrl}/${environment.api.fahrerregisterWithImageUrl}`;


  private readonly TwofaUrl =  `${environment.api.baseUrl}/${environment.api.TwoFAUrl}`

  constructor(
    private http: HttpClient
  ) { }

  kunderegister(request: kundeDto): Observable<boolean> {
    return this.http.post<boolean>(this.kundeUrl, request);
  }

  fahrerregister(request: FahrerDTO): Observable<boolean> {
    return this.http.post<boolean>(this.fahrerUrl, request);
  }

  addKundeWithImage(form: FormData) : Observable<boolean> {
    return this.http.post<boolean>(this.kundeWithImageUrl,  form);
  }

  addfahrerWithImage(form: FormData) : Observable<boolean> {
    return this.http.post<boolean>(this.fahrerWithImageUrl,  form);
  }







}
