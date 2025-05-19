import { Component, EventEmitter, Input, Output } from '@angular/core';
import {Badge} from 'primeng/badge';
import {ButtonDirective} from 'primeng/button';
import {Card} from 'primeng/card';
import {PrimeTemplate} from 'primeng/api';
import {ProfileService} from '../../services/profile/profile.service';
import {ProfileDTO} from '../../models/profileDTO';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-customer-card',
  templateUrl: './customer-card.component.html',
  imports: [
    Badge,
    ButtonDirective,
    Card,
    PrimeTemplate,
    RouterLink
  ],
  styleUrls: ['./customer-card.component.scss']
})
export class CustomerCardComponent {

  @Input()
  customer: ProfileDTO | null = null;
  @Input()
  images: Array<String> = [];
  @Input()
  customerIndex = 0;



  @Output()
  delete: EventEmitter<ProfileDTO> = new EventEmitter<ProfileDTO>();
  @Output()
  update: EventEmitter<ProfileDTO> = new EventEmitter<ProfileDTO>();




  onDelete() {
    if (this.customer) {
      this.delete.emit(this.customer);
    }
  }
  onUpdate() {
    if (this.customer) {
      this.update.emit(this.customer);
    }
  }
}
