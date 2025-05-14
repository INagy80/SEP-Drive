export interface LatLng {
  lat: number;
  lng: number;
}



export interface rideRequestDTO {
  start: LatLng;
  startaddress: string;
  destination: LatLng;
  destinationaddress: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';

}
