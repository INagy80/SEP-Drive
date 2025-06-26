import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { HeaderComponent } from '../header/header.component';
import { Rating } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';

interface Fahrer {
  benutzername: string;
  name: string;
  distanz: number;
  bewertung: number;
  fahrzeit: number;
  fahrten: number;
  geld: number;
}

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
  fahrerListe: Fahrer[] = [];

  constructor(
    private router: Router,
    private WebSocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.holeFahrerVomBackend();
  }

  holeFahrerVomBackend() {
    this.http.get<Fahrer[]>('/v1/leaderboard').subscribe({
      next: (data) => {
        this.fahrerListe = data;
      },
      error: (err) => {
        console.error('Fehler beim Laden des Leaderboards:', err);
      }
    });
  }

  get gefilterteFahrer(): Fahrer[] {
    return this.fahrerListe.filter(f =>
      f.name.toLowerCase().includes(this.suchbegriff.toLowerCase())
    );
  }

  customSort(event: { field: keyof Fahrer, order: number }) {
    this.fahrerListe.sort((a, b) => {
      const valA = a[event.field];
      const valB = b[event.field];

      let result = 0;
      if (valA == null && valB != null) result = -1;
      else if (valA != null && valB == null) result = 1;
      else if (valA == null && valB == null) result = 0;
      else if (typeof valA === 'string' && typeof valB === 'string')
        result = valA.localeCompare(valB);
      else
        result = valA < valB ? -1 : valA > valB ? 1 : 0;

      return event.order * result;
    });
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
}
