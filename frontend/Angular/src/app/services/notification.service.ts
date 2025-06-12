import { Injectable } from '@angular/core';
import {observable, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  markAllAsRead(){

  }

  onNewNotification(): Observable<any> {

    return Observable.create()
  }
}
