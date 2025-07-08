import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../eviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private readonly baseUrl = `${environment.api.baseUrl}/v1/statistics`;

  constructor(private http: HttpClient) { }

  getDailyStatistics(year: number, month: number): Observable<any> {
    const body = { year, month };
    return forkJoin({
      distance: this.http.post<number[]>(`${this.baseUrl}/distance`, body),
      duration: this.http.post<number[]>(`${this.baseUrl}/duration`, body),
      income: this.http.post<number[]>(`${this.baseUrl}/income`, body),
      rating: this.http.post<number[]>(`${this.baseUrl}/rating`, body)
    });
  }

  getYearlyStatistics(year: number): Observable<any> {
    const body = { year };
    return forkJoin({
      distance: this.http.post<number[]>(`${this.baseUrl}/distance/yearly`, body),
      duration: this.http.post<number[]>(`${this.baseUrl}/duration/yearly`, body),
      income: this.http.post<number[]>(`${this.baseUrl}/einnahme/yearly`, body),
      rating: this.http.post<number[]>(`${this.baseUrl}/rating/yearly`, body)
    });
  }

}
