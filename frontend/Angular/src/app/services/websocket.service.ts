import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import {AuthenticationResponse} from '../models/authentication-response';
import * as Stomp from 'stompjs';
import {ToastrService} from 'ngx-toastr';
import {notification} from '../models/notification';
import {Router} from '@angular/router';
import {RideRequestService} from './rideRequest/ride-request.service';
import {HttpClient} from '@angular/common/http';
import {FahrtAngeboteComponent} from '../components/fahrt-angebote/fahrt-angebote.component';
import { RefreshService } from './refresh-service';
import { SimulationUpdate } from '../models/simulation-state.model';


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

              if(notification.title === 'Simulation Update!!'){
                const simUpdate = notification.simulationUpdatePayload;
                if (simUpdate) {
                  console.log('📡 Received simulation update:', simUpdate);
                  this.refresh.updateSimulationWithPayload(simUpdate);
                }
                //this.toaster.info(notification.message, notification.title);
              }else if(notification.title === 'Ride Completed!!' || notification.title === 'Payment successful!!'){
                const rideId = notification.rideRequestId;
                this.toaster.success(notification.message, notification.title);
                this.refresh.notifyAfterSimulationEnds(rideId);

              }else if(notification.title === 'Offer Rejected!!' || notification.title === 'Offer Cancelled!!'){
                this.toaster.info(notification.message, notification.title);
                this.refresh.notifyOffersRefresh();
                this.refresh.notifyRejectedOffersRefresh();

              }else if (notification.title === 'Refresh!!'){
                this.refresh.refreshSimulation();

              }else if(notification.title === 'deleted Ride Request!!'){
                this.refresh.notifyOffersRefresh();

              } else {
                this.toaster.info(notification.message, notification.title);
                this.refresh.notifyOffersRefresh();
              }


            }
          );

        }


      );

    }

  }



  /** Send a make-offer frame */
  makeOffer(requestId: number, customerFullName: string): Observable<boolean> {
    if (!this.connected) {
      console.warn('STOMP not yet connected; response will not be sent.');
      return of(false);
    }

    return this.rideRequestService.makeOffer(requestId).pipe(
      map(() => {
        this.toaster.success(
          `You have successfully created an offer to: ${customerFullName}. Just wait for a response.`,
          'Success!!'
        );
        return true;
      }),
      catchError((err) => {
        console.error(err);
        if (err.error?.message?.includes('You already offered')) {
          this.toaster.error('You already have a pending offer.', 'Oops!');
        } else {
          this.toaster.error('Something went wrong.', 'Oops!');
        }
        return of(false);
      })
    );
  }


  CancellMyOffer(requestId: number): Observable<boolean> {
    if (!this.connected) {
      console.warn('STOMP not yet connected; response will not be sent.');
      return of(false);
    }

    return this.rideRequestService.CancellMyOffer(requestId).pipe(
      map(() => {
        this.toaster.warning(
          'You have Cancelled your Offer. you can make new offer now.',
          'Cancelled!!'
        );
        return true;
      }),
      catchError((err) => {
        console.error(err);
          this.toaster.error('Something went wrong.', 'Oops!');
        return of(false);
      })
    );

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


  sendSimulationUpdate(id: number,update: SimulationUpdate, hasEnded: boolean): void {
    this.rideRequestService.sendsumlationupdate(id, update,hasEnded).subscribe({
      next: () => {

      },
      error: err => {

      }
    })

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
