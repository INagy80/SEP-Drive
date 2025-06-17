import {Component, Inject, OnInit, output, PLATFORM_ID} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {FormsModule} from "@angular/forms";
import { GeldKontoService } from '../../services/geld-konto.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {RideRequestService} from '../../services/rideRequest/ride-request.service';
import {Router} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgIf} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {RefreshService} from '../../services/refresh-service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {Rating} from 'primeng/rating';
import {ftruncate} from 'node:fs';

@Component({
  selector: 'app-geld-konto',
  standalone: true,
  imports: [
    Button,
    FormsModule,
    NgIf,
    Rating,
    ButtonDirective
  ],
  templateUrl: './geld-konto.component.html',
  styleUrl: './geld-konto.component.scss'
})
export class GeldKontoComponent implements OnInit {



   myBalance : number = 0.0;
  formattedBalance: string = this.myBalance.toFixed(2);

  // Is the dropdown panel currently open?
  isBalanceDropdownOpen = false;

  // The value typed into the "balance" input
  amountInput: number | null = null;

  private sub!: Subscription;

  bewertungAktiv = false;
  sterne: number = 0;
  user: 'Driver' | 'Customer' = 'Customer';
  isdriver: boolean = false;
  rideId: number = 0;


  constructor(
    private geldKontoService: GeldKontoService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private rideRequestService : RideRequestService,
    private router: Router,
    private profileService : ProfileService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private refresh: RefreshService

  ) { }

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      this.isdriver = kundeDTO?.dtype !== 'Kunde';
    }

    this.loadMyBalance();
    this.addBalance();

    this.sub = this.refresh.refreshAfterSimulationEnds$.subscribe((rideId: number) => {
      this.loadMyBalance();
      this.bewertungAktiv = true;
      this.rideId = rideId;
    });

    }


  loadMyBalance(){
    this.geldKontoService.getMyBalance().subscribe({
      next: balance => {
        this.myBalance = balance;
        this.formattedBalance = this.myBalance.toFixed(2);
      }, error: error => {
        console.log(error);
        this.toastr.warning('Something went Wrong', 'Oops!!');

      }
    });

  }




  togglebalanceDropdown() {
    this.isBalanceDropdownOpen = !this.isBalanceDropdownOpen;
    // If closing the entire panel, also hide history
  }

  addBalance(){
    if(this.amountInput != null && this.amountInput > 0){
      this.geldKontoService.addBalance(this.amountInput).subscribe({
        next: data => {
          this.myBalance = data;
          this.formattedBalance = this.myBalance.toFixed(2);
          this.toastr.success('Your balance has been added successfully.', 'Done!!');
          this.isBalanceDropdownOpen = false;
        }, error: error => {
          console.log(error);
          this.toastr.warning('Something went Wrong', 'Oops!!');

        }
      })


    }
  }



close(){
    this.bewertungAktiv = false;
}



  bewertungAbgeben() {

    if(this.isdriver){
      this.user = 'Driver';
    }

    this.rideRequestService.updateRating(this.user, this.rideId, this.sterne).subscribe({
        next: ()  => {
          console.log('rating updated to '+ this.sterne);
          console.log(this.rideId);
          console.log(this.user);
          this.toastr.success('Thank you for Ratting.', 'Done!!');
          this.bewertungAktiv = false;
        },
        error: (err) => {
          //alert('something went wrong');
          this.toastr.error('something went wrong', 'Error!!');
        }

      }
    );

  }


}
