import { Component } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports : [
    NgIf
  ]

})
export class RegisterComponent {
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
}
