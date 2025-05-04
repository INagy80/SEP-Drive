import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { TwoFAComponent } from './pages/two-fa/two-fa.component'; 
import { SearchProfileComponent } from './pages/search-profile/search-profile.component'; 
import { UserProfileComponent } from './pages/user-profile/user-profile.component'; 


export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'twofa', component: TwoFAComponent },
  { path: 'search-profile', component: SearchProfileComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: '**', redirectTo: '' }
];
