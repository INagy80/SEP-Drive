import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, OverlayPanelModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent {
  notifications: string[] = ['Willkommen bei SEP Drive!'];

  @ViewChild('notificationPanel') notificationPanel!: OverlayPanel;

  toggleNotifications(event: Event) {
    this.notificationPanel.toggle(event);
  }

  addNotification(message: string) {
    this.notifications.unshift(message);
  }
}
