import { Routes } from '@angular/router';
import { ProfileNutzerComponent } from '../profile-nutzer/profile-nutzer.component';
import { SearchProfileComponent } from '../search-profile/search-profile.component';
import { ProfileEditeComponent } from '../profile-edite/profile-edite.component';

export const routes: Routes = [
  {path: 'profile-nutzer', component: ProfileNutzerComponent },
  { path: 'search-profile', component: SearchProfileComponent },
  { path: 'profile-edite', component: ProfileEditeComponent },

];
