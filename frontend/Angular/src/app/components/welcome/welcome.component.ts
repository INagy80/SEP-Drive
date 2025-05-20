import { Component } from '@angular/core';            // Import für Angular-Komponente
import { AuthenticationResponse } from '../../models/authentication-response'; // Modell für Authentifizierungsantwort
import { JwtHelperService } from '@auth0/angular-jwt'; // Service zur JWT-Token-Analyse
import { Router, RouterLink } from '@angular/router'; // Router und Link für Navigation
import { NgIf } from '@angular/common';                 // Für bedingte Anzeige im Template

@Component({
  selector: 'app-welcome',                            // HTML-Tag der Komponente
  imports: [
    RouterLink,                                      // Import RouterLink für Template
    NgIf                                             // Import NgIf für *ngIf Direktive
  ],
  templateUrl: './welcome.component.html',            // Verknüpfung mit HTML-Template
  styleUrl: './welcome.component.scss'                 // Verknüpfung mit CSS-Styling
})
export class WelcomeComponent {
  // Variable, die prüft ob der User eingeloggt ist
  isLoggedIn: boolean = this.loging();

  constructor(
    private router: Router,                            // Router zum Navigieren
  ) { }

  // Methode zur Prüfung, ob Nutzer eingeloggt ist
  loging(): boolean {
    console.log('login');                              // Ausgabe in Konsole (Debugging)

    // Token aus localStorage holen (falls vorhanden)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);  // JSON zu Objekt
      const token = authResponse.token;

      if (token) {
        const jwtHelper = new JwtHelperService();     // JWT-Hilfe für Token-Prüfung
        const isTokenNonExpired = !jwtHelper.isTokenExpired(token); // Prüfen ob Token abgelaufen

        if (isTokenNonExpired) {
          return false;   // User ist eingeloggt (Token ist gültig), daher false für "nicht ausgeloggt"
        }
      }
    }

    return true;        // Wenn kein Token oder abgelaufen -> User ist ausgeloggt (true)
  }
}
