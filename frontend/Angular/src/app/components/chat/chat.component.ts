import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {ChatService} from '../../services/chat.service';

import { ChatMessage, MessageStatus, SendMessageRequest, EditMessageRequest } from '../../models/chat-message.model';
import { AuthenticationResponse } from '../../models/authentication-response';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ScrollPanelModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  currentUser: string = '';
  @Input() otherUser: string = '';
  newMessage: string = '';
  editingMessageId: number | null = null;
  editingContent: string = '';
  @Input() rideRequestId: number | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.chatService.isChatOpen = true;

    this.loadCurrentUser();
    this.setupMessageSubscription();

    // Ensure WebSocket connection
    this.chatService.ensureWebSocketConnection();

    // If otherUser is already set, load conversation immediately
    if (this.otherUser && this.otherUser.trim()) {
      console.log('otherUser already set in ngOnInit:', this.otherUser);
      this.loadConversation(this.otherUser, this.rideRequestId || undefined);
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.chatService.isChatOpen = false;
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      this.currentUser = authResponse.kundeDTO?.userName || '';
    }
  }

  private setupMessageSubscription(): void {
    const messageSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // Don't override otherUser from the conversation subscription
    // as it can interfere with ride request chats
    this.subscriptions.push(messageSub);
  }

  // Watch for changes to otherUser input
  ngOnChanges(changes: any): void {
    if (changes['otherUser']) {
      console.log('otherUser changed to:', this.otherUser);
      if (this.otherUser && this.otherUser.trim()) {
        this.loadConversation(this.otherUser, this.rideRequestId || undefined);
      }
    }
  }

  loadConversation(otherUsername: string, rideRequestId?: number): void {
    console.log('Loading conversation with:', otherUsername, 'rideRequestId:', rideRequestId);
    this.otherUser = otherUsername;
    this.rideRequestId = rideRequestId || null;

    // Ensure WebSocket connection before loading conversation
    this.chatService.ensureWebSocketConnection();

    if (rideRequestId) {
      console.log('Loading ride request messages for ID:', rideRequestId);
      this.chatService.loadRideRequestMessages(rideRequestId);
    } else {
      console.log('Loading conversation with user:', otherUsername);
      this.chatService.loadConversation(otherUsername);
    }

    // Ensure otherUser is set correctly after loading
    console.log('otherUser after loading conversation:', this.otherUser);
  }

  sendMessage(): void {
    console.log('sendMessage called!');
    console.log('otherUser:', this.otherUser);
    console.log('newMessage:', this.newMessage);
    console.log('rideRequestId:', this.rideRequestId);

    if (!this.newMessage.trim()) {
      console.log('Message is empty!');
      this.toastr.warning('Bitte geben Sie eine Nachricht ein', 'Hinweis');
      return;
    }

    if (!this.otherUser || !this.otherUser.trim()) {
      console.log('otherUser is empty!');
      this.toastr.error('Chat-Partner nicht verfügbar. Bitte laden Sie die Seite neu.', 'Fehler');
      return;
    }

    // Check if user is authenticated
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.error('No user found in localStorage');
      this.toastr.error('Sie sind nicht eingeloggt. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
      return;
    }

    try {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      if (!authResponse.token) {
        console.error('No token found in user data');
        this.toastr.error('Ungültiger Token. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
        return;
      }
      console.log('User authenticated:', authResponse.kundeDTO?.userName);
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.toastr.error('Fehler beim Lesen der Benutzerdaten. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
      return;
    }

    // Double-check that otherUser is still valid
    console.log('Final otherUser check before sending:', this.otherUser);

    const messageContent = this.newMessage.trim();
    const request: SendMessageRequest = {
      receiverUsername: this.otherUser,
      content: messageContent,
      rideRequestId: this.rideRequestId || undefined
    };

    console.log('Sending message request:', request);

    // Create temporary message for immediate display (like WhatsApp)
    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      content: messageContent,
      senderUsername: this.currentUser,
      receiverUsername: this.otherUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: MessageStatus.SENT,
      isEditable: true,
      rideRequestId: this.rideRequestId
    };

    // Add message immediately to the list (like WhatsApp)
    this.messages.push(tempMessage);
    this.newMessage = '';

    // Scroll to bottom to show the new message
    setTimeout(() => this.scrollToBottom(), 100);

    // Send to server
    this.chatService.sendMessage(request).subscribe({
      next: (message) => {
        console.log('Message sent successfully:', message);
        // Replace temporary message with real one from server
        const tempIndex = this.messages.findIndex(m => m.id === tempMessage.id);
        if (tempIndex !== -1) {
          this.messages[tempIndex] = message;
        }
        this.toastr.success('Nachricht gesendet', 'Erfolg');
      },
      error: (error) => {
        console.error('Error sending message:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);

        // Remove temporary message if sending failed
        const tempIndex = this.messages.findIndex(m => m.id === tempMessage.id);
        if (tempIndex !== -1) {
          this.messages.splice(tempIndex, 1);
        }

        // Handle specific error cases
        if (error.status === 403) {
          this.toastr.error('Zugriff verweigert. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
        } else if (error.status === 401) {
          this.toastr.error('Nicht autorisiert. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
        } else {
          this.toastr.error('Fehler beim Senden der Nachricht', 'Fehler');
        }
      }
    });
  }

  startEditing(message: ChatMessage): void {
    if (!this.chatService.isMessageEditable(message)) {
      return;
    }

    this.editingMessageId = message.id;
    this.editingContent = message.content;

    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 100);
  }

  saveEdit(): void {
    if (!this.editingMessageId || !this.editingContent.trim()) {
      this.cancelEdit();
      return;
    }

    const request: EditMessageRequest = {
      messageId: this.editingMessageId,
      newContent: this.editingContent.trim()
    };

    this.chatService.editMessage(request).subscribe({
      next: (updatedMessage) => {
        this.cancelEdit();
        this.toastr.success('Nachricht bearbeitet', 'Erfolg');
      },
      error: (error) => {
        console.error('Error editing message:', error);
        this.toastr.error('Fehler beim Bearbeiten der Nachricht', 'Fehler');
      }
    });
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editingContent = '';
  }

  deleteMessage(message: ChatMessage): void {
    if (!this.chatService.isMessageDeletable(message)) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Möchten Sie diese Nachricht wirklich löschen?',
      accept: () => {
        this.chatService.deleteMessage(message.id).subscribe({
          next: () => {
            this.toastr.success('Nachricht gelöscht', 'Erfolg');
          },
          error: (error) => {
            console.error('Error deleting message:', error);
            this.toastr.error('Fehler beim Löschen der Nachricht', 'Fehler');
          }
        });
      }
    });
  }

  markMessageAsRead(message: ChatMessage): void {
    if (
      this.chatService.isChatOpen &&
      message.senderUsername !== this.currentUser &&
      message.status !== MessageStatus.READ
    ) {
      this.chatService.markMessageAsRead(message.id).subscribe({
        error: (error) => {
          console.error('Error marking message as read:', error);
        }
      });
    }
  }


  isOwnMessage(message: ChatMessage): boolean {
    return message.senderUsername === this.currentUser;
  }

  isMessageEditable(message: ChatMessage): boolean {
    return message.isEditable &&
      (message.status === MessageStatus.SENT || message.status === MessageStatus.DELIVERED);
  }

  isMessageDeletable(message: ChatMessage): boolean {
    return message.isEditable &&
      (message.status === MessageStatus.SENT || message.status === MessageStatus.DELIVERED);
  }



  getStatusText(status: MessageStatus): string {
    return this.chatService.getStatusText(status);
  }

  getStatusClass(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.SENT:
        return 'status-sent';
      case MessageStatus.DELIVERED:
        return 'status-delivered';
      case MessageStatus.READ:
        return 'status-read';
      default:
        return 'status-unknown';
    }
  }

  getStatusIcon(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.SENT:
        return 'pi-check';
      case MessageStatus.DELIVERED:
        return 'pi-check-double';
      case MessageStatus.READ:
        return 'pi-check-double status-read';
      default:
        return 'pi-clock';
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }
}
