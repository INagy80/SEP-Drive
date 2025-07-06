import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatisticsData, StatisticsRequest, StatisticsResponse } from '../../models/statistics-data';
import { environment } from '../../../eviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

// URL noch nicht vollständig !!
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

  /**
   * Holt die täglichen Statistiken für einen Fahrer
   */
  getDailyStatistics(driverUsername: string, year: number, month: number): Observable<StatisticsResponse> {
    const request: StatisticsRequest = {
      driverUsername,
      viewMode: 'daily',
      year,
      month
    };
    return this.http.post<StatisticsResponse>(`${this.statisticsUrl}/driver`, request);
  }

  /**
   * Holt die Statistiken für den aktuellen Fahrer (Username muss übergeben werden)
   */
  getCurrentDriverStatistics(driverUsername: string, viewMode: 'daily' | 'monthly', year: number, month?: number): Observable<StatisticsResponse> {
    if (viewMode === 'daily' && month) {
      return this.getDailyStatistics(driverUsername, year, month);
    } else {
      return this.getMonthlyStatistics(driverUsername, year);
    }
  }



}


