import { Component } from '@angular/core';
import {NgIf, NgStyle} from '@angular/common';
import {FormsModule, NgModel} from "@angular/forms";
import {kundeDto} from "../../models/kunde-dto";
import {Router} from "@angular/router";
import {RegisterService} from "../../services/Register/register.service";
import {AuthenticationRequest} from "../../models/authentication-request";
import {fahrerDto} from "../../models/fahrerDTO";
import {Message} from "primeng/message";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    NgIf,
    Message,
    FormsModule
  ]

})
export class RegisterComponent {

  kunde: kundeDto = {
    profilePhoto: null,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(''),
    password: '',
    dtype: 'Kunde',
  };


  fahrer: fahrerDto = {
    profilePhoto:  null,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(''),
    password: '',
    carClass: 'Klein',
    dtype: 'Fahrer',
  };


  credintial: AuthenticationRequest = {
    userName: '',
    password: ''

  }

  errorMsg = '';
  toggle = false;
  wiederholenPassworttoggle: boolean = false;

  passwort: string = '';
  passwortWiederholen: string = '';

  date: any = '';

  zeigeFeld: boolean = false;


  profilbildDatei: File | null = null;

  profilbildVorschauUrl: string | null = null;


  constructor(
      private registerService: RegisterService,
      private router: Router
  ) {
  }

  isfahrer(): boolean {
    return this.zeigeFeld;
  }



  private fileToBlob(file: File): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          resolve(new Blob([result], { type: file.type }));
        } else {
          reject(new Error('Expected an ArrayBuffer, but got ' + typeof result));
        }
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error('Unknown FileReader error'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /** Handler for <input type="file"> change events */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    try {
      const blob = await this.fileToBlob(file);
      console.log('Converted Blob:', blob);

      const formData = new FormData();
      formData.append('fileBlob', blob, file.name);

      // Replace '/api/upload' with your actual endpoint
      // if (this.zeigeFeld){
      //   this.fahrer.profilePhoto = blob;
      // }
      // else{
      //   this.kunde.profilePhoto = blob;
      // }
      console.log('Upload successful');
    } catch (err) {
      console.error('Conversion or upload failed:', err);
    }
  }


  // onFileSelected(event: any) {
  //   const file: File = event.target.files[0];
  //   if (file) {
  //     this.profilbildDatei = file;
  //
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.profilbildVorschauUrl = reader.result as string;
  //       const arrayBuffer = reader.result as ArrayBuffer;
  //       if(this.zeigeFeld){
  //         this.fahrer.profilePhoto = new Blob([ arrayBuffer ], { type: file.type });
  //
  //
  //       }else
  //         this.kunde.profilePhoto = new Blob([ arrayBuffer ], { type: file.type });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }


  onSubmit() {
    if (this.passwort !== this.passwortWiederholen) {
      alert('Die Passwörter stimmen nicht überein.');
      return;
    }

    // Hier: Registrierung fortsetzen
    console.log('Formular ist gültig!');
  }

  register() {
    this.errorMsg = '';
    localStorage.clear()


    if (this.zeigeFeld) {
      if (this.fahrer.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }
      this.registerService.fahrerregister(this.fahrer)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.fahrer.userName,
                password: this.fahrer.password,
              }));
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
      if (this.kunde.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }

      this.registerService.kunderegister(this.kunde)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.kunde.userName,
                password: this.kunde.password,
              }));
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

  login() {
    this.router.navigate(['login']);
  }

  togglePassword() {
    return this.toggle = !this.toggle;
  }

  togglewiederholungPassword() {
    return this.wiederholenPassworttoggle = !this.toggle;
  }
}

