import { Component, EventEmitter, Input, Output } from '@angular/core';
import {rideRequestDTO} from '../../models/rideRequestDTO';
import {Badge} from 'primeng/badge';
import {Card} from 'primeng/card';
import {PrimeTemplate} from 'primeng/api';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'ride-request-card',
  templateUrl: './rideRequest-card.component.html',
  imports: [
    Badge,
    Card,
    PrimeTemplate,
    ButtonDirective
  ],
  styleUrls: ['./rideRequest-card.component.scss']
})
export class RideRequestCardComponent {

  @Input()
  rideRequest : rideRequestDTO = {
    start: { lat: 0, lng: 0 },
    startaddress: '',
    destination: { lat: 0, lng: 0 },
    destinationaddress: '',
    carClass: 'klein',
  };
  @Input()
  rideIndex = 0;

  @Output()
  delete: EventEmitter<rideRequestDTO> = new EventEmitter<rideRequestDTO>();
  @Output()
  update: EventEmitter<rideRequestDTO> = new EventEmitter<rideRequestDTO>();


  onDelete() {
    this.delete.emit(this.rideRequest);
  }
  onUpdate() {
    this.update.emit(this.rideRequest);
  }
}
