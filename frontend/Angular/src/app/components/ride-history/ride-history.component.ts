import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import {rideResponse} from '../../models/rideResponse';
import {rideRequestDTO} from '../../models/rideRequestDTO';
import { FormsModule } from '@angular/forms';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {Rating} from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';







@Component({
  selector: 'app-ride-history',
  imports: [RouterModule, ButtonModule,FormsModule, NgForOf, DatePipe, NgIf, NgClass, Rating, TableModule, CommonModule],
  templateUrl: './ride-history.component.html',
  styleUrl: './ride-history.component.scss',

})
export class RideHistoryComponent {

  userRole: 'KUNDE' | 'FAHRER' = 'KUNDE'; // Standardwert optional
  rideResponses : Array<rideResponse> = [];
  ascendingitem: any;  // ausgewähltes Feld für aufsteigende Sortierung
  descendingitem: any;
  search: any;






  constructor(
    private router: Router // <--- HIER

  ) {}

  goToStartseite(): void {
    this.router.navigate(['/startseite']);
  }

  get historyRequests(): rideResponse[] {
    return this.rideResponses.filter(r => r.status !== 'Active');
  }


  onAscendingitemChange(value: string): void {
    this.descendingitem = '';
    this.sortRequests(value, true);
  }

  ondescendingitemChange(value: string): void {
    this.ascendingitem = '';
    this.sortRequests(value, false);
  }

  sortRequests(field: string, ascending: boolean): void {
    this.historyRequests.sort((a, b) => {
      let valA = this.getFieldValue(a, field);
      let valB = this.getFieldValue(b, field);

      if (valA == null) valA = '';
      if (valB == null) valB = '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });
  }

  getFieldValue(obj: any, field: string): any {
    switch (field) {
      case 'Id': return obj.id;
      case 'Status': return obj.status;
      case 'DFN': return obj.driverFullName;
      case 'DUN': return obj.driverUserName;
      case 'CFN': return obj.customerFullName;
      case 'CUN': return obj.customerUserName;
      case 'CC': return obj.carClass;
      case 'SA': return obj.startAddress;
      case 'DA': return obj.destinationAddress;
      case 'CD': return obj.createdAt;
      case 'UD': return obj.updatedAt;
      case 'km': return obj.distance;
      case 'min': return obj.duration;
      case '€': return obj.price;
      case 'DR': return obj.driverRating;
      case 'CR': return obj.customerRating;
      default: return '';
    }
  }

  goToRideHistory(): void {
    this.router.navigate(['/ride-history']);
  }





}


