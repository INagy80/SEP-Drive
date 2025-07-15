import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {environment} from '../../eviroments/environment';
import { ChatMessage, SendMessageRequest, EditMessageRequest, MessageStatus } from '../models/chat-message.model';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public isChatOpen = false;

  private readonly chatUrl = `${environment.api.baseUrl}/${environment.api.chatUrl}`;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private currentConversationSubject = new BehaviorSubject<string | null>(null);
  public currentConversation$ = this.currentConversationSubject.asObservable();

  constructor(
    private http: HttpClient,
    private websocketService: WebsocketService
  ) {
    // Setup WebSocket listeners after a short delay to ensure WebSocket service is ready
    setTimeout(() => {
      this.setupWebSocketListeners();
    }, 1000);
  }

  private setupWebSocketListeners(): void {
    // Subscribe to new messages from WebSocket service
    this.websocketService.chatMessage$.subscribe((message: ChatMessage | null) => {
      if (message) {
        console.log('Received new message via WebSocket service:', message);
        this.addMessageToConversation(message);
      }
    });

    // Subscribe to message updates from WebSocket service
    this.websocketService.chatMessageUpdated$.subscribe((message: ChatMessage | null) => {
      if (message) {
        console.log('Received message update via WebSocket service:', message);
        this.updateMessageInConversation(message);
      }
    });

    // Subscribe to message deletions from WebSocket service
    this.websocketService.chatMessageDeleted$.subscribe((messageId: number | null) => {
      if (messageId) {
        console.log('Received message deletion via WebSocket service:', messageId);
        this.removeMessageFromConversation(messageId);
      }
    });

    // Subscribe to read receipts from WebSocket service
    this.websocketService.chatMessageRead$.subscribe((messageId: number | null) => {
      if (messageId) {
        console.log('Received read receipt via WebSocket service:', messageId);
        // Update message status locally
        const currentMessages = this.messagesSubject.value;
        const updatedMessages = currentMessages.map(msg =>
          msg.id === messageId ? { ...msg, status: MessageStatus.READ } : msg
        );
        this.messagesSubject.next(updatedMessages);
      }
    });
  }

  // REST API methods
  sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.chatUrl}/send`, request);
  }

  getConversation(username: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.chatUrl}/conversation/${username}`);
  }

  getRideRequestMessages(rideRequestId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.chatUrl}/ride/${rideRequestId}`);
  }

  editMessage(request: EditMessageRequest): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.chatUrl}/edit`, request);
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.chatUrl}/delete/${messageId}`);
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.chatUrl}/read/${messageId}`, {});
  }

  markallMessagesAsRead(): Observable<void> {
    return this.http.put<void>(`${this.chatUrl}/read/markall`,{});
  }

  markMessagesAsDelivered(senderUsername: string): Observable<void> {
    return this.http.put<void>(`${this.chatUrl}/delivered/${senderUsername}`, {});
  }

  // WebSocket methods
  sendMessageViaWebSocket(request: SendMessageRequest): void {
    if (this.websocketService.socketClient?.connected) {
      this.websocketService.socketClient.send('/app/chat.send', {}, JSON.stringify(request));
    }
  }

  editMessageViaWebSocket(request: EditMessageRequest): void {
    if (this.websocketService.socketClient?.connected) {
      this.websocketService.socketClient.send('/app/chat.edit', {}, JSON.stringify(request));
    }
  }

  deleteMessageViaWebSocket(messageId: number): void {
    if (this.websocketService.socketClient?.connected) {
      this.websocketService.socketClient.send('/app/chat.delete', {}, JSON.stringify(messageId));
    }
  }

  markMessageAsReadViaWebSocket(messageId: number): void {
    if (this.websocketService.socketClient?.connected) {
      this.websocketService.socketClient.send('/app/chat.read', {}, JSON.stringify(messageId));
    }
  }

  // Conversation management
  loadConversation(username: string): void {
    this.currentConversationSubject.next(username);
    this.getConversation(username).subscribe({
      next: (messages) => {
        this.messagesSubject.next(messages);
        // Mark messages as delivered when conversation is opened
        this.markMessagesAsDelivered(username).subscribe();
      },
      error: (error) => {
        console.error('Error loading conversation:', error);
      }
    });
  }

  loadRideRequestMessages(rideRequestId: number): void {
    console.log('Loading ride request messages for ID:', rideRequestId);
    // Set current conversation to ride request format
    this.currentConversationSubject.next(`ride_${rideRequestId}`);

    this.getRideRequestMessages(rideRequestId).subscribe({
      next: (messages) => {
        console.log('Loaded ride request messages:', messages);
        this.messagesSubject.next(messages);
      },
      error: (error) => {
        console.error('Error loading ride request messages:', error);
      }
    });
  }

  private addMessageToConversation(message: ChatMessage): void {
    console.log('Adding message to conversation:', message);
    console.log('Current conversation:', this.currentConversationSubject.value);

    const currentMessages = this.messagesSubject.value;

    // Check if this message belongs to the current conversation
    const currentConversation = this.currentConversationSubject.value;
    const isRideRequestChat = currentConversation && currentConversation.startsWith('ride_');

    let shouldAddMessage = false;

    if (isRideRequestChat) {
      // For ride request chats, check if message has the same rideRequestId
      const rideRequestId = parseInt(currentConversation.replace('ride_', ''));
      shouldAddMessage = message.rideRequestId === rideRequestId;
    } else {
      // For user chats, check if sender or receiver matches current conversation
      shouldAddMessage = message.senderUsername === currentConversation ||
                        message.receiverUsername === currentConversation;
    }

    if (shouldAddMessage) {
      console.log('Message belongs to current conversation, adding it');
      const updatedMessages = [...currentMessages, message];
      this.messagesSubject.next(updatedMessages);
    } else {
      console.log('Message does not belong to current conversation, ignoring');
    }
  }

  private updateMessageInConversation(updatedMessage: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.map(msg =>
      msg.id === updatedMessage.id ? updatedMessage : msg
    );
    this.messagesSubject.next(updatedMessages);
  }

  private removeMessageFromConversation(messageId: number): void {
    const currentMessages = this.messagesSubject.value;
    const updatedMessages = currentMessages.filter(msg => msg.id !== messageId);
    this.messagesSubject.next(updatedMessages);
  }



  // Utility methods
  isMessageEditable(message: ChatMessage): boolean {
    return message.isEditable && message.status !== MessageStatus.READ;
  }

  isMessageDeletable(message: ChatMessage): boolean {
    return message.isEditable && message.status !== MessageStatus.READ;
  }

  getStatusText(status: MessageStatus): string {
    switch (status) {
      case MessageStatus.SENT:
        return 'Gesendet';
      case MessageStatus.DELIVERED:
        return 'Zugestellt';
      case MessageStatus.READ:
        return 'Gelesen';
      default:
        return 'Unbekannt';
    }
  }

  // Check and ensure WebSocket connection
  ensureWebSocketConnection(): void {
    if (!this.websocketService.socketClient?.connected) {
      console.log('WebSocket not connected, attempting to reconnect...');
      this.websocketService.connect();
    } else {
      console.log('WebSocket is connected');
    }
  }

  // Refresh current conversation
  refreshCurrentConversation(): void {
    const currentConversation = this.currentConversationSubject.value;
    if (currentConversation) {
      if (currentConversation.startsWith('ride_')) {
        const rideRequestId = parseInt(currentConversation.replace('ride_', ''));
        this.loadRideRequestMessages(rideRequestId);
      } else {
        this.loadConversation(currentConversation);
      }
    }
  }

  // Re-setup WebSocket listeners (useful for debugging)
  reSetupWebSocketListeners(): void {
    console.log('Re-setting up WebSocket listeners...');
    this.setupWebSocketListeners();
  }
}
