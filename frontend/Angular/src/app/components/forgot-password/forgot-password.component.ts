// Angular-Grundfunktionen importieren
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-forgot-password', // Tag, um Komponente im HTML zu nutzen
  imports: [
    FormsModule // Für [(ngModel)] zur Formularbindung
  ],
  templateUrl: './forgot-password.component.html', // HTML-Template
  styleUrl: './forgot-password.component.scss'     // Styling-Datei
})
export class ForgotPasswordComponent {

  email = ''; // Eingabe-Feld für E-Mail-Adresse

  // Konstruktor mit Router und Authentifizierungsservice
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  // Methode zum Senden des Passwort-Reset-Links
  send() {
    // Prüfen ob E-Mail-Feld leer ist
    if (this.email === '' || this.email === null) {
      alert('please enter your email address');
      return;
    }

    // Prüfen ob E-Mail gültig aussieht
    if (!this.email.includes('@') || !this.email.includes('.') || this.email.length < 5) {
      alert('please enter a valid email address');
      return;
    }

    // Debug-Ausgabe der E-Mail
    console.log(this.email);

    // Passwort-Zurücksetzen über den Auth-Service
    this.authenticationService.resetPassword(this.email).subscribe(
      next => {
        // Erfolg: Hinweis und Weiterleitung zur Login-Seite
        alert('we have sent you an email with a new password');
        this.router.navigate(['/login']);
      },
      error => {
        // Fehler: Nutzer nicht gefunden
        alert('you are not registered with us');
      }
    );
  }
}
