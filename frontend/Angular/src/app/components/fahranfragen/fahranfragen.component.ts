//import { FahranfragenService } from '../../services/fahranfragen/fahranfragen.service';
//import { FahranfrageDto } from '../../models/fahranfrageDto';
import { Component, OnInit } from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import { RideRequestService } from '../../services/rideRequest/ride-request.service';
import {rideRequestDTO} from '../../models/rideRequestDTO';
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

  fahranfragen: rideRequestDTO[] = [];

  constructor(private rideRequestService: RideRequestService) {}

  ngOnInit(): void {
    this.ladeFahranfragen();
  }

  private ladeFahranfragen(): void {
    this.rideRequestService.findAll().subscribe({
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

