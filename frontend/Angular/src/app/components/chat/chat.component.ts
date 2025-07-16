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
import { RefreshService } from '../../services/refresh-service';

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
  providers: [ConfirmationService], //wird benutzt in delete() , um eine eigene Instanz zu verwenden innerhalb der Komponente
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
  editingMessageId: number | null = null; // id der bearbeiteten Nachricht
  editingContent: string = ''; // inhalt der bearbeiteten Nachricht
  @Input() rideRequestId: number | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private chatService: ChatService,
    private refresh: RefreshService,
  ) {}

  //ngOnInit bereitet alles für den Chat vor: Benutzer laden, Nachrichten abonnieren, WebSocket aktivieren und Chatverlauf laden
  ngOnInit(): void {
    this.chatService.isChatOpen = true;

    this.loadCurrentUser();
    this.setupMessageSubscription();

    //Verbindung herstellen, Nachricht neu laden, verlauf laden
    this.refresh.refreshchat$.subscribe(() =>{  //subscribe wird ausgeführt , aber wartet, erst bei next() wird der codeblock ausgeführt
      this.setupMessageSubscription(); // Methode ladet nur neue Nachrichten, sorgt für Live-Updates
      this.chatService.ensureWebSocketConnection(); //

      if (this.otherUser && this.otherUser.trim()) {
        console.log('otherUser already set in ngOnInit:', this.otherUser);
        this.loadConversation(this.otherUser, this.rideRequestId || undefined); //holt alte Nachrichten, gibt den Verlauf an
      }
    });


    this.refresh.refreshreadMessage$.subscribe(() =>{
      if(this.chatService.isChatOpen){
        this.chatService.markallMessagesAsRead().subscribe();
      }
    })

    this.chatService.ensureWebSocketConnection();

    // wenn benutzer bekannt ist, wird der Chat direkt angezeigt (verlauf)
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
    this.subscriptions.forEach(sub => sub.unsubscribe());  //dauerhaft Observables solange es aktiv ist
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      this.currentUser = authResponse.kundeDTO?.userName || '';
    }
  }

  //ladet neue Nachrichten, aktiv/live und speichert sie im Array angezeigt
  private setupMessageSubscription(): void {
    const messageSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
    //im array speichern
    this.subscriptions.push(messageSub);
  }


  ngOnChanges(changes: any): void {
    if (changes['otherUser']) {
      console.log('otherUser changed to:', this.otherUser);
      if (this.otherUser && this.otherUser.trim()) {
        this.loadConversation(this.otherUser, this.rideRequestId || undefined);
      }
    }
  }

  //ladet den passenden Chat-Verlauf
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

    // Einfach zur Überprüfung ob das der Richtige Benutzer ist oder keine Fehler da sind
    console.log('otherUser after loading conversation:', this.otherUser);
  }

  sendMessage(): void {
    console.log('sendMessage called!');
    console.log('otherUser:', this.otherUser);
    console.log('newMessage:', this.newMessage);
    console.log('rideRequestId:', this.rideRequestId);

    //Zeile verhindert für Server/Benutzer dass man leere Nachrichten kann
    if (!this.newMessage.trim()) {
      console.log('Message is empty!');
      this.toastr.warning('Bitte geben Sie eine Nachricht ein', 'Hinweis');
      return;
    }

    //Existiert ein Benutzer?
    if (!this.otherUser || !this.otherUser.trim()) {
      console.log('otherUser is empty!');
      this.toastr.error('Chat-Partner nicht verfügbar. Bitte laden Sie die Seite neu.', 'Fehler');
      return;
    }

    // Wenn kein Benutzer existiert wird ein Fehler angezeigt
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.error('No user found in localStorage');
      this.toastr.error('Sie sind nicht eingeloggt. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
      return;
    }

    try { //code Teil der ein Fehler auslösen könnte
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      if (!authResponse.token) { //Token vorhanden -> Beweis dass ein Benutzer existiert
        console.error('No token found in user data');
        this.toastr.error('Ungültiger Token. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
        return;
      }
      console.log('User authenticated:', authResponse.kundeDTO?.userName);
    } catch (error) { //fängt den Fehler
      console.error('Error parsing user data:', error);
      this.toastr.error('Fehler beim Lesen der Benutzerdaten. Bitte melden Sie sich erneut an.', 'Authentifizierungsfehler');
      return;
    }

    // Sicherheitscheck : richtiger Empfänger ?
    console.log('Final otherUser check before sending:', this.otherUser);

    //Objekt bauen für Backend mit den Infos der Nachricht
    const messageContent = this.newMessage.trim(); //kontrolle ob da leerzeichen sind
    const request: SendMessageRequest = {
      receiverUsername: this.otherUser,
      content: messageContent,
      rideRequestId: this.rideRequestId || undefined
    };

    console.log('Sending message request:', request);

    // Temporäre Nachricht erzeugen, bis Id vom service kommt
    const tempMessage: ChatMessage = {
      id: Date.now(), // Temporary ID
      content: messageContent,
      senderUsername: this.currentUser,
      receiverUsername: this.otherUser,
      createdAt: new Date(), //Datum
      updatedAt: new Date(),
      status: MessageStatus.SENT,
      isEditable: true,
      rideRequestId: this.rideRequestId
    };

    // in messages hinzufügen damit man anzeigen kann
    this.messages.push(tempMessage);
    this.newMessage = '';

    // Scroll to bottom to show the new message
    setTimeout(() => this.scrollToBottom(), 100);

    // Mit subscribe() sende ich die Nachricht ans Backend. Bei Erfolg ersetze ich die temporäre Nachricht durch die echte, bei Fehler entferne ich sie wieder
    this.chatService.sendMessage(request).subscribe({
      next: (message) => {
        console.log('Message sent successfully:', message);
        this.chatService.markallMessagesAsRead().subscribe(

        );
        // Temporäre message ersetzten durch echte
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

        // Server hat Fehler → Nachricht darf nicht einfach so stehen bleiben man löscht temporäre M.
        const tempIndex = this.messages.findIndex(m => m.id === tempMessage.id);
        if (tempIndex !== -1) {
          this.messages.splice(tempIndex, 1); //anzahl wie viele Elemente gelöschten werden sollen; Array-Methode zum löschen
        }

        // Wenn der Server (Backend) einen Fehler zurückschickt, fängt Angular HTTP das ab und übergibt es in error
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
    if (this.chatService.isMessageEditable(message)) { //überprüfen, ob man bearbeiten kann
      return;
    }

    this.editingMessageId = message.id;
    this.editingContent = message.content;

    setTimeout(() => {
      this.messageInput?.nativeElement?.focus(); //focus() : Benutzer kann sofort lostippen, ohne extra klicken zu müssen
    }, 100);
  }



  cancelEdit(): void {
    this.editingMessageId = null;
    this.editingContent = '';
  }


//Nachrciht als gelesen makieren, wenn der Benutzer es gelesen hat
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

  //Prüfen, ob Nachricht bearbeitet/gelöscht werden  darf
  isMessageEditable(message: ChatMessage): boolean {
    return this.isOwnMessage(message) && (message.status !== MessageStatus.READ);
  }

  isMessageDeletable(message: ChatMessage): boolean {
    return this.isOwnMessage(message) && (message.status !== MessageStatus.READ);
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

  //Sie formatiert ein Datum (Timestamp) in eine lesbare Uhrzeit, damit es  neben einer Nachricht angezeigt werden kann.
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

  //Mit onKeyPress steuere ich, dass Enter die Nachricht sofort abschickt, aber Shift+Enter eine neue Zeile erzeug
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); //Verhindert, dass der Browser standardmäßig eine neue Zeile im Input erzeugt.
      this.sendMessage();
    }
  }

  //Benutze die Nachricht-ID, um jede Nachricht eindeutig zu erkennen
  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }

  deleteMessage(message: ChatMessage): void {
    if (this.chatService.isMessageDeletable(message)) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Möchten Sie diese Nachricht wirklich löschen?',
      accept: () => {
        this.chatService.deleteMessage(message.id).subscribe({
          next: () => {
            this.toastr.success('Nachricht gelöscht', 'Erfolg');
            this.refresh.refreshChat();
          },
          error: (error) => {
            console.error('Error deleting message:', error);
            this.toastr.error('Fehler beim Löschen der Nachricht', 'Fehler');
          }
        });
      }
    });
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
        this.refresh.refreshChat();
      },
      error: (error) => {
        console.error('Error editing message:', error);
        this.toastr.error('Fehler beim Bearbeiten der Nachricht', 'Fehler');
      }
    });
  }

}
