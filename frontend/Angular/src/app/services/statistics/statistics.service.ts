import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatisticsData, StatisticsRequest, StatisticsResponse } from '../../models/statistics-data';
import { environment } from '../../../eviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private readonly statisticsUrl = `${environment.api.baseUrl}/statistics`;

  constructor(private http: HttpClient) { }


  /**
   * Holt die monatlichen Statistiken für einen Fahrer
   */
  getMonthlyStatistics(driverUsername: string, year: number): Observable<StatisticsResponse> {
    const request: StatisticsRequest = {
      driverUsername,
      viewMode: 'monthly',
      year
    };
    return this.http.post<StatisticsResponse>(`${this.statisticsUrl}/driver`, request);
  }


}


