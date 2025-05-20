// Importieren der benötigten Angular- und PrimeNG-Module
import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {FormsModule} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {Router} from "@angular/router";
import {TwoFaRequest} from '../../models/two-fa-request';
import {Message} from 'primeng/message';
import {NgIf} from '@angular/common';


// Definition der Komponente (standalone = unabhängig von Modulen nutzbar)
@Component({
    selector: 'app-two-fa', // HTML-Tag, um die Komponente zu verwenden
    imports: [
        ButtonDirective,      // Button-Design von PrimeNG
        FormsModule,          // Ermöglicht Formularbindung mit ngModel
        Message,              // Anzeige von Nachrichten
        NgIf                  // Bedingte Anzeige im Template
    ],
    templateUrl: './two-fa.component.html',   // HTML-Vorlage
    styleUrl: './two-fa.component.scss'       // Styling
})
export class TwoFAComponent {

    // Einzelne Eingabefelder für jede Ziffer des 6-stelligen Codes
    a: string = '';
    b: string = '';
    c: string = '';
    d: string = '';
    e: string = '';
    f: string = '';

    facode: string = ''; // Der zusammengesetzte 2FA-Code
    errorMsg = '';       // Fehlermeldung, falls der Code falsch ist

    // Objekt, das an den Server geschickt wird zur Verifizierung
    twofaRequest: TwoFaRequest = {
        code : '',
        userName: '',
        password: ''
    };

    // Services werden über den Konstruktor injiziert (Dependency Injection)
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router
    ) {}

    // Diese Methode kombiniert die 6 Eingaben zu einem 6-stelligen Code
    updateFacode(): void {
        this.facode = `${this.a}${this.b}${this.c}${this.d}${this.e}${this.f}`;
    }

    // Methode zur Verifizierung des Codes
    verify() {
        this.errorMsg = ''; // Vorherige Fehlermeldung zurücksetzen

        // Login-Daten aus dem localStorage holen (vom vorherigen Login)
        const local = localStorage.getItem('login');
        if (local) {
            const json= JSON.parse(local); // In Objekt umwandeln
            this.twofaRequest.code = this.facode;               // 2FA-Code hinzufügen
            this.twofaRequest.userName = json.userName;         // Benutzername übernehmen
            this.twofaRequest.password = json.password;         // Passwort übernehmen
        }

        // Service-Aufruf zur Verifizierung des Codes
        this.authenticationService.TwoFactorLogin(this.twofaRequest)
            .subscribe({
                next: (authenticationResponse) => {
                    // Optional: Profilbild aus Sicherheitsgründen entfernen
                    if (authenticationResponse.kundeDTO) {
                        authenticationResponse.kundeDTO.profilePhoto = undefined;
                    }
                    // Erfolgreiche Anmeldung: Nutzer im localStorage speichern
                    localStorage.setItem('user', JSON.stringify(authenticationResponse));
                    localStorage.removeItem('login'); // Vorherige Login-Daten entfernen
                    this.router.navigate(['home']);   // Zur Startseite weiterleiten
                },
                error: (err) => {
                    // Falls Code ungültig → Fehlermeldung setzen
                    if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                        this.errorMsg = 'Invalid code';
                    }
                }
            });
    }

    // Springt automatisch zum nächsten Eingabefeld nach Eingabe eines Zeichens
    moveFocus(event: any, nextInput: HTMLInputElement) {
        const value = event.target.value;        // Eingegebenes Zeichen holen
        if (value.length === 1 && nextInput) {   // Wenn genau 1 Zeichen eingegeben wurde
            nextInput.focus();                     // Cursor ins nächste Feld setzen
        }
    }
}
