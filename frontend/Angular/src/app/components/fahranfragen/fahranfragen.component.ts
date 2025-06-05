import { Component, OnInit } from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import { RideRequestService } from '../../services/rideRequest/ride-request.service';
import {rideResponse} from '../../models/rideResponse';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-fahranfragen',
  standalone: true,
  imports: [
    CurrencyPipe,
    CommonModule
  ],
  templateUrl: './fahranfragen.component.html',
  styleUrl: './fahranfragen.component.scss'
})

export class FahranfragenComponent implements OnInit {

  fahranfragen: rideResponse[] = [];

  constructor(private rideRequestService: RideRequestService) {

  }

  ngOnInit(): void {
    this.ladeFahranfragen();
  }

  private ladeFahranfragen(): void {
    this.rideRequestService.getAll().subscribe({
      next: (anfragen) => {
        console.log('Fahranfragen erhalten:', anfragen);
        this.fahranfragen = anfragen;
      },
      error: (err) => {
        console.error('Fehler beim Abrufen der Fahranfragen:', err);
      }
    });
  }

}

