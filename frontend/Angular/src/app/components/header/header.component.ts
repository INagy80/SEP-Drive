import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Button} from "primeng/button";
import {GeldKontoComponent} from "../geld-konto/geld-konto.component";
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from '../../services/notification.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {FormsModule} from "@angular/forms";
import {DatePipe, isPlatformBrowser, NgClass, NgForOf, NgIf,CommonModule} from '@angular/common';
import {Rating} from 'primeng/rating';
import { WebsocketService} from '../../services/websocket.service';
import { MatTableDataSource } from '@angular/material/table';
import {MatList, MatListItem,MatListModule} from '@angular/material/list';
import * as Stomp from 'stompjs';
import {notification} from '../../models/notification';
import {ToastrService} from 'ngx-toastr';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    Button,
    GeldKontoComponent,
    FormsModule,
    MatListModule,
    CommonModule,     // ← provides date/NgIf/NgFor
    FormsModule,


  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  @ViewChild('notifAudio', { static: true })
  audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('startAudio', { static: true }) startAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('hornAudio', { static: true }) hornAudio!: ElementRef<HTMLAudioElement>;

  hasUnread = false;
  isRinging = false;
  private notifSub!: Subscription;
  myname = '';
  showNotifications = false;


  displayedColumns = ['driver', 'rating', 'rides', 'distance', 'time', 'actions'];


  isImageLoading: boolean = false;
  photoUrl : any = '/assets/images/default-profile.jpg';
  isdriver: boolean = false;

  socketClient: any = null;
  private notificationSubscription: any;



  constructor( private router: Router,
               private profileService : ProfileService,
               private sanitizer: DomSanitizer,
               private notificationService: NotificationService,
               private ws: WebsocketService,
               private toaster: ToastrService,

  )
  { }

 async ngOnInit(): Promise<void> {

   this.ws.connect();

    this.loadmyPhoto();
    this.notifSub = this.notificationService.onNewNotification().subscribe({
      next: () => this.animateBell(),
      error: (err) => console.error('Notification stream error:', err),
    });


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


  onBellClick() {
    // 2) Example behavior: clear the unread‐badge and open notification panel
    this.hasUnread = false;
    this.notificationService.markAllAsRead();
    this.hasUnread = false;
    this.showNotifications = !this.showNotifications;
    // (Then, e.g., route to /notifications or toggle a dropdown)
  }

  private animateBell() {
    // a) Show the red badge
    this.hasUnread = true;

    // b) Trigger the CSS ring animation
    this.isRinging = true;

    // c) Play the notification sound
    const audio = this.audioRef.nativeElement;
    audio.currentTime = 0;
    audio
      .play()
      .catch((err) =>
        console.warn('Audio playback prevented by browser:', err)
      );

    // d) Remove .ringing once animation ends so you can ring again later
    const bellBtnEl: HTMLElement = document.querySelector(
      '.notification-bell-btn'
    )!;
    const onAnimEnd = () => {
      this.isRinging = false;
      bellBtnEl.removeEventListener('animationend', onAnimEnd);
    };
    bellBtnEl.addEventListener('animationend', onAnimEnd);
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





  profile() {
    this.router.navigate(['/profile']);

  }



}
