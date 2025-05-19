import {Component, OnInit} from '@angular/core';
import {AuthenticationRequest} from '../../models/authentication-request';
import {AuthenticationResponse} from '../../models/authentication-response';
import { JwtHelperService } from '@auth0/angular-jwt';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  isLoggedIn: boolean = this.loging() ;

  constructor(
    private router: Router,
  ) { }

  loging() : boolean {

    console.log('login');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const token = authResponse.token;
      if (token) {
        const jwtHelper = new JwtHelperService();
        const isTokenNonExpired = !jwtHelper.isTokenExpired(token);
        if (isTokenNonExpired) {
          return  false;
        }
      }
    }

   return  true;
  }



}
