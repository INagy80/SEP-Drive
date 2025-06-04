import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FahranfrageDto } from '../../models/fahranfrageDto';

@Injectable({
  providedIn: 'root'
})
export class FahranfragenService {
  private readonly apiUrl = 'http://localhost:8080/api/fahranfragen'; // passe ggf. an

  constructor(private http: HttpClient) {}

  getFahranfragen(): Observable<FahranfrageDto[]> {
    return this.http.get<FahranfrageDto[]>(this.apiUrl);
  }
}
