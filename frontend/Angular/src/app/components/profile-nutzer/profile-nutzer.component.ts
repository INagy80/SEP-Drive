import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserProfile {
  username: string;
  role: 'Kunde' | 'Fahrer';
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  profilePicture: string;
  rating: number;
  totalRides: number;
  carClass?: 'Klein' | 'Medium' | 'Deluxe'; // Only for drivers
}

@Component({
  selector: 'app-profile-nutzer',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './profile-nutzer.component.html',
  styleUrls: ['./profile-nutzer.component.scss']
})
export class ProfileNutzerComponent implements OnInit {
  userProfile: UserProfile = {
    username: '',
    role: 'Kunde',
    firstName: '',
    lastName: '',
    email: '',
    birthDate: new Date(),
    profilePicture: '',
    rating: 0,
    totalRides: 0
  };

  isImageLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.loadUserProfile();
  }



  private loadUserProfile(): void {
    // TODO: Implement API call to get user profile
    // This is mock data for demonstration
    this.userProfile = {
      username: 'anynoym_benutzer123',
      role: 'Fahrer',
      firstName: 'Anonymer',
      lastName: 'Nutzer',
      email: 'anynoym@example.com',
      birthDate: new Date('1990-01-01'),
      profilePicture: './images/default-profile.jpg',
      rating: 4.5,
      totalRides: 150,
      carClass: 'Medium'
    };
  }
}
