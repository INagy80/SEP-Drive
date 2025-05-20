import { Component } from '@angular/core'; // Import der Component-Dekorator von Angular
import { Router } from '@angular/router';  // Import für Navigation zwischen Seiten
import { FormsModule } from '@angular/forms'; // Import für Formular-Funktionalität
import { AuthenticationService } from '../../services/authentication/authentication.service'; // Import des Authentifizierungs-Service

@Component({
  selector: 'app-forgot-password',   // Name der Komponente als HTML-Tag
  imports: [
    FormsModule                      // FormsModule für Formularsteuerung einbinden
  ],
  templateUrl: './forgot-password.component.html',  // HTML-Datei für das Template
  styleUrl: './forgot-password.component.scss'      // CSS-Datei für Styles
})
export class ForgotPasswordComponent {

  email = '';  // Variable für die Eingabe der E-Mail-Adresse

  constructor(
    private router: Router,                            // Router für Navigation
    private authenticationService: AuthenticationService // Service für Passwort-Reset
  ) { }

  // Methode, die beim Absenden des Formulars aufgerufen wird
  send() {
    // Validierung: Überprüfen, ob die E-Mail leer ist
    if (this.email === '' || this.email === null) {
      alert('please enter your email address');  // Warnung, wenn kein Wert eingegeben wurde
      return;                                    // Methode abbrechen
    }

    // Validierung: Prüfen, ob die E-Mail grob gültig aussieht
    if (!this.email.includes('@') || !this.email.includes('.') || this.email.length < 5) {
      alert('please enter a valid email address'); // Warnung bei ungültiger Email
      return;                                      // Methode abbrechen
    }

    console.log(this.email);  // Ausgabe der E-Mail in der Konsole (zur Kontrolle)

    // Aufruf des Services zum Zurücksetzen des Passworts
    this.authenticationService.resetPassword(this.email).subscribe(
      next => {   // Erfolgreiche Antwort vom Backend
        alert('we have sent you an email with a new password'); // Erfolgsmeldung
        this.router.navigate(['/login']);  // Zurück zur Login-Seite navigieren
      },
      error => {  // Fehlerfall, z.B. E-Mail nicht registriert
        alert('you are not registered with us'); // Fehlermeldung anzeigen
      }
    );
  }

}
