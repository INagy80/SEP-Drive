import {Component, NgModule} from '@angular/core';
import {NgIf} from '@angular/common';
import {NgModel} from "@angular/forms";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports : [
   // NgIf,
    //NgModule
  ]

})
export class RegisterComponent {

  passwort: string = '';
  passwortWiederholen: string = '';

  zeigeFeld: boolean = false;


  profilbildDatei: File | null = null;

  profilbildVorschauUrl: string | null = null;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.profilbildDatei = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.profilbildVorschauUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.passwort !== this.passwortWiederholen) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    // Hier: Registrierung fortsetzen
    console.log('Formular ist gültig!');
  }

}
