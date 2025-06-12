import {Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Button} from "primeng/button";
import {Router} from "@angular/router";
import {CustomerCardComponent} from '../customer-card/customer-card.component';
import {ProfileService} from '../../services/profile/profile.service';
import {ProfileDTO } from '../../models/profileDTO';
import {DomSanitizer} from '@angular/platform-browser';
import {Subscription, switchMap, tap} from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {GeldKontoService} from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';

@Component({
  selector: 'app-search-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, CustomerCardComponent, GeldKontoComponent, HeaderComponent],
  templateUrl: './search-profile.component.html',
  styleUrls: ['./search-profile.component.scss']
})
export class SearchProfileComponent implements OnInit {




  myphotoUrl : any = '/assets/images/default-profile.jpg';
  myname = '';
  isdriver= false;



  searchQuery: string = '';
  drivers: Array<ProfileDTO> = [];
  Imagesblob : Array<Blob> = [];
  Images: Array<string> = [];


  constructor( private router: Router,
               private profileService: ProfileService,
               private sanitizer: DomSanitizer,
               private notificationService: NotificationService,
               private geldKontoService: GeldKontoService,
               private WebSocketService : WebsocketService,
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



  ngOnInit(): void {

    this.loadmyprofilePhoto();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;

      this.myname = kundeDTO?.firstName + ' ' + kundeDTO?.lastName;
      if (kundeDTO?.dtype !== 'Kunde') {
        this.isdriver = true;

      }

    }


  }





  loadmyprofilePhoto(){
    this.profileService.getMyPhotoAsBlob().subscribe({
      next: blob => {
        this.myphotoUrl = blob;
        console.log(blob);
        if(blob !== null){

          const url = URL.createObjectURL(blob);
          this.myphotoUrl = this.sanitizer.bypassSecurityTrustUrl(url) as string;
        }else{
          this.myphotoUrl = '/assets/images/default-profile.jpg';
        }


      }, error (err){
        console.log("error");
        console.log(err);
      }

    });
  }










  startseite() {
    this.router.navigate(['/home']);

  }

  profile() {
    this.router.navigate(['/profile']);

  }


  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }

  deleteCustomer($event: ProfileDTO) {

  }

  updateCustomer($event: ProfileDTO) {

  }
}

