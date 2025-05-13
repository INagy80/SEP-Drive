import { Injectable } from '@angular/core';
import {environment} from '../../../eviroments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TwoFaRequest} from '../../models/two-fa-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import {kundeDto} from '../../models/kunde-dto';
import {fahrerDto} from '../../models/fahrerDTO';


@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly kundeUrl = `${environment.api.baseUrl}/${environment.api.kunderegisterUrl}`;
  private readonly fahrerUrl = `${environment.api.baseUrl}/${environment.api.fahrerregisterUrl}`;


  private readonly TwofaUrl =  `${environment.api.baseUrl}/${environment.api.TwoFAUrl}`

  constructor(
    private http: HttpClient
  ) { }

  kunderegister(request: kundeDto): Observable<boolean> {
    return this.http.post<boolean>(this.kundeUrl, request);
  }

  fahrerregister(request: fahrerDto): Observable<boolean> {
    return this.http.post<boolean>(this.fahrerUrl, request);
  }



  TwoFactorLogin(twoFaRequest: TwoFaRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(this.TwofaUrl, twoFaRequest);
  }
}
