import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {Password} from 'primeng/password';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    Password,
    FormsModule
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = ``;
  password: string = ``;
  constructor(private router: Router) {}


  onLogin() {
    console.log("Login wurde geklickt");
    this.router.navigate([`/2fa`]);
  }

  onRegister() {
    console.log("Register wurde geklickt");
    this.router.navigate([`/register`]);
  }

}
