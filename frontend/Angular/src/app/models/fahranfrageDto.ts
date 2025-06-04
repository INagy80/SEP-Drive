import { kundeDto } from './kunde-dto';

export interface FahranfrageDto {
    id: string;
    erstelltAm: string;
    startLatitude: number;
    startLongitude: number;
    fahrzeugklasse: string;
    kunde: kundeDto;
}
