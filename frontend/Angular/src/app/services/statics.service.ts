import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../eviroments/environment';
import {ChartData, StatisticsData, StatisticsRequest, StatisticsResponse} from '../models/statics-data';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {


  private readonly statisticsUrl = `${environment.api.baseUrl}/v1/statistics`;

  constructor(private http: HttpClient) { }







  getDailyDistance(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/distance/${year}/${month}`);
  }

  getDailyDuration(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/duration/${year}/${month}`);
  }

  getDailyIncome(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/income/${year}/${month}`);
  }

  getDailyRating(year: number, month: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/rating/${year}/${month}`);
  }


  getDailyData(year: number, month: number): Observable<StatisticsData> {
    return forkJoin({
      earnings:    this.getDailyIncome(year, month),
      distance:    this.getDailyDistance(year, month),
      drivingTime: this.getDailyDuration(year, month),
      averageRating: this.getDailyRating(year, month)
    }).pipe(
      map(({ earnings, distance, drivingTime, averageRating }) => {
        // how many days in that month?
        const daysInMonth = new Date(year, month, 0).getDate();

        // build a ChartData[] of exactly that length
        const build = (label: string, values: number[]): ChartData[] =>
          Array.from({ length: daysInMonth }, (_, idx) => {
            const day = idx + 1;
            const mm  = String(month).padStart(2, '0');
            const dd  = String(day).padStart(2, '0');

            return {
              label,
              value: values[idx] ?? 0,                // fill missing with 0
              date:  `${year}-${mm}-${dd}`
            };
          });

        return {
          earnings:      build('Earnings',      earnings),
          distance:      build('Distance',      distance),
          drivingTime:   build('Driving Time',  drivingTime),
          averageRating: build('Average Rating', averageRating)
        };
      })
    );
  }




  getMonthlyDistance(year: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/distance/${year}`);
  }

  getMonthlyDuration(year: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/duration/${year}`);
  }

  getMonthlyIncome(year: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/income/${year}`);
  }

  getMonthlyRating(year: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.statisticsUrl}/rating/${year}`);
  }


  getMonthlyData(year: number): Observable<StatisticsData> {
    return forkJoin({
      distance:      this.getMonthlyDistance(year),
      drivingTime:   this.getMonthlyDuration(year),
      earnings:      this.getMonthlyIncome(year),
      averageRating: this.getMonthlyRating(year)
    }).pipe(
      map(({ distance, drivingTime, earnings, averageRating }) => {
        // helper to turn a 12-item number[] into ChartData[]
        const build = (label: string, values: number[]): ChartData[] =>
          values.map((value, idx) => {
            const month = idx + 1;
            const mm = String(month).padStart(2, '0');
            return {
              label,
              value,
              date: `${year}-${mm}`    // e.g. "2025-01", "2025-02", …
            };
          });

        return {
          distance:      build('Distance',      distance),
          drivingTime:   build('Driving Time',  drivingTime),
          earnings:      build('Earnings',      earnings),
          averageRating: build('Average Rating', averageRating)
        };
      })
    );
  }






}


