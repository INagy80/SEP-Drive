import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { RouterModule } from '@angular/router'; // ← wichtig!

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MapComponent], // ← RouterModule hinzufügen!
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
