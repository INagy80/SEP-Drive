import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../eviroments/environment";
import {AuthenticationResponse} from "../../models/authentication-response";
import {AuthenticationRequest} from "../../models/authentication-request";
import {TwoFaRequest} from '../../models/two-fa-request';



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private readonly authUrl = `${environment.api.baseUrl}/${environment.api.authUrl}`;

  private readonly TwofaUrl =  `${environment.api.baseUrl}/${environment.api.TwoFAUrl}`

  constructor(
    private http: HttpClient
  ) { }

  login(authRequest: AuthenticationRequest): Observable<boolean> {
    return this.http.post<boolean>(this.authUrl, authRequest);
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  TwoFactorLogin(twoFaRequest: TwoFaRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(this.TwofaUrl, twoFaRequest);
  }


}
