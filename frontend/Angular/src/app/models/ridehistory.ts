export interface Ride {
  id: string;
  date: string; // oder Date, je nach Backend
  distance: number;
  duration: number;
  price: number;
  customerRating?: number;
  driverRating?: number;
  customerUsername?: string;
  customerFullName?: string;
  driverUsername?: string;
  driverFullName?: string;
}
