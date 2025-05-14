import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile-edite',
  standalone: true,
  templateUrl: './profile-edite.component.html',
  styleUrls: ['./profile-edite.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
  ],


})


export class ProfileEditeComponent implements OnInit {
  userProfile: any = {};
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Beispiel-Daten (ersetzt später einen Service)
    this.userProfile = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      birthDate: '',
      role: 'Fahrer',
      carClass: '',
      profilePicture: ''
    };

    this.previewUrl = this.userProfile.profilePicture;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveChanges(){
    const formData = new FormData();

    // Nur wenn ein neues Bild ausgewählt wurde
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    // Weitere Profilfelder
    formData.append('firstName', this.userProfile.firstName);
    formData.append('lastName', this.userProfile.lastName);
    formData.append('username', this.userProfile.username);
    formData.append('email', this.userProfile.email);
    formData.append('birthDate', this.userProfile.birthDate);

    if (this.userProfile.role === 'Fahrer') {
      formData.append('carClass', this.userProfile.carClass);
    }

    // TODO: An Backend senden (z. B. mit HttpClient)
    console.log('FormData bereit zum Senden:', formData);

    await  this.router.navigate(['/profil-nutzer']);
  }
}
