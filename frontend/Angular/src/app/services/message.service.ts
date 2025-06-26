

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import {environment} from '../../eviroments/environment';
import {ChatResponse} from '../models/chat-response';
import {MessageRequest} from '../models/message-request';
import { MessageResponse } from '../models/message-response';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(private http: HttpClient) {

  }

  private readonly messageUrl = `${environment.api.baseUrl}/${environment.api.Messageurl}`;



  saveMessage(message: MessageRequest): Observable<void> {
    return this.http.post<void>(`${this.messageUrl}/save`,message);
  }

  setMessageToSeen(chatId: string ): Observable<void> {
    return this.http.patch<void>(`${this.messageUrl}/set-to-seen/${chatId}`,{});
  }


  uploadMedia(chatId: string, file: File): Observable<void> {
    const form = new FormData();
    form.append('chat-id', chatId);
    form.append('file', file, file.name);

    return this.http.post<void>(`${this.messageUrl}/upload-media`, form);
  }





  getAllMessages(chatId: string): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(
      `${this.messageUrl}/chat/${chatId}`
    );
  }

}
