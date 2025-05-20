import { Component } from '@angular/core'; //notwendig, um die Klasse RegisterComponent als Angular Komponente zu deklarieren. Komponente wird aus dem Angular-Kernpaket installiert
import {NgIf, NgStyle} from '@angular/common'; //NgIf : Strukturdirektive , "Zeige das Element nur, wenn die Bedingung true ist." (in html)
import {FormsModule, NgModel} from "@angular/forms"; //Ohne diese Imports funktionieren Formulare und Eingabebindung nicht korrekt, denn es wird nicht an Ts weitergegeben und gespeichert, [(ngModel)] würde nicht erkannt werden ohne FormsModule
//bracht man, weil man im Template folgendes macht :
//Two-Way-Bindung mit ngModel (HTML <-> TS-Code beeinflussen sich gegenseitig; Bsp: in html username, wird direkt in Kunde Ojket gespeichert )
import {kundeDto} from "../../models/kunde-dto"; // importiert das TS-Interface names KundeDto (data transfer Object: beschreibt die Datenstruktur)
import {Router} from "@angular/router"; //Angular-Dienst, der mir erlaubt, in meiner Anwendung von einer Komponente zur nächsten zu navigeiren
import {RegisterService} from "../../services/Register/register.service"; // selbstgeschiebener Angular service, der sich für die Kommunikation für Registrierung im Backend kümmert
import {AuthenticationRequest} from "../../models/authentication-request"; // Ts-Interface, brauche ich für die 2Fa seite damit ich direkt dahin gelangen kann
import {FahrerDTO} from '../../models/fahrerDTO'
import {Message} from "primeng/message"; //Message-Komponente aus der PrimeNG UI-Bibliothek importiert um in HTML p-massage ohne fehler anzeigen zu können

//ohne import kann keine @Componente definiert werden, es wird dann als typeScript-Klase angesehen und nicht als Angular-Komponente
@Component({
  selector: 'app-register', //HTML-Tag, unter dem ich die Komponente im Html einbinden kann (name ist eindeutig)
  templateUrl: './register.component.html', //hier gebe ich an, wo das HTML-Template liegt, das zu dieser Komponente gehört
  styleUrl: './register.component.scss',
  imports: [
    NgIf,
    Message,   //Diese Komponente (RegisterComponent) darf <p-message> im HTML verwenden
    FormsModule
  ]
})

export class RegisterComponent {

  // es gibt pflicht felder die ausfeüllt werden müssen (required)), sonst wird ein fehler angezeigt oder in html formular nicht abgeschickt

  kunde: kundeDto = { //ich erzeuge hier ein Objekt Kunde, was genau dieser Struktur entspricht
    profilePhoto: undefined,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(), //wird mit dem aktuellen datum vorbelegt (nicht leer)
    password: '',
    dtype: 'Kunde', // damit kann das backend unterscheiden ob es ein Kunde ist oder ein Fahrer , je nach dem wird dann die Logik geschrieben
  };


  fahrer: FahrerDTO = {

    profilePhoto: undefined,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(),
    password: '',
    carClass: 'klein', //muss angegebn sein, weil im ts klein | medium |delux vorgegeben ist in FahrerDto ; undefined auch erlaubt da da ein ? ist
    dtype: 'Fahrer',

  };

  // Variablen

  credintial: AuthenticationRequest = { //definiere eine Variable mit dem Typ AuthenticationRequest
    userName: '',
    password: ''

  }

  errorMsg = ''; //speichert eine Fehlermeldung
  toggle = false; //Variable zum anzeigen/verstecken des Passworts
  wiederholenPassworttoggle: boolean = false;

  passwort: string = ''; //nicht aktiv in meinem code,
  passwortWiederholen: string = ''; //speichert eingabe aus dem Feld passwortWiederholen, wird in der Methode register() zum vergleichen der passwörter verwendet

  date: any = ''; // wird in meinem Code nicht verwendet, veraltet

  zeigeFeld: boolean = false;


  profilbildDatei: File | null = null; //speichert das hochgeladene Profilbild

  formData : FormData = new FormData(); //um Daten an das Backend zusenden ; eingebaute Web-Api

  profilbildVorschauUrl: string | null = null;


  constructor(
      private registerService: RegisterService, //this.registerService zur Verfügung
      private router: Router          //router zur verfügung , zb zu 2FA
  ) {
  }

  isfahrer(): boolean {     // aktuellen wert
    return this.zeigeFeld;
  }



 // private fileToBlob(file: File): Promise<Blob> {
   // return new Promise<Blob>((resolve, reject) => {
    //  const reader = new FileReader();

    //  reader.onload = (e: ProgressEvent<FileReader>) => {
     //   const result = e.target?.result;
      //  if (result instanceof ArrayBuffer) {
      //    resolve(new Blob([result], { type: file.type }));
       // } else {
       //   reject(new Error('Expected an ArrayBuffer, but got ' + typeof result));
       // }
     // };

     // reader.onerror = () => {
     //   reject(reader.error ?? new Error('Unknown FileReader error'));
    //  };

    //  reader.readAsArrayBuffer(file);
  //  });
 // }



