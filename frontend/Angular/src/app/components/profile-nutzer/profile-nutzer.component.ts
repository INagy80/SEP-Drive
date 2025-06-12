import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {Button} from "primeng/button";
import {Router} from "@angular/router";
import {ProfileService} from '../../services/profile/profile.service';
import {ProfileDTO} from '../../models/profileDTO';
import {DomSanitizer} from '@angular/platform-browser';
import {Subscription} from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import {Rating} from 'primeng/rating';
import {GeldKontoService} from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';
import {AuthenticationResponse} from '../../models/authentication-response';


@Component({
  selector: 'app-profile-nutzer',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule, Button, Rating, GeldKontoComponent, HeaderComponent],
  templateUrl: './profile-nutzer.component.html',
  styleUrls: ['./profile-nutzer.component.scss']
})
export class ProfileNutzerComponent implements OnInit {






  isdriver= false;

  profileDTO : ProfileDTO = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    dateOfBirth: new Date(),
    rating: 0,
    role: '',
    totalRides: 0,
    carClass: '',
    profilePicture: new Blob(),
}


  isImageLoading: boolean = false;
  photoUrl : any = '/assets/images/default-profile.jpg';

  constructor( private router: Router,
               private profileService : ProfileService,
               private sanitizer: DomSanitizer,
               private notificationService: NotificationService,
               private geldKontoService :GeldKontoService,
               private WebSocketService : WebsocketService,

  )
  { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadmyPhoto();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;

      if (kundeDTO?.dtype !== 'Kunde') {
        this.isdriver = true;

      }

    }

  }




  private loadUserProfile(): void {
    // TODO: Implement API call to get user profile
    // This is mock data for demonstration

    this.profileService.getmyProfile().subscribe(
      (data: any) => {
        console.log(data);
        this.profileDTO = data;

      },
      error => {
        console.log(error);
        this.photoUrl = '/assets/images/default-profile.jpg';
      }
    )

  }

  loadmyPhoto(){
    this.profileService.getMyPhotoAsBlob().subscribe({
      next: blob => {
        this.photoUrl = blob;
        console.log(blob);
        if(blob !== null){

        const url = URL.createObjectURL(blob);
        this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(url) as string;
        }else{
          this.photoUrl = '/assets/images/default-profile.jpg';
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

  editProfile() {
    this.router.navigate(['/edit-profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }

  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }

  profile() {
    this.router.navigate(['/profile']);

  }
}
