import {Component, HostBinding} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // @HostBinding('class') get getClass() {
  //   const sizeClassName = Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  //   return `${sizeClassName} app` ;
  // }

  //constructor(private authService: AuthService, private screen: ScreenService, public appInfo: AppInfoService) { }

  title = 'SEPDrive';

  isAuthenticated() {
    return true;
  }
}
