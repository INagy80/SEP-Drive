import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../eviroments/environment';

export interface LeaderboardEntry {
  username: string;
  fullName: string;
  totalRides: number;
  totalDistanceKm: number;
  averageRating: number;
  totalDriveTime: number;
  totalEarnings: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly leaderboardUrl = `${environment.api.baseUrl}${environment.api.Leaderboard}`;

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(this.leaderboardUrl);
  }
}
