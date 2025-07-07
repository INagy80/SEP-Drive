export interface ChatMessage {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  status: MessageStatus;
  rideRequestId: number | null;
  createdAt: Date;
  updatedAt: Date;
  isEditable: boolean;
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export interface SendMessageRequest {
  receiverUsername: string;
  content: string;
  rideRequestId?: number;
}

export interface EditMessageRequest {
  messageId: number;
  newContent: string;
}

export interface ChatConversation {
  messages: ChatMessage[];
  otherUser: string;
} 