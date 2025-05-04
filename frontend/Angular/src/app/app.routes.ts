import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
