import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {Button} from "primeng/button";
import {Subscription} from 'rxjs';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from '../../services/notification.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {GeldKontoService} from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';


@Component({
  selector: 'app-profile-edite',
  standalone: true,
  templateUrl: './profile-edite.component.html',
  styleUrls: ['./profile-edite.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    Button,
    GeldKontoComponent,
    HeaderComponent,
  ],


})


export class ProfileEditeComponent implements OnInit {



  isdriver= false;
  photoUrl : any = '/assets/images/default-profile.jpg';

  userProfile: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  profilbildDatei: any;
  profilbildVorschauUrl: any;

  constructor(
    private router: Router,
    private profileService : ProfileService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private geldKontoService : GeldKontoService,
    private WebSocketService : WebsocketService,

  ) {}

  ngOnInit(): void {


    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;

      if (kundeDTO?.dtype !== 'Kunde') {
        this.isdriver = true;

      }

    }

    // Beispiel-Daten (ersetzt später einen Service)
    this.userProfile = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      birthDate: '',
      role: 'Fahrer',
      carClass: '',
      profilePicture: ''
    };

    this.previewUrl = this.userProfile.profilePicture;

    this.loadmyPhoto();

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



  onFileSelected($event: Event): void {

      const file = ($event.target as HTMLInputElement).files![0];
      this.profilbildDatei = file;
      this.profilbildVorschauUrl = URL.createObjectURL(file);

  }

  async saveChanges(){
    const formData = new FormData();

    // Nur wenn ein neues Bild ausgewählt wurde
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    // Weitere Profilfelder
    formData.append('firstName', this.userProfile.firstName);
    formData.append('lastName', this.userProfile.lastName);
    formData.append('username', this.userProfile.username);
    formData.append('email', this.userProfile.email);
    formData.append('birthDate', this.userProfile.birthDate);

    if (this.userProfile.role === 'Fahrer') {
      formData.append('carClass', this.userProfile.carClass);
    }

    // TODO: An Backend senden (z. B. mit HttpClient)
    console.log('FormData bereit zum Senden:', formData);

    await  this.router.navigate(['/profil-nutzer']);
  }

  startseite() {
    this.router.navigate(['/home']);

  }

  profile() {
    this.router.navigate(['/profile']);

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

}
