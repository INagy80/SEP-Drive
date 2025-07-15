export interface LatLng {
  lat: number;
  lng: number;
}

export interface ZwischenStopp {
  name: string;
  latlng: LatLng;
  ispassed: boolean;
}

export interface edit{
  destination?: LatLng;
  destinationaddress?: string;
  zwischenstops?: LatLng[];
  zwischenstopssaddress?: string[];
  cost?: number;
  duration?: number;
  distance?: number;
}

export interface rideRequestDTO {
  distance: number;
  duration: number;
  price: number;
  start: LatLng;
  startaddress: string;
  zwischenstops: LatLng[];
  zwischenstopssaddress: string[];
  destination: LatLng;
  destinationaddress: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';

}
