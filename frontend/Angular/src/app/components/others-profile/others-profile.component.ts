import { Component } from '@angular/core';
import {Button} from 'primeng/button';
import {DatePipe, NgIf} from '@angular/common';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {ProfileDTO} from '../../models/profileDTO';

@Component({
  selector: 'app-others-profile',
  imports: [
    Button,
    DatePipe,
    NgIf,
    RouterLink
  ],
  templateUrl: './others-profile.component.html',
  styleUrl: './others-profile.component.scss'
})
export class OthersProfileComponent {

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

  userName = '';


  isImageLoading: boolean = false;
  photoUrl : any = '/assets/images/default-profile.jpg';

  constructor( private router: Router,
               private route: ActivatedRoute,
               private profileService : ProfileService,
               private sanitizer: DomSanitizer,

  )
  { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userName = params['userName'];
      this.loadUserProfile();
      this.loadmyPhoto();
    });
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

  Profile() {
    this.router.navigate(['/profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);

  }
}



