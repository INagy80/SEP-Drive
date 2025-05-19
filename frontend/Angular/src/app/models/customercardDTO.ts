export interface CustomerCardDTO {

  profilePhoto?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  password?: string;
  carClass?: 'klein'| 'Medium' | 'Deluxe' | null;
  dtype : 'Fahrer' | 'Kunde';

}
