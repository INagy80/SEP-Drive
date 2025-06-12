import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import {AuthenticationResponse} from '../models/authentication-response';
import * as Stomp from 'stompjs';
import {ToastrService} from 'ngx-toastr';
import {notification} from '../models/notification';
import {Router} from '@angular/router';
import {RideRequestService} from './rideRequest/ride-request.service';
import {HttpClient} from '@angular/common/http';
import {FahrtAngeboteComponent} from '../components/fahrt-angebote/fahrt-angebote.component';
import { RefreshService } from './refresh-service';


@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient!: Client;
  private connected = false;

  socketClient: any = null;
  private notificationSubscription: Stomp.Subscription | null = null;


  constructor(
    private toaster: ToastrService,
    private router: Router,
    private rideRequestService : RideRequestService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private refresh: RefreshService
  ) {

  }

  async connect(): Promise<void> {
    if (this.connected) {
      console.warn('WebSocket already connected. Skipping connect.');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;

      const { default: SockJS } = await import('sockjs-client')
      let ws = new SockJS('http://localhost:8080/ws');
      this.socketClient = Stomp.over(ws);
      this.socketClient.connect({
          Authorization:  'Bearer ' + authResponse.token,
        },() => {

          this.connected = true;
        if (this.notificationSubscription) {
          this.notificationSubscription.unsubscribe();
          this.notificationSubscription = null;
        }

        this.notificationSubscription = this.socketClient.subscribe(
            `/user/${kundeDTO?.userName}/notification`,
            (message: any) => {

              const notification: notification = JSON.parse(message.body);
              this.toaster.info(notification.message, notification.title);
              this.refresh.notifyOffersRefresh();

            }
          );

        }


      );

    }

  }



  /** Send a make-offer frame */
  makeOffer(requestId: number , customerFullName: String ): void {

    if (!this.connected) {
      console.warn('STOMP not yet connected; response will not be sent.');
      return;
    }

    this.rideRequestService.makeOffer(requestId).subscribe({
      next: () => {
        console.log('offer made ')
        this.toaster.success('You have successfully created an offer to:  '+ customerFullName + ' Just wait for his/her Response. ' , 'Success!!');

      }, error: err => {
        console.log(err)
        if(err.error.message.includes('You already offered')) {
          this.toaster.error('You have already a pending offer you can not make new offers.', 'Oups!!');
        }else{
          this.toaster.error('Something went wrong .', 'Oups!!');
        }

      }

    });
  }

  /** Send an accept/reject response */
  respondToOffer(offerId: number, accepted: boolean, Fullname: String): void {
    if (!this.connected) {
      console.warn('STOMP not yet connected; response will not be sent.');
      return;
    }
    if (accepted) {
    this.rideRequestService.OfferRespond(offerId, accepted).subscribe({
      next: () => {
        this.toaster.success('Thank you for accepting '+ Fullname+"'s Offer. the driver is on his way to pick you you up "  , 'Success!!');
      },error: err => {
        this.toaster.error('Something went wrong .', 'Oups!!');
      }
    });
    }else {
      this.rideRequestService.OfferRespond(offerId, accepted).subscribe({
        next: () => {
          this.toaster.warning('You have Rejected '+ Fullname+"'s Offer. he will be notified"  , 'Done!!');
        },error: err => {
          this.toaster.error('Something went wrong .', 'Oups!!');
        }
      });

    }


  }



  /** Disconnect the STOMP client */
  disconnect(): void {
    if (!this.connected) {
      return;
    }

    // Unsubscribe notifications
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }

    // Disconnect STOMP client
    this.socketClient.disconnect(() => {
      console.log('STOMP client disconnected');
      this.connected = false;
    });
  }


}
