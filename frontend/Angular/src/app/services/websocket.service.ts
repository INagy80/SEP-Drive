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
import { ChatMessage } from '../models/chat-message.model';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private stompClient!: Client;
  private connected = false;

  socketClient: any = null;
  private notificationSubscription: Stomp.Subscription | null = null;
  private chatMessageSubscription: Stomp.Subscription | null = null;
  private chatMessageUpdatedSubscription: Stomp.Subscription | null = null;
  private chatMessageDeletedSubscription: Stomp.Subscription | null = null;
  private chatMessageReadSubscription: Stomp.Subscription | null = null;

  // Chat message subjects for real-time updates
  private chatMessageSubject = new BehaviorSubject<ChatMessage | null>(null);
  public chatMessage$ = this.chatMessageSubject.asObservable();

  private chatMessageUpdatedSubject = new BehaviorSubject<ChatMessage | null>(null);
  public chatMessageUpdated$ = this.chatMessageUpdatedSubject.asObservable();

  private chatMessageDeletedSubject = new BehaviorSubject<number | null>(null);
  public chatMessageDeleted$ = this.chatMessageDeletedSubject.asObservable();

  private chatMessageReadSubject = new BehaviorSubject<number | null>(null);
  public chatMessageRead$ = this.chatMessageReadSubject.asObservable();

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

              } else if(notification.title === 'Simulation Edited is Implemented!!' || notification.title === 'Simulation Edited!!'){
                this.toaster.info(notification.message, notification.title);
                if(notification.title === 'Simulation Edited is Implemented!!'){
                  this.refresh.refreshSimulation();
                }else{
                  this.refresh.refreshEditSimulation();
                }
              }else if(notification.title === 'Refresh!!'){

              }
              else {
                this.toaster.info(notification.message, notification.title);
                this.refresh.notifyOffersRefresh();
              }
            }
          );

        // Setup chat message subscriptions
        this.setupChatSubscriptions(kundeDTO?.userName);

        }
      );
    }
  }

  private setupChatSubscriptions(userName: string | undefined): void {
    if (!userName) return;

    // Subscribe to new chat messages
    this.chatMessageSubscription = this.socketClient.subscribe(
      `/user/${userName}/chat/message`,
      (message: any) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        console.log('📨 Received new chat message:', chatMessage);
        this.chatMessageSubject.next(chatMessage);
        this.toaster.info(`Neue Nachricht von ${chatMessage.senderUsername}`, 'Chat');
      }
    );

    // Subscribe to message updates
    this.chatMessageUpdatedSubscription = this.socketClient.subscribe(
      `/user/${userName}/chat/message/updated`,
      (message: any) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        console.log('✏️ Received message update:', chatMessage);
        this.chatMessageUpdatedSubject.next(chatMessage);
      }
    );

    // Subscribe to message deletions
    this.chatMessageDeletedSubscription = this.socketClient.subscribe(
      `/user/${userName}/chat/message/deleted`,
      (message: any) => {
        const messageId: number = JSON.parse(message.body);
        console.log('🗑️ Received message deletion:', messageId);
        this.chatMessageDeletedSubject.next(messageId);
      }
    );

    // Subscribe to read receipts
    this.chatMessageReadSubscription = this.socketClient.subscribe(
      `/user/${userName}/chat/message/read`,
      (message: any) => {
        const messageId: number = JSON.parse(message.body);
        console.log('👁️ Received read receipt:', messageId);
        this.chatMessageReadSubject.next(messageId);
      }
    );
  }

  // Chat WebSocket methods
  sendChatMessage(receiverUsername: string, content: string, rideRequestId?: number): void {
    if (!this.connected) {
      console.warn('WebSocket not connected. Cannot send chat message.');
      return;
    }

    const message = {
      receiverUsername,
      content,
      rideRequestId
    };

    this.socketClient.send('/app/chat.send', {}, JSON.stringify(message));
  }

  editChatMessage(messageId: number, newContent: string): void {
    if (!this.connected) {
      console.warn('WebSocket not connected. Cannot edit chat message.');
      return;
    }

    const message = {
      messageId,
      newContent
    };

    this.socketClient.send('/app/chat.edit', {}, JSON.stringify(message));
  }

  deleteChatMessage(messageId: number): void {
    if (!this.connected) {
      console.warn('WebSocket not connected. Cannot delete chat message.');
      return;
    }

    this.socketClient.send('/app/chat.delete', {}, JSON.stringify(messageId));
  }

  markChatMessageAsRead(messageId: number): void {
    if (!this.connected) {
      console.warn('WebSocket not connected. Cannot mark message as read.');
      return;
    }

    this.socketClient.send('/app/chat.read', {}, JSON.stringify(messageId));
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

    // Unsubscribe chat messages
    if (this.chatMessageSubscription) {
      this.chatMessageSubscription.unsubscribe();
      this.chatMessageSubscription = null;
    }

    if (this.chatMessageUpdatedSubscription) {
      this.chatMessageUpdatedSubscription.unsubscribe();
      this.chatMessageUpdatedSubscription = null;
    }

    if (this.chatMessageDeletedSubscription) {
      this.chatMessageDeletedSubscription.unsubscribe();
      this.chatMessageDeletedSubscription = null;
    }

    if (this.chatMessageReadSubscription) {
      this.chatMessageReadSubscription.unsubscribe();
      this.chatMessageReadSubscription = null;
    }

    // Disconnect STOMP client
    this.socketClient.disconnect(() => {
      console.log('STOMP client disconnected');
      this.connected = false;
    });
  }


}
