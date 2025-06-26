export interface ChatResponse {
  id?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  name?: string;
  receiverId?: number;
  recipientOnline?: boolean;
  senderId?: number;
  unreadCount?: number;
}
