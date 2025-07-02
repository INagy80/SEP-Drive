import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { MessageRequest } from '../../models/message-request';
import { NbChatModule, NbThemeModule, NbLayoutModule, NbButtonModule, NbCardModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { RouterModule } from '@angular/router';
import {Button} from 'primeng/button';
import { Router } from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    NbThemeModule,
    NbLayoutModule,
    NbEvaIconsModule,
    NbButtonModule,
    NbCardModule,
    NbChatModule,
    RouterModule,
    Button,
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
