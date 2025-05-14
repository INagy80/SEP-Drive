import { Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {WelcomeComponent} from "./components/welcome/welcome.component";
import {TwoFAComponent} from "./components/two-fa/two-fa.component";
import {RegisterComponent} from './components/register/register.component';
import {AccessGuardService} from './services/guard/access-guard.service';
import {ProfileNutzerComponent} from './components/profile-nutzer/profile-nutzer.component';
import {SearchProfileComponent} from './components/search-profile/search-profile.component';
import {MapComponent} from './components/map/map.component';

export const routes: Routes = [
  {path: '',           redirectTo: 'welcom', pathMatch: 'full'},
  {path: 'login',     component: LoginComponent, },

  {path: 'welcome',   component: WelcomeComponent, },

  {path: 'auth/2FA',  component: TwoFAComponent ,    },

  {path: 'register',  component: RegisterComponent , },



  {path: 'map',       component: MapComponent , canActivate: [AccessGuardService]},

  {path: 'profile',   component: ProfileNutzerComponent , canActivate: [AccessGuardService]},

  {path: 'search',    component: SearchProfileComponent , canActivate: [AccessGuardService]},






  {path: '**', redirectTo: 'welcome'}





];
