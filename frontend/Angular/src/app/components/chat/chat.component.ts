import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { WebsocketService } from '../../services/websocket.service';
import { MessageResponse } from '../../models/message-response';
import { MessageRequest } from '../../models/message-request';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    HeaderComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {

  messages: MessageResponse[] = [];
  newMessage: string = '';
  currentUserRole: 'Kunde' | 'Fahrer' = 'Kunde'; // Oder dynamisch setzen je nach Login

  private messageSubscription!: Subscription;

  constructor(
    private messageService: MessageService,
    private websocketService: WebsocketService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  currentChatId!: string;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentChatId = params['chatId'];
      this.loadMessages();
    });
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    const chatId = this.currentChatId; // Beispiel: Setze deine aktuelle Chat-ID hier (z. B. aus Route oder State)

    this.messageService.getAllMessages(chatId).subscribe((msgs) => {
      this.messages = msgs;
    });
  }


  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const msgRequest: MessageRequest = {
      content: this.newMessage,
      chatId: this.currentChatId
    };


    this.messageService.saveMessage(msgRequest).subscribe(() => {
      this.loadMessages();

      const destination = `/app/chat/${this.currentChatId}`;
      this.websocketService.socketClient.send(destination, {}, JSON.stringify(msgRequest));

      this.newMessage = '';
    });
  }


  editMessage(msg: MessageResponse): void {
    if (!msg.id) {
      console.error('Nachrichten-ID fehlt, kann nicht bearbeitet werden.');
      return;
    }

    const newContent = prompt('Neue Nachricht:', msg.content);

    if (newContent !== null && newContent.trim() !== '') {
      this.messageService.editMessage(msg.id, newContent).subscribe(() => {
        this.loadMessages();
      });
    }
  }



  deleteMessage(msg: MessageResponse): void {
    if (!msg.id) {
      console.error('Nachrichten-ID fehlt, kann nicht gelöscht werden.');
      return;
    }

    if (confirm('Willst du die Nachricht wirklich löschen?')) {
      this.messageService.deleteMessage(msg.id).subscribe(() => {
        this.loadMessages();
      });
    }
  }



  startseite() {
    this.router.navigate(['/home']);
  }

  fahrtangebote() {
    this.router.navigate(['/fahrtangebote']);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.websocketService.disconnect();

  }
}
