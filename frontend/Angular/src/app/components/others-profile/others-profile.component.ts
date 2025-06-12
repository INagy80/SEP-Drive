import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Button} from 'primeng/button';
import {DatePipe, NgIf,NgClass } from '@angular/common';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ProfileDTO} from '../../models/profileDTO';
import {Subscription} from 'rxjs';
import {AuthenticationResponse} from '../../models/authentication-response';
import { NotificationService } from '../../services/notification.service';
import {Rating} from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeldKontoService } from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';


@Component({
  selector: 'app-others-profile',
  standalone: true,
  imports: [
    RouterLink,
    Rating,
    Button,
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent
  ],
  templateUrl: './others-profile.component.html',
  styleUrl: './others-profile.component.scss'
})
export class OthersProfileComponent implements OnInit {




  isdriver= false;
  userName = '';



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
               private route: ActivatedRoute,
               private profileService : ProfileService,
               private sanitizer: DomSanitizer,
               private WebSocketService : WebsocketService,

  )
  { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('otherProfile') ?? '';
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

    this.profileService.getProfileByUsername(this.userName).subscribe(
      (data: ProfileDTO) => {
        this.profileDTO = data;
      },
      error => {
        console.log(error);
        // alert("User not found");
      }
    )

  }



  loadmyPhoto(){
    this.profileService.getPhotoByUsername(this.userName)
      .subscribe({
        next: (blob: Blob) => {
          // if the service returned a zero-length Blob → no photo on server
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.photoUrl = this.sanitizer
              .bypassSecurityTrustUrl(url) as string;
          } else {
            // fallback to your default image
            this.photoUrl = '/assets/images/default-profile.jpg';
          }
        },
        error: err => {
          console.error('Photo load failed', err);
          // on HTTP error, also show the default
          this.photoUrl = '/assets/images/default-profile.jpg';
        }
      });
  }

  startseite() {
    this.router.navigate(['/home']);

  }



  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }

  profile() {
    this.router.navigate(['/profile']);

  }


  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }
}



