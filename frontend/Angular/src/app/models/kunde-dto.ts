export interface kundeDto {

  profilePhoto?: FormData;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  password?: string;
  dtype : 'Kunde' ;

}

//type-Script-Interface: Ein Interface, was eine klare Struktur beschreibt, aber keine methoden bzw Funktionen.
//wird benutzt um Objekte klar und typsicher zu benutzen

//Typsicher : es wird hier bestimmt welche Variablen es geben darf, ich darf zb in Ts bei Kunde kein age benutzen das wäre falsch,
//wichtig : Klarer Code : Entwickler wissen im Voraus was erwartet wird und schützt vor Fehlern
