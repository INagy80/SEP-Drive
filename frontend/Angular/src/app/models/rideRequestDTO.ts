export interface LatLng {
  lat: number;
  lng: number;
}


export interface rideRequestDTO {
  distance: number;
  duration: number;
  price: number;
  start: LatLng;
  startaddress: string;
  destination: LatLng;
  destinationaddress: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';


}
