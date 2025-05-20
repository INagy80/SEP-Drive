import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationRequest } from "../../models/authentication-request";
import { AuthenticationService } from "../../services/authentication/authentication.service";
import { FormsModule } from "@angular/forms";
import { Message } from "primeng/message";
import { NgIf } from "@angular/common";
import { ButtonModule } from 'primeng/button';
import { AutoFocus } from 'primeng/autofocus';

// Deklariert eine Angular-Komponente namens LoginComponent
@Component({
    selector: 'app-login',                    // HTML-Tag der Komponente
    templateUrl: './login.component.html',   // Verknüpft die HTML-Datei
    standalone: true,                         // Standalone-Komponente (ohne Modul)
    imports: [                               // Benötigte Module und Direktiven
        FormsModule,
        Message,
        NgIf,
        ButtonModule,
        AutoFocus,
        RouterLink,
    ],
    styleUrls: ['./login.component.scss']    // CSS-Datei für Styling
})
export class LoginComponent {
    // Modell für Login-Daten (Benutzername & Passwort)
    authenticationRequest: AuthenticationRequest = {
        userName: '',
        password: ''
    };

    errorMsg = '';  // Variable zur Anzeige von Fehlermeldungen

    constructor(
        private authenticationService: AuthenticationService,  // Service für Login-Logik
        private router: Router                                  // Router zum Navigieren
    ) {}

    // Methode zum Einloggen
    Login() {
        this.errorMsg = '';      // Fehlermeldung zurücksetzen
        localStorage.clear();    // Lokalen Speicher leeren (z.B. vorherige Logins)

        // Login-Service aufrufen mit den eingegebenen Daten
        this.authenticationService.login(this.authenticationRequest)
            .subscribe({
                next: (res) => { // Wenn Login erfolgreich
                    localStorage.setItem('login', JSON.stringify(this.authenticationRequest)); // Login-Daten speichern
                    this.router.navigate(['auth/2FA']); // Weiterleitung zur 2-Faktor-Authentifizierung
                },
                error: (err) => { // Wenn Fehler auftritt (z.B. falsche Daten)
                    if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                        this.errorMsg = 'userName or password is incorrect'; // Fehlermeldung setzen
                    }
                }
            });
    }

    showPassword: boolean = false;  // Zustand ob Passwort angezeigt wird

    // Methode zum Umschalten der Passwortsichtbarkeit
    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    // Navigation zur Registrierungsseite
    register() {
        this.router.navigateByUrl('/register');
    }
}
