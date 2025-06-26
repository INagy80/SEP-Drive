

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ChatResponse } from '../models/chat-response';

import { StringResponse } from '../models/string-response';
import {environment} from '../../eviroments/environment';
import {kundeDto} from '../models/kunde-dto';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient){

  }


  private readonly Chaturl = `${environment.api.baseUrl}/${environment.api.Chaturl}`;





  getChatsByReceiver(): Observable<Array<ChatResponse>> {
    return this.http.get<ChatResponse[]>(`${this.Chaturl}/findall`);
  }


  createChat(recieverId: number): Observable<StringResponse> {
    return this.http.post<StringResponse>(`${this.Chaturl}/CreateChat/${recieverId}`,{});
  }


  getAllcontacts(): Observable<kundeDto[]> {
    return this.http.get<kundeDto[]>(`${this.Chaturl}/findAllContacts`);
  }


}
