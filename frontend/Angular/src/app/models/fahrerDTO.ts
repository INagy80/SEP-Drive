export interface fahrerDto {

  profilePhoto?: any;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  password?: string;
  carClass?: 'Klein'| 'Medium' | 'Deluxe';
  dtype : 'Fahrer';

}
