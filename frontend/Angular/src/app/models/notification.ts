import {rideResponse} from './rideResponse';
import {person} from './notificationperson';
import {SimulationUpdate} from './simulation-state.model';

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
  rideRequestId: number;
  totalDistance: number;
  simulationUpdatePayload: SimulationUpdate;

}

