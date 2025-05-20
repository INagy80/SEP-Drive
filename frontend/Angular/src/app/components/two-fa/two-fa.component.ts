// Angular-Komponenten- und Modul-Importe
import { Component } from '@angular/core';
import { ButtonDirective } from "primeng/button"; // UI-Button von PrimeNG
import { FormsModule } from "@angular/forms"; // Für [(ngModel)] Bindung
import { AuthenticationService } from "../../services/authentication/authentication.service"; // Service für Authentifizierung
import { Router } from "@angular/router"; // Navigation
import { TwoFaRequest } from '../../models/two-fa-request'; // Datenmodell für 2FA-Anfrage
import { Message } from 'primeng/message'; // UI-Komponente für Fehlermeldung
import { NgIf } from '@angular/common'; // Bedingte Anzeige in Template
import { AutoFocusNextDirective } from '../../services/auto-focus-next.directive'; // Eigene Direktive für Fokuswechsel

// Definition der Komponente
@Component({
    selector: 'app-two-fa', // Tag im HTML
    standalone: true, // Standalone-Komponente ohne Modulbindung
    imports: [
        ButtonDirective,
        FormsModule,
        Message,
        NgIf,
        AutoFocusNextDirective
    ],
    templateUrl: './two-fa.component.html', // HTML-Template
    styleUrl: './two-fa.component.scss'     // Stylesheet
})
export class TwoFAComponent {

    // Einzelne Eingabefelder für 6-stelligen Code
    a: string = '';
    b: string = '';
    c: string = '';
    d: string = '';
    e: string = '';
    f: string = '';

    // Zusammengesetzter 2FA-Code
    facode: string = '';

    // Fehlermeldung bei ungültigem Code
    errorMsg = '';

    // Objekt für die 2FA-Übertragung
    twofaRequest: TwoFaRequest = {
        code: '',
        userName: '',
        password: ''
    };

    // Konstruktor mit Abhängigkeiten (DI)
    constructor(
        private authenticationService: AuthenticationService,
        private router: Router
    ) {}

    // Setzt facode aus den sechs Eingaben zusammen
    updateFacode(): void {
        this.facode = `${this.a}${this.b}${this.c}${this.d}${this.e}${this.f}`;
    }

    // Verifiziert den Code über den Authentifizierungsservice
    verify() {
        this.errorMsg = ''; // Vorherige Fehlermeldung löschen

        const local = localStorage.getItem('login'); // Temporäre Login-Daten holen
        if (local) {
            const json = JSON.parse(local); // JSON-String in Objekt umwandeln
            this.twofaRequest.code = this.facode; // Den  faCode setzen
            this.twofaRequest.userName = json.userName;
            this.twofaRequest.password = json.password;
        }

        // Anfrage an Backend zur Verifizierung
        this.authenticationService.TwoFactorLogin(this.twofaRequest)
            .subscribe({
                next: (authenticationResponse) => {
                    if (authenticationResponse.kundeDTO) {
                        authenticationResponse.kundeDTO.profilePhoto = undefined; // Optional: Bild entfernen im DTO
                    }
                    // Erfolgreich: Nutzer speichern und weiterleiten
                    localStorage.setItem('user', JSON.stringify(authenticationResponse)); // Speichert die erfolgreichen Login-Daten im Browser
                    localStorage.removeItem('login');                                     // Entfernt temporäre Login-Daten (mit Passwort)
                    this.router.navigate(['home']);                                       // Leitet den Nutzer zur Startseite weiter

                },
                error: (err) => {
                    // Fehlerbehandlung bei ungültigem Code
                    if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                        this.errorMsg = 'Invalid code';
                    }
                }
            });
    }
}
