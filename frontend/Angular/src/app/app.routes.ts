import { Routes } from '@angular/router';
import { MapComponent } from '../map/map.component';
import { FahranfragenComponent } from '../fahranfragen/fahranfragen.component';
export const routes: Routes = [
  { path: '', redirectTo: 'map', pathMatch: 'full' },
  { path: 'map', component: MapComponent },
  { path: 'fahranfragen', component: FahranfragenComponent },
];
