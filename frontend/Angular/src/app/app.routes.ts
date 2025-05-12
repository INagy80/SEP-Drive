import { Routes } from '@angular/router';
import {WelcomeComponent} from '../welcome/welcome.component'
import {LoginComponent} from '../login/login.component'
import {TwoFAComponent } from '../two-fa/two-fa.component';
import {ForgotPasswordComponent } from '../forgot-password/forgot-password.component';



export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: '2fa', component: TwoFAComponent },
  { path: 'forgot-password', component:ForgotPasswordComponent },
];
