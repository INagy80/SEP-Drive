import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatListComponent} from '../chat-list/chat-list.component';
import {DatePipe} from '@angular/common';
import { ChatResponse } from '../../models/chat-response';
import { MessageResponse } from '../../models/message-response';
import { MessageRequest } from '../../models/message-request';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChatService } from '../../services/chat.service';
import { MessageService } from '../../services/message.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {Router} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {GeldKontoService} from '../../services/geld-konto.service';
import {WebsocketService} from '../../services/websocket.service';
import {PickerComponent} from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ChatListComponent,
    PickerComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  selectedChat: ChatResponse = {};
  chats: Array<ChatResponse> = [];
  chatMessages: Array<MessageResponse> = [];
  socketClient: any = null;
  messageContent: string = '';
  showEmojis = false;
  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef<HTMLDivElement>;
  private notificationSubscription: any;
  senderid : number = 0;

  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private router: Router,
    private profileService : ProfileService,
    private sanitizer: DomSanitizer,
    private geldKontoService :GeldKontoService,
    private WebSocketService : WebsocketService,
  ) {
  }



  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.socketClient !== null) {
      this.socketClient.disconnect();
      this.notificationSubscription.unsubscribe();
      this.socketClient = null;
    }
  }

  ngOnInit(): void {
    this.WebSocketService.connect();
    this.getAllChats();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      if (kundeDTO) {
        this.senderid = kundeDTO.id;

      }
    }
  }

  chatSelected(chatResponse: ChatResponse) {
    this.selectedChat = chatResponse;
    this.getAllChatMessages(chatResponse.id as string);
    this.setMessagesToSeen();
    this.selectedChat.unreadCount = 0;
  }

  isSelfMessage(message: MessageResponse): boolean {
    return message.senderId === this.senderid;
  }

  sendMessage() {
    if (this.messageContent) {
      const messageRequest: MessageRequest = {
        chatId: this.selectedChat.id,
        senderId: this.getSenderId(),
        receiverId: this.getReceiverId(),
        content: this.messageContent,
        type: 'TEXT',
      };
      this.messageService.saveMessage(
        messageRequest
      ).subscribe({
        next: () => {
          const message: MessageResponse = {
            senderId: this.getSenderId(),
            receiverId: this.getReceiverId(),
            content: this.messageContent,
            type: 'TEXT',
            state: 'SENT',
            createdAt: new Date().toString()
          };
          this.selectedChat.lastMessage = this.messageContent;
          this.chatMessages.push(message);
          this.messageContent = '';
          this.showEmojis = false;
        }
      });
    }
  }

  keyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onSelectEmojis(emojiSelected: any) {
    const emoji: EmojiData = emojiSelected.emoji;
    this.messageContent += emoji.native;
  }

  onClick() {
    this.setMessagesToSeen();
  }

  uploadMedia(target: EventTarget | null) {
    const file = this.extractFileFromTarget(target);
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) {
        return;
      }

      // 1) extract the base64 payload for your local-preview logic
      const mediaLines = (reader.result as string).split(',')[1];

      // 2) optimistically add a “sending” message to the UI
      const tempMessage: MessageResponse = {
        senderId: this.getSenderId(),
        receiverId: this.getReceiverId(),
        content: 'Attachment',
        type: 'IMAGE',
        state: 'SENT',           // you could flip to 'SENT' or 'FAILED' later
        media: [mediaLines],
        createdAt: new Date().toString()
      };
      this.chatMessages.push(tempMessage);

      // 3) actually send the file via your service’s new signature
      this.messageService
        .uploadMedia(this.selectedChat.id as string, file)
        .subscribe({
          next: () => {
            // on success flip the state on your temp message:
            tempMessage.state = 'SENT';
          },
          error: () => {


          }
        });
    };

    // kick off the DataURL‐read (needed for your preview logic)
    reader.readAsDataURL(file);
  }


  startseite() {
    this.router.navigate(['/home']);

  }

  editProfile() {
    this.router.navigate(['/edit-profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }

  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }

  profile() {
    this.router.navigate(['/profile']);

  }

  private setMessagesToSeen() {
    this.messageService.setMessageToSeen(this.selectedChat.id as string).subscribe({
      next: () => {
      }
    });
  }

  private getAllChats() {
    this.chatService.getChatsByReceiver()
      .subscribe({
        next: (res) => {
          this.chats = res;
        }
      });
  }

  private getAllChatMessages(chatId: string) {
    this.messageService.getAllMessages(chatId).subscribe({
      next: (messages) => {
        this.chatMessages = messages;
      }
    });
  }

  // private initWebSocket() {
  //   if (this.keycloakService.keycloak.tokenParsed?.sub) {
  //     let ws = new SockJS('http://localhost:8080/ws');
  //     this.socketClient = Stomp.over(ws);
  //     const subUrl = `/user/${this.keycloakService.keycloak.tokenParsed?.sub}/chat`;
  //     this.socketClient.connect({'Authorization': 'Bearer ' + this.keycloakService.keycloak.token},
  //       () => {
  //         this.notificationSubscription = this.socketClient.subscribe(subUrl,
  //           (message: any) => {
  //             const notification: Notification = JSON.parse(message.body);
  //             this.handleNotification(notification);
  //
  //           },
  //           () => console.error('Error while connecting to webSocket')
  //         );
  //       }
  //     );
  //   }
  // }

  // private handleNotification(notification: Notification) {
  //   if (!notification) return;
  //   if (this.selectedChat && this.selectedChat.id === notification.chatId) {
  //     switch (notification.type) {
  //       case 'MESSAGE':
  //       case 'IMAGE':
  //         const message: MessageResponse = {
  //           senderId: notification.senderId,
  //           receiverId: notification.receiverId,
  //           content: notification.content,
  //           type: notification.messageType,
  //           media: notification.media,
  //           createdAt: new Date().toString()
  //         };
  //         if (notification.type === 'IMAGE') {
  //           this.selectedChat.lastMessage = 'Attachment';
  //         } else {
  //           this.selectedChat.lastMessage = notification.content;
  //         }
  //         this.chatMessages.push(message);
  //         break;
  //       case 'SEEN':
  //         this.chatMessages.forEach(m => m.state = 'SEEN');
  //         break;
  //     }
  //   } else {
  //     const destChat = this.chats.find(c => c.id === notification.chatId);
  //     if (destChat && notification.type !== 'SEEN') {
  //       if (notification.type === 'MESSAGE') {
  //         destChat.lastMessage = notification.content;
  //       } else if (notification.type === 'IMAGE') {
  //         destChat.lastMessage = 'Attachment';
  //       }
  //       destChat.lastMessageTime = new Date().toString();
  //       destChat.unreadCount! += 1;
  //     } else if (notification.type === 'MESSAGE') {
  //       const newChat: ChatResponse = {
  //         id: notification.chatId,
  //         senderId: notification.senderId,
  //         receiverId: notification.receiverId,
  //         lastMessage: notification.content,
  //         name: notification.chatName,
  //         unreadCount: 1,
  //         lastMessageTime: new Date().toString()
  //       };
  //       this.chats.unshift(newChat);
  //     }
  //   }
  // }

  private getSenderId(): number {
    if (this.selectedChat.senderId === this.senderid) {
      return this.selectedChat.senderId ;
    }
    return this.selectedChat.receiverId || 0 ;
  }

  private getReceiverId(): number {
    if (this.selectedChat.senderId === this.senderid) {
      return this.selectedChat.receiverId || 0;
    }
    return this.selectedChat.senderId || 0 ;
  }

  private scrollToBottom() {
    if (this.scrollableDiv) {
      const div = this.scrollableDiv.nativeElement;
      div.scrollTop = div.scrollHeight;
    }
  }

  private extractFileFromTarget(target: EventTarget | null): File | null {
    const htmlInputTarget = target as HTMLInputElement;
    if (target === null || htmlInputTarget.files === null) {
      return null;
    }
    return htmlInputTarget.files[0];
  }

  trackByMessage(index: number, message: MessageResponse): number {
    return message.id || 0;    // or return index if you don’t have a unique id
  }

}
