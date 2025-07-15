import { Component } from '@angular/core';
import {NgIf, NgStyle} from '@angular/common';
import {FormsModule, NgModel} from "@angular/forms";
import {kundeDto} from "../../models/kunde-dto";
import {Router} from "@angular/router";
import {RegisterService} from "../../services/Register/register.service";
import {AuthenticationRequest} from "../../models/authentication-request";
import {FahrerDTO} from '../../models/fahrerDTO'

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
    id: 0,
    profilePhoto: undefined,
    userName: 'Ibrahim',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(),
    password: '',
    dtype: 'Kunde',
  };

  fahrer: FahrerDTO = {
    profilePhoto: undefined,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: new Date(),
    password: '',
    carClass: 'klein',
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

  formData : FormData = new FormData();

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



 async register() {
    this.errorMsg = '';
    localStorage.clear()


    if (this.zeigeFeld) {
      if (this.fahrer.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }

      if (this.profilbildDatei) {
        this.formData.append(
          'fahrer',
          new Blob(
            [JSON.stringify(this.fahrer)],
            {type: 'application/json'}
          )
        );
        this.formData.append('image', this.profilbildDatei, this.profilbildDatei.name);
        this.formData.append('filename', this.profilbildDatei!.name);

        this.registerService.addfahrerWithImage(this.formData)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.fahrer.userName,
                password: this.fahrer.password,

              }));
              console.log(res);
              console.log(this.formData)
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


        this.registerService.fahrerregister(this.fahrer)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.fahrer.userName,
                password: this.fahrer.password,

              }));
              console.log(res);
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
      }

    }else {
      if (this.kunde.password !== this.passwortWiederholen){
        this.errorMsg = 'passwords do not match';
        return;
      }

      if (this.profilbildDatei) {
        this.formData.append(
          'kunde',
          new Blob(
            [JSON.stringify(this.kunde)],
            { type: 'application/json' }
          )
        );
        this.formData.append('image', this.profilbildDatei, this.profilbildDatei.name);
        this.formData.append('filename', this.profilbildDatei!.name);

        this.registerService.addKundeWithImage(this.formData)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.kunde.userName,
                password: this.kunde.password,
              }));
              console.log(res);
              console.log(this.formData)
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
      }else {

        this.registerService.kunderegister(this.kunde)
          .subscribe({
            next: (res) => {
              localStorage.setItem('login', JSON.stringify(this.credintial = {
                userName: this.kunde.userName,
                password: this.kunde.password,
              }));
              console.log(res);
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

 onFileSelected($event: Event) {
    const file = ($event.target as HTMLInputElement).files![0];
    this.profilbildDatei = file;
    this.profilbildVorschauUrl = URL.createObjectURL(file);
 }



}

