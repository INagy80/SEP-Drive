import { Injectable } from '@angular/core';
import {environment} from '../../eviroments/environment';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeldKontoService {

  private readonly geldKonto = `${environment.api.baseUrl}/${environment.api.geldKonto}`;


  constructor(
    private http: HttpClient
  ) { }


  getMyBalance(): Observable<number> {
    return this.http.get<number>(`${this.geldKonto}/getMyBalance`, {})
  }

  addBalance(amount: number): Observable<number> {
    return this.http.put<number>(`${this.geldKonto}/addBalance/${amount}`, {})
  }

}
