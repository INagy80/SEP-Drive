import {Component, Inject, OnInit, output, PLATFORM_ID} from '@angular/core';
import {Button} from "primeng/button";
import {FormsModule} from "@angular/forms";
import { GeldKontoService } from '../../services/geld-konto.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {RideRequestService} from '../../services/rideRequest/ride-request.service';
import {Router} from '@angular/router';
import {ProfileService} from '../../services/profile/profile.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from '../../services/notification.service';
import {NgIf} from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-geld-konto',
  standalone: true,
    imports: [
        Button,
        FormsModule,
        NgIf
    ],
  templateUrl: './geld-konto.component.html',
  styleUrl: './geld-konto.component.scss'
})
export class GeldKontoComponent implements OnInit {



   myBalance : number = 0.0;

  // Is the dropdown panel currently open?
  isBalanceDropdownOpen = false;

  // The value typed into the "balance" input
  amountInput: number | null = null;


  constructor(
    private geldKontoService: GeldKontoService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private rideRequestService : RideRequestService,
    private router: Router,
    private profileService : ProfileService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.loadMyBalance();
    this.addBalance();
    }


  loadMyBalance(){
    this.geldKontoService.getMyBalance().subscribe({
      next: balance => {
        this.myBalance = balance;
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
          this.toastr.success('Your balance has been added successfully.', 'Done!!');
          this.isBalanceDropdownOpen = false;
        }, error: error => {
          console.log(error);
          this.toastr.warning('Something went Wrong', 'Oops!!');

        }
      })


    }
  }


}
