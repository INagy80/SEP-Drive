export interface ProfileDTO {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  rating: number;
  role: string;
  totalRides: number;
  carClass: 'klein' | 'Medium' | 'Deluxe' | '';
  profilePicture: Blob;

}
