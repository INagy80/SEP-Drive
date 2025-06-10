export interface rideResponse {
  driverUserName: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';
  createdAt: Date;
  updatedAt: Date;
  startAddress: string;
  zwischenstposaddress: string;
  destinationAddress: string;
  customerRating: number;
  driverRating: number;
  status: 'Active' | 'Rejected' | 'Completed' | 'Cancelled' | 'Pending';
  id: number;
  driverFullName: string;
  customerFullName: string;
  customerUserName: string;
  distance: number;
  duration: number;
  price: number;
}
