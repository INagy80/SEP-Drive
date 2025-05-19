import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../eviroments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly customerUrl = `${environment.api.baseUrl}/${environment.api.userUrl}`;

  constructor(
    private http: HttpClient
  ) {
  }

//   findAll(): Observable<KundeDTO[]> {
//     return this.http.get<KundeDTO[]>(this.customerUrl);
//   }
//
//   registerCustomer(customer: KundeRegistrationRequest): Observable<void> {
//     return this.http.post<void>(this.customerUrl, customer);
//   }
//
//   deleteCustomer(id: number | undefined): Observable<void> {
//     return this.http.delete<void>(`${this.customerUrl}/${id}`);
//   }
//
//   updateCustomer(id: number | undefined, kunde: KundeRegistrationRequest): Observable<void> {
//     return this.http.put<void>(`${this.customerUrl}/${id}`, kunde);
//   }
// }
}
