export interface rideResponse {
  driverUserName: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';
  createdAt: Date;
  updatedAt: Date;
  startAddress: string;
  destinationAddress: string;
  customerRating: number;
  driverRating: number;
  status: 'Active' | 'Rejected' | 'Completed' | 'Cancelled' | 'Pending';
}
