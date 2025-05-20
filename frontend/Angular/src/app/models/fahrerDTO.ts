export interface FahrerDTO {

  profilePhoto?: FormData;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  password?: string;
  carClass?: 'klein'| 'Medium' | 'Deluxe';
  dtype : 'Fahrer';

}
