export interface kundeDto {

  id: number;
  profilePhoto?: FormData;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  password?: string;
  dtype : 'Kunde' ;
  carClass?: string;
  online?: true;
  lastSeen?: '213-05-2025';

}
