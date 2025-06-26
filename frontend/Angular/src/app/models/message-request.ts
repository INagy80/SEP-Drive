export interface MessageRequest {
  chatId?: string;
  content?: string;
  receiverId?: number;
  senderId?: number;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';
}
