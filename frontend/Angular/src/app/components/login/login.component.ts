// Wichtige Angular- und PrimeNG-Module importieren
import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationRequest} from "../../models/authentication-request";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {FormsModule} from "@angular/forms";
import {Message} from "primeng/message";
import {NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import { ButtonModule } from 'primeng/button';
import {Password, PasswordDirective} from "primeng/password";
import {AutoFocus} from 'primeng/autofocus';


// Komponente definieren
@Component({
    selector: 'app-login', // HTML-Tag zur Verwendung dieser Komponente
    templateUrl: './login.component.html', // HTML-Datei mit Eingabefeldern
    standalone: true, // Standalone-Komponente, kein Angular-Modul notwendig
    imports: [ // Benötigte Imports für Template-Funktionalitäten
        FormsModule,     // Für [(ngModel)] (Formularbindung)
        Message,         // Für Fehlermeldungsausgabe
        NgIf,            // Für Bedingung im Template
        ButtonDirective, // PrimeNG Button-Styling
        ButtonModule,
        Password,        // Password-Komponente von PrimeNG
        AutoFocus        // Autofokus auf Eingabefeld setzen
    ],
    styleUrls: ['./login.component.scss'] // SCSS für das Styling
})
export class LoginComponent {

    // Datenobjekt für Benutzername und Passwort
    authenticationRequest: AuthenticationRequest = {
        userName: '',
        password: ''
    };

    errorMsg = ''; // Fehlermeldung, wenn Login fehlschlägt

    // Konstruktor mit Dependency Injection für Services
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router
    ) {}

    // Methode zum Wechseln zur Registrierungsseite
    register() {
        this.router.navigate(['register']);
    }

    // Methode für den Login-Vorgang
    Login() {
        this.errorMsg = '';        // Alte Fehlermeldung zurücksetzen
        localStorage.clear();      // Vorherige Daten löschen

        // Login-Service aufrufen
        this.authenticationService.login(this.authenticationRequest)
            .subscribe({
                next: (res) => {
                    // Login-Daten im LocalStorage speichern
                    localStorage.setItem('login', JSON.stringify(this.authenticationRequest));
                    // Nach erfolgreichem Login zur 2FA-Seite weiterleiten
                    this.router.navigate(['auth/2FA']);
                },
                error: (err) => {
                    // Bei bestimmten Fehlern → Fehlermeldung anzeigen
                    if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                        this.errorMsg = 'userName or password is incorrect';
                    }
                }
            });
    }
}
