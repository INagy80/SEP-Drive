import { Injectable } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import  SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

export interface SimulationMessage {
  type:    'INITIAL_STATE' | 'STATE_UPDATE';
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class SimulationWebsocketService {
  private client!: Client;
  private subscription!: StompSubscription;

  /** Emits whatever JSON arrives on /topic/ride.{rideId} */
  public messages$ = new BehaviorSubject<SimulationMessage | null>(null);

  constructor() {
    this.client = new Client({
      brokerURL: undefined, // we’ll use SockJS instead
      connectHeaders: {},
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws');
      }
    });
  }

  public connect(rideId: number): void {
    this.client.onConnect = () => {
      console.log(`Connected to STOMP, subscribing to /topic/ride.${rideId}`);
      this.subscription = this.client.subscribe(
        `/topic/ride.${rideId}`,
        (message: IMessage) => {
          const body = JSON.parse(message.body) as SimulationMessage;
          this.messages$.next(body);
        }
      );
    };
    this.client.activate();
  }

  public disconnect(): void {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.client)      this.client.deactivate();
  }
}
