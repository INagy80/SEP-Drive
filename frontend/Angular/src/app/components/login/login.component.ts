import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationRequest} from "../../models/authentication-request";
import {AuthenticationService} from "../../services/authentication/authentication.service";
import {FormsModule} from "@angular/forms";
import {Message} from "primeng/message";
import {NgIf} from "@angular/common";
import { ButtonModule } from 'primeng/button';
import {AutoFocus} from 'primeng/autofocus';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
    standalone: true,
  imports: [
    FormsModule,
    Message,
    NgIf,
    ButtonModule,
    AutoFocus,
    RouterLink,

  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  authenticationRequest: AuthenticationRequest = {
      userName: '',
      password: ''

  };
  errorMsg = '';





  constructor(
      private authenticationService: AuthenticationService,
      private router: Router,
      private toastService: ToastrService,
  ) {}




  Login() {
      this.errorMsg = '';
      localStorage.clear()
      this.authenticationService.login(this.authenticationRequest)
          .subscribe({
              next: (res) => {
                  localStorage.setItem('login', JSON.stringify(this.authenticationRequest));
                  this.router.navigate(['auth/2FA']);
                  this.toastService.info('Enter your 2FA that we Just sent to you on Email');
              },
              error: (err) => {
                  if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                      this.errorMsg = 'userName or password is incorrect';
                      this.toastService.error(this.errorMsg, 'Oups!!');
                  }
              }
          });
  }

  showPassword: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }


  register() {
    this.router.navigateByUrl('/register');


  }


}
