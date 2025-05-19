import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  email= '';

  constructor(private router: Router,
              private authenticationService: AuthenticationService
  ) { }

  send(){
    if(this.email === '' || this.email === null){
      alert('please enter your email address')
      return;
    }
    if(!this.email.includes('@') || !this.email.includes('.') || this.email.length < 5 ){
      alert('please enter a valid email address')
      return;
    }

    console.log(this.email);


    this.authenticationService.resetPassword(this.email).subscribe(
      next => {
        alert('we have sent you an email with a new password')
        this.router.navigate(['/login']);
      }, error => {
        alert('you are not registered with us')
      }
    );

  }

}
