import { Routes } from '@angular/router';
import { ProfileNutzerComponent } from '../profile-nutzer/profile-nutzer.component';
import { SearchProfileComponent } from '../search-profile/search-profile.component';

export const routes: Routes = [
  {path: 'profile-nutzer', component: ProfileNutzerComponent},
  { path: 'search-profile', component: SearchProfileComponent },

];
