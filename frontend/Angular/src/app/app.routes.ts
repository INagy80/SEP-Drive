import { Routes } from '@angular/router';
import {LoginComponent} from "./components/login1/login.component";
import {WelcomeComponent} from "./components/welcome/welcome.component";
import {TwoFAComponent} from "./components/two-fa/two-fa.component";
import {RegisterComponent} from './components/register/register.component';
import {AccessGuardService} from './services/guard/access-guard.service';
import {ProfileNutzerComponent} from './components/profile-nutzer/profile-nutzer.component';
import {SearchProfileComponent} from './components/search-profile/search-profile.component';
import {MapComponent} from './components/map/map.component';

export const routes: Routes = [
  {path: '',           redirectTo: 'welcom', pathMatch: 'full'},
  {path: 'login',     component: LoginComponent},

  {path: 'welcome',   component: WelcomeComponent, },

  {path: 'auth/2FA',  component: TwoFAComponent ,  },

  {path: 'register',  component: RegisterComponent , },
  {path: 'search-profile',  component: SearchProfileComponent ,  },



  {path: 'map',       component: MapComponent ,},

  {path: 'profile',   component: ProfileNutzerComponent ,},

  {path: 'search',    component: SearchProfileComponent ,},







  {path: '**', redirectTo: 'welcome'}





];
