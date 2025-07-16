import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { HeaderComponent } from '../header/header.component';
import { Rating } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { LeaderboardService, LeaderboardEntry } from '../../services/leaderboard.service';

@Component({
  standalone: true,
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  imports: [
    FormsModule,
    DecimalPipe,
    CurrencyPipe,
    Button,
    NgIf,
    HeaderComponent,
    Rating,
    TableModule
  ],
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  suchbegriff: string = '';
  isdriver: boolean = false;
  fahrerListe: LeaderboardEntry[] = [];

  first: number = 0;  // Startindex der Seite
  rows: number = 10;  // Anzahl der Zeilen pro Seite

  constructor(
    private router: Router,
    private WebSocketService: WebsocketService,
    private leaderboardService: LeaderboardService
  ) {}

  ngOnInit() {
    this.holeFahrerVomBackend();
  }

  holeFahrerVomBackend() {
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data) => {
        this.fahrerListe = data;
      },
      error: (err) => {
        console.error('Fehler beim Laden des Leaderboards:', err);
      }
    });
  }

  get gefilterteFahrer(): LeaderboardEntry[] {
    return this.fahrerListe.filter(f =>
      f.fullName.toLowerCase().includes(this.suchbegriff.toLowerCase())
    );
  }

  customSort(event: { field: keyof LeaderboardEntry, order: number }) {
    this.fahrerListe.sort((a, b) => {
      const valA = a[event.field];
      const valB = b[event.field];

      let result = 0;
      if (valA == null && valB != null) result = -1; // wenn A fehlt, kommt B vor A
      else if (valA != null && valB == null) result = 1; //wenn B fehlt, kommt A vor B
      else if (valA == null && valB == null) result = 0;
      else if (typeof valA === 'string' && typeof valB === 'string') // Strings vergleichen
        result = valA.localeCompare(valB);
      else
        result = valA < valB ? -1 : valA > valB ? 1 : 0; // Zahlen vergleichen ( 1=auf, -1 =ab)

      return event.order * result; // Sortierrichtung beachten
    });
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  resetPagination() {
    this.first = 0;
  }

  startseite() {
    this.router.navigate(['/home']);
  }

  driverdashboard() {
    this.router.navigate(['/driverdashboard']);
  }

  fahrtangebote() {
    this.router.navigate(['/fahrtangebote']);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();
  }

  otherProfileClicked(userName: string | undefined) {
    localStorage.setItem('otherProfile', userName || '');
    this.router.navigate(['search-profile/others']);

  }
}
