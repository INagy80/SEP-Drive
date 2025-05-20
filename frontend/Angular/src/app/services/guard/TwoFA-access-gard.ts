import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {AuthenticationRequest} from '../../models/authentication-request';


@Injectable({
  providedIn: 'root'
})
export class TwoFAAccessGard implements CanActivate{

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private router: Router) {
    // Determine if the code is running in the browser
    this.isBrowser = isPlatformBrowser(platformId);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('login');
      if (storedUser) {
        const login: AuthenticationRequest = JSON.parse(storedUser);
        const username =  login.userName;
        const password = login.password;
        if (username && password && username.length > 0 && password.length > 0) {

          return true;
        }
      }}
    this.router.navigate(['/welcome']);
    return false;
  }
}
