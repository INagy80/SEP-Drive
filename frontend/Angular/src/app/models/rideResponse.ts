import {LatLng} from "./rideRequestDTO";

export interface rideResponse {
  driverUserName: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';
  createdAt: Date;
  updatedAt: Date;
  startAddress: string;
  startLatLong: LatLng;
  destinationAddress: string;
  destinationLatLong: LatLng;
  customerRating: number;
  driverRating: number;
  status: 'Active' | 'Rejected' | 'Completed' | 'Cancelled' | 'Pending' | 'Assigned';
  id: number;
  driverFullName: string;
  customerFullName: string;
  customerUserName: string;
  distance: number;
  duration: number;
  price: number;
  zwischenstposlatlong: LatLng[];
  zwischenstposaddress: string[];
}
