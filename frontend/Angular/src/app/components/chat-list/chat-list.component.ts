import { Component, input, InputSignal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatResponse } from '../../models/chat-response';
import { kundeDto } from '../../models/kunde-dto';
import { ChatService } from '../../services/chat.service';
import { AuthenticationResponse } from '../../models/authentication-response';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,    // provides NgIf, NgFor, the date pipe, etc.
    FormsModule
  ],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']  // <-- note the plural
})
export class ChatListComponent {
  /** Signal of chats passed from parent */
  chats: InputSignal<ChatResponse[]> = input<ChatResponse[]>([]);
  searchNewContact = false;
  contacts: Array<kundeDto> = [];
  chatSelected = output<ChatResponse>();

  constructor(private chatService: ChatService) {}

  /** trackBy for *ngFor="…; trackBy: trackByChat" */
  trackByChat(index: number, chat: ChatResponse): string {
    return chat.id as string;
  }

  /** trackBy for *ngFor="…; trackBy: trackByContact" */
  trackByContact(index: number, contact: kundeDto): number {
    return contact.id;
  }

  searchContact() {
    this.chatService.getAllcontacts().subscribe({
      next: (users) => {
        this.contacts = users;
        this.searchNewContact = true;
      }
    });
  }

  selectContact(contact: kundeDto) {
    let senderId = 0;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      if (kundeDTO) {
        senderId = kundeDTO.id;
      }
    }

    this.chatService.createChat(contact.id).subscribe({
      next: (res) => {
        const chat: ChatResponse = {
          id: res.response,
          name: `${contact.firstName} ${contact.lastName}`,
          recipientOnline: true,
          lastMessageTime: 'now',
          senderId,
          receiverId: contact.id
        };
        this.chats().unshift(chat);
        this.searchNewContact = false;
        this.chatSelected.emit(chat);
      }
    });
  }

  chatClicked(chat: ChatResponse) {
    this.chatSelected.emit(chat);
  }

  wrapMessage(lastMessage?: string): string {
    if (lastMessage && lastMessage.length <= 20) {
      return lastMessage;
    }
    return lastMessage ? `${lastMessage.substring(0, 17)}...` : '';
  }
}
