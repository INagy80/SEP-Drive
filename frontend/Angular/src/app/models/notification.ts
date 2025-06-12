import {rideResponse} from './rideResponse';
import {person} from './notificationperson';

export interface notification {
  id: number;
  sender: person;
  receiver: person;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  message: string;
  title: string;
  rideResponseDTO: rideResponse;
  OfferId: number;

}

