import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Button} from "primeng/button";
import {Router} from "@angular/router";
import {CustomerCardComponent} from '../customer-card/customer-card.component';
import {ProfileService} from '../../services/profile/profile.service';
import {ProfileDTO } from '../../models/profileDTO';
import {DomSanitizer} from '@angular/platform-browser';
import {switchMap, tap} from 'rxjs';

@Component({
  selector: 'app-search-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, CustomerCardComponent],
  templateUrl: './search-profile.component.html',
  styleUrls: ['./search-profile.component.scss']
})
export class SearchProfileComponent {
  searchQuery: string = '';
  drivers: Array<ProfileDTO> = [];
  Imagesblob : Array<Blob> = [];
  Images: Array<string> = [];


  constructor( private router: Router,
               private profileService: ProfileService,
               private sanitizer: DomSanitizer
               ) { }

  onSearch(): void {
    this.drivers = [];
    this.Images = [];
    this.Imagesblob = [];

    this.profileService.search(this.searchQuery).pipe(
      // first, stash the array of users
      tap(users => this.drivers = users),
      // then, once users are set, fetch the photos
      switchMap(() => this.profileService.getOthersPhoto(this.searchQuery))
    ).subscribe({
      next: blobs => {
        // now blobs is the same length/order as this.drivers
        this.Images = blobs.map(b => {
          if (b === null) {
            // user had no photo → default
            return '/assets/images/default-profile.jpg';
          }
          // real blob → turn into a safe URL
          const url = URL.createObjectURL(b);
          return this.sanitizer.bypassSecurityTrustUrl(url) as string;
        });
      },
      error: err =>{

          alert('Please enter a valid username!');
          console.error(err.message + ' ' + err.status);
      }
    });
  }










  startseite() {
    this.router.navigate(['/home']);

  }

  Profile() {
    this.router.navigate(['/profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);

  }

  deleteCustomer($event: ProfileDTO) {

  }

  updateCustomer($event: ProfileDTO) {

  }
}