 async register() {
    this.errorMsg = '';
    localStorage.clear()


    if (this.zeigeFeld) {
      if (this.fahrer.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }

      if (this.profilbildDatei) { //überprüft ob nutzer profil hochgeladen hat , entweder File/null
        this.formData.append(
          'fahrer', //fahrer objekt wird in FormData-Paket gespeichert , aber Form-Data kann kein Objekt direkt speichern, deshalb erst in text(json) umwandeln dann in ein blob verpacken (datei in textform)
          new Blob( //Fahrer-Objekt wird in ein Blob umgwandelt
            [JSON.stringify(this.fahrer)], //wandle objekt in Text um
            {type: 'application/json'} //verpacke text in virtuelle Datei
          )
        );
        this.formData.append('image', this.profilbildDatei, this.profilbildDatei.name); //hochgeladene bild this.ProfilBildDatei wird im FormData unter dem Namen "image" gespeichert, letzte this. ist Dateiname den der Benutzer hochgeladen hat
        this.formData.append('filename', this.profilbildDatei!.name); //Dateiname zusätzlich als Feld speichern, TypeScript vertraut mir dass diese Datei nicht null ist ; ist optional

        this.registerService.addfahrerWithImage(this.formData) //Methode wird aufgerufen addfahrerWithImage im Service, als parameter meine FormData-Paket (Fahrer als Json im Blob, PB als Datei, Dateiname
          .subscribe({ //warte auf Antwort und reagoere drauf
            next: (res) => { //wenn Antwort erfolgreich ist
              localStorage.setItem('login', JSON.stringify(this.credintial = { // 2. Objekt wird in string umgewandelt ; speichert die Login-Daten lokal
                userName: this.fahrer.userName, // 1. aktuelle username pw in credintial speichern
                password: this.fahrer.password,

              }));
              console.log(res); //gibt Antwort vom Server in konsole aus
              console.log(this.formData)
              this.router.navigate(['auth/2FA']);
            },
            error: (err) => {
              if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500 || err.error.statusCode === 409) {

                if (err.error.message.includes('username'))
                  this.errorMsg = 'userName is already taken';
                else if (err.error.message.includes('email'))
                  this.errorMsg = 'email is already taken';
                else
                  this.errorMsg = 'something went wrong';

              }
            }
          });

      }else {


        this.registerService.fahrerregister(this.fahrer)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.fahrer.userName,
                password: this.fahrer.password,

              }));
              console.log(res);
              this.router.navigate(['auth/2FA']);
            },
            error: (err) => {
              if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500 || err.error.statusCode === 409) {

                if (err.error.message.includes('username'))
                  this.errorMsg = 'userName is already taken';
                else if (err.error.message.includes('email'))
                  this.errorMsg = 'email is already taken';
                else
                  this.errorMsg = 'something went wrong';

              }
            }
          });
      }

    }else {
      if (this.kunde.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }

      if (this.profilbildDatei) {
        this.formData.append(
          'kunde',
          new Blob(
            [JSON.stringify(this.kunde)],
            { type: 'application/json' }
          )
        );
        this.formData.append('image', this.profilbildDatei, this.profilbildDatei.name);
        this.formData.append('filename', this.profilbildDatei!.name);

        this.registerService.addKundeWithImage(this.formData)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.kunde.userName,
                password: this.kunde.password,
              }));
              console.log(res);
              console.log(this.formData)
              this.router.navigate(['auth/2FA']);
            },
            //Fehlerfunktion meines subscribe()-Blocks, wenn Http-Request fehlgeschlagen
             error: (err) => {
              if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500 || err.error.statusCode === 409) {

                if (err.error.message.includes('This username already exists'))
                  this.errorMsg = 'userName is already taken';
                else if (err.error.message.includes('This email already exists'))
                  this.errorMsg = 'email is already taken';
                else
                  this.errorMsg = 'something went wrong';



              }
            }
          });
      }else {

        this.registerService.kunderegister(this.kunde)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.kunde.userName,
                password: this.kunde.password,
              }));
              console.log(res);
              this.router.navigate(['auth/2FA']);
            },
            error: (err) => {
              if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500 || err.error.statusCode === 409) {

                if (err.error.message.includes('This username already exists'))
                  this.errorMsg = 'userName is already taken';
                else if (err.error.message.includes('This email already exists'))
                  this.errorMsg = 'email is already taken';
                else
                  this.errorMsg = 'something went wrong';


              }
            }
          });




      }




    }
  }

  login() {
    this.router.navigate(['login']);
  }

  togglePassword() { //ändert sichtbarkeit der passwörter
    return this.toggle = !this.toggle;
  }

  togglewiederholungPassword() { // "" nur für 2. Eingabefeld
    return this.wiederholenPassworttoggle = !this.toggle;
  }

  //profilbild variable oben wird hier befüllt
 onFileSelected($event: Event) {
    const file = ($event.target as HTMLInputElement).files![0]; //Holt die erste Datei, die vom Benuter im input type file ausgewählt wurde ,
    this.profilbildDatei = file; //speichert in meiner Klasssenvariable , wird in FormData verwendet und ans Backend geschickt
    this.profilbildVorschauUrl = URL.createObjectURL(file); //erzeugt url
 }


}

