import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import { ChatResponse } from '../../models/chat-response';
import { MessageResponse } from '../../models/message-response';
import { MessageRequest } from '../../models/message-request';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {ActivatedRoute, Router} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {GeldKontoService} from '../../services/geld-konto.service';
import {WebsocketService} from '../../services/websocket.service';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NbChatModule, NbFocusMonitor, NbStatusService} from '@nebular/theme';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-chat',
  imports: [
    PickerComponent,
    CommonModule,
    FormsModule,
    NbChatModule,
    Button,
  ],
  providers: [
    NbStatusService,
    NbFocusMonitor,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})

export class ChatComponent implements OnInit {
  chatId!: string;
  currentUserId!: number;
  receiverId!: number;
  messages: any[] = []; // Nebular Messages
  newMessage = '';

  constructor(private route: ActivatedRoute,
              private messageService: MessageService,
              private router: Router,
              private WebSocketService : WebsocketService,)
  {}


  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId')!;
    this.currentUserId = Number(localStorage.getItem('userId'));
    this.receiverId = Number(localStorage.getItem('receiverId'));

    this.loadMessages();
    this.markMessagesAsSeen();
  }

  loadMessages() {
    this.messageService.getAllMessages(this.chatId).subscribe((msgs) => {
      this.messages = msgs.map((msg) => ({
        text: msg.content,
        date: new Date(msg.createdAt!),
        reply: msg.senderId === this.currentUserId,
        user: {
          name: msg.senderId === this.currentUserId ? 'Ich' : 'Partner',
          avatar: msg.senderId === this.currentUserId
            ? 'https://i.pravatar.cc/150?img=12'
            : 'https://i.pravatar.cc/150?img=23',
        },
        state: msg.state,
        originalMessage: msg, // Zum Bearbeiten/Löschen speichern
      }));
    });
  }

  markMessagesAsSeen() {
    this.messageService.setMessageToSeen(this.chatId).subscribe();
  }

  sendMessage(event: any) {
    const message: MessageRequest = {
      chatId: this.chatId,
      content: event.message,
      senderId: this.currentUserId,
      receiverId: this.receiverId,
      type: 'TEXT',
    };

    this.messageService.saveMessage(message).subscribe(() => {
      this.loadMessages();
    });
  }

  onEditClicked(msg: any) {
    if (msg.reply) {
      this.editMessage(msg);
    }
  }

  onDeleteClicked(event: MouseEvent, msg: any) {
    event.preventDefault();
    if (msg.reply) {
      this.deleteMessage(msg);
    }
  }

  editMessage(msg: any) {
    if (msg.state !== 'SEEN') {
      const newContent = prompt('Neue Nachricht eingeben:', msg.text);
      if (newContent && newContent.trim() !== msg.text) {
        const editedMessage: MessageRequest = {
          chatId: this.chatId,
          content: newContent,
          senderId: this.currentUserId,
          receiverId: this.receiverId,
          type: 'TEXT',
        };

        this.messageService.saveMessage(editedMessage).subscribe(() => {
          this.loadMessages();
        });
      }
    } else {
      alert('Nachricht kann nicht mehr bearbeitet werden (bereits gelesen).');
    }
  }

  deleteMessage(msg: any) {
    if (msg.state !== 'SEEN') {
      const deletedMessage: MessageRequest = {
        chatId: this.chatId,
        content: '[Gelöscht]',
        senderId: this.currentUserId,
        receiverId: this.receiverId,
        type: 'TEXT',
      };

      this.messageService.saveMessage(deletedMessage).subscribe(() => {
        this.loadMessages();
      });
    } else {
      alert('Nachricht kann nicht mehr gelöscht werden (bereits gelesen).');
    }
  }



  startseite() {
    this.router.navigate(['/home']);

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }

}
