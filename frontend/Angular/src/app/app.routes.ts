import { Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {WelcomeComponent} from "./components/welcome/welcome.component";
import {TwoFAComponent} from "./components/two-fa/two-fa.component";
import {RegisterComponent} from './components/register/register.component';
import {AccessGuardService} from './services/guard/access-guard.service';
import {ProfileNutzerComponent} from './components/profile-nutzer/profile-nutzer.component';
import {SearchProfileComponent} from './components/search-profile/search-profile.component';
import {MapComponent} from './components/map/map.component';
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {ProfileEditeComponent} from './components/profile-edite/profile-edite.component';
import {TwoFAAccessGard} from './services/guard/TwoFA-access-gard';
import {OthersProfileComponent} from './components/others-profile/others-profile.component';
import {DriverdashboardComponent} from './components/driverdashboard/driverdashboard.component';
import {FahrtAngeboteComponent} from './components/fahrt-angebote/fahrt-angebote.component';
import {ChatComponent} from './components/chat/chat.component';


export const routes: Routes = [
  {path: '',           redirectTo: 'welcom', pathMatch: 'full'},
  {path: 'register/?userName=&password=', redirectTo: 'register', pathMatch: 'full'},
  {path: 'register',  component: RegisterComponent , },


  {path: 'login',     component: LoginComponent, },

  {path: 'welcome',   component: WelcomeComponent, },


  {path: 'Password-reset', component: ForgotPasswordComponent ,  },

  {path: 'auth/2FA',  component: TwoFAComponent , canActivate: [TwoFAAccessGard]   },

  {path: 'home',       component: MapComponent , canActivate: [AccessGuardService]},

  {path: 'profile',   component: ProfileNutzerComponent , canActivate: [AccessGuardService]},

  {path: 'edit-profile',   component: ProfileEditeComponent , canActivate: [AccessGuardService]},


  {path: 'search-profile',    component: SearchProfileComponent , canActivate: [AccessGuardService]},

  {path: 'search-profile/others',    component: OthersProfileComponent , canActivate: [AccessGuardService]},

  {path: 'driverdashboard',    component: DriverdashboardComponent , canActivate: [AccessGuardService]},

  {path: 'fahrtangebote',    component: FahrtAngeboteComponent , canActivate: [AccessGuardService]},


  {path: 'chat' , component: ChatComponent, canActivate :[AccessGuardService]},


  {path: '**', redirectTo: 'welcome'}





];
