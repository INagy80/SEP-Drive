import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';


import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from  './app.routes';
import { FormsModule } from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarModule } from 'primeng/sidebar';
import {HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch} from '@angular/common/http';
import { MessageModule } from 'primeng/message';
import { HttpInterceptorService } from './services/interceptor/http-interceptor.service';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from "primeng/api";
import {GoogleMapsModule} from '@angular/google-maps';
import {MatSidenavModule} from '@angular/material/sidenav';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {MatButtonModule} from '@angular/material/button';
import {ToastrModule} from 'ngx-toastr';


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      FormsModule,
      HttpClientModule,
      SocketIoModule.forRoot({ url: 'http://localhost:3000', options: {} }),


      // Prime modules
      InputTextModule,
      AvatarModule,
      ButtonModule,
      RippleModule,
      MenuModule,
      SidebarModule,
      MessageModule,
      CardModule,
      BadgeModule,
      ToastModule,
      ConfirmDialogModule,
      GoogleMapsModule,
      BrowserAnimationsModule,
      MatSidenavModule,
      ToastrModule.forRoot({
        progressBar: true,
        closeButton: true,
        newestOnTop: true,
        tapToDismiss: true,
        positionClass: 'toast-bottom-right',
        timeOut: 10000,
      }),

    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    provideHttpClient(
      withFetch() // Configures HttpClient to use fetch API
    ),

    MessageService,
    ConfirmationService,



    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay())]
};
