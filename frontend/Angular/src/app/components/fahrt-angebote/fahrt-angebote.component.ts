import {DropdownModule} from 'primeng/dropdown';
import {Calendar} from 'primeng/calendar';
import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID} from '@angular/core';
import { Router } from '@angular/router';
import {Button} from 'primeng/button';
import {Table, TableModule } from 'primeng/table';
import { OnInit, ViewChild } from '@angular/core';
import { SelectItem,  SortEvent, FilterService } from 'primeng/api';
import {LatLng, rideRequestDTO} from '../../models/rideRequestDTO';
import {rideResponse} from '../../models/rideResponse';
import {CommonModule, isPlatformBrowser} from '@angular/common';      // for built-in pipes: currency, date, number…
import { FormsModule } from '@angular/forms';        // for ngModel
import { ButtonModule } from 'primeng/button';       // for <p-button>
import { InputTextModule } from 'primeng/inputtext'; // for pInputText
import { TagModule } from 'primeng/tag';             // for <p-tag> if used
import { CalendarModule } from 'primeng/calendar';
import {RideRequestService} from '../../services/rideRequest/ride-request.service';
import {Drawer} from 'primeng/drawer';
import type * as Leaflet from 'leaflet';
import {HttpClient} from '@angular/common/http';   // for date filters, if any
import {Rating} from 'primeng/rating';
import { ProfileService } from '../../services/profile/profile.service';
import { RatingModule } from 'primeng/rating';
import {Observable, of, Subscription} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {AuthenticationResponse} from '../../models/authentication-response';
import {GeldKontoService} from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';
import { ToastrService } from 'ngx-toastr';
import {FahrerDTO} from '../../models/fahrerDTO';
import {OffersService} from '../../services/offers-service';
import { RefreshService } from '../../services/refresh-service';
import {ProfileDTO} from '../../models/profileDTO';
import { map, tap, catchError } from 'rxjs/operators';
import { SafeUrl } from '@angular/platform-browser';




export interface Offer{
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  driver: FahrerDTO;
  rideId: number;
  totalRides: number;
  Rating: number;
  distance: number;
  duration: number;
  price: number;
  ridecarClass: 'klein' | 'Medium' | 'Deluxe' ;
  createdAt: Date;
  totalDistance: number;


}



export interface Offerdto{
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  userName?: string;
  FullName?: string;
  email?: string;
  dateOfBirth?: Date;
  carClass?: 'klein'| 'Medium' | 'Deluxe';
  dtype : 'Fahrer';
  rideId: number;
  totalRides: number;
  Rating: number;
  distance: number;
  duration: number;
  price: number;
  ridecarClass: 'klein' | 'Medium' | 'Deluxe' ;
  createdAt: Date;
  photourl?: string;
  totalDistance: number;
}


@Component({
  selector: 'app-driverdashboard',
  standalone: true,
  imports: [
    Button,
    TableModule,
    CommonModule,      // <-- provides currency/number/date pipes
    FormsModule,       // <-- provides ngModel
    TableModule,       // <-- provides p-table, pSortableColumn, etc.
    DropdownModule,    // <-- provides p-dropdown
    ButtonModule,      // <-- provides p-button
    InputTextModule,   // <-- provides pInputText
    TagModule,         // <-- provides p-tag (for status badges)
    CalendarModule,
    Drawer,
    Rating,
    RatingModule,
    GeldKontoComponent,
    HeaderComponent
  ],

  templateUrl: './fahrt-angebote.component.html',
  styleUrl: './fahrt-angebote.component.scss'
})
export class FahrtAngeboteComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt!: Table;




  isdriver : boolean = false;
  myusername = ''

  offers: Array<Offer> = [];
  offersdto: Array<Offerdto> = [];

  private sub!: Subscription;





  selectedCarClass: string | null = null;
  visible: boolean = false;
  routeDistanceKm : number = 0;
  routeDurationMin : number = 0;
  routePriceInEuro: number = 0;





  riderespones : rideResponse[] = [];
  loading: boolean = true;

  first: number = 0;
  rows: number = 12;


  globalFilterFields: string[] = [
    'userName',
    'FullName',
  ];

  carClassOptions: SelectItem[] = [];


  constructor(
    private router: Router,
    private rideRequestService : RideRequestService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private WebSocketService : WebsocketService,
    private toaster: ToastrService,
    private offersService: OffersService,
    private refresh: RefreshService,
    private profileService: ProfileService,
    private sanitizer: DomSanitizer
  ) {}





  otherProfileClicked(userName: string | undefined) {
    localStorage.setItem('otherProfile', userName || '');
    this.router.navigate(['search-profile/others']);

  }



  onCarClassChange(newClass: string) {
    this.selectedCarClass = newClass;
    switch (newClass) {
      case 'klein':
        this.routePriceInEuro = this.routeDistanceKm * 1.0;
        break;
      case 'Medium':
        this.routePriceInEuro = this.routeDistanceKm * 2.0;
        break;
      case 'Deluxe':
        this.routePriceInEuro = this.routeDistanceKm * 10.0;
    }

  }

  loadOffers() {

    this.offersdto= [];

    this.offersService.getAllRideOffersForUser().pipe(
      // 1) show toast on empty and cache raw offers
      tap(result => {
        if (result.length === 0) {
          // this.toaster.info('You dont have any Offers right now.', 'Info!!');
        }
        this.offers = result;
      }),

      // 2) map each Offer → Offerdto with photourl$ observable
      map(result =>
        result.map(offer => {
          const dto: Offerdto & { photourl$: Observable<string|SafeUrl> } = {
            id:            offer.id,
            status:        offer.status,
            rideId:        offer.rideId,
            totalRides:    offer.totalRides,
            totalDistance: offer.totalDistance,
            Rating:        offer.Rating,
            distance:      offer.distance,
            duration:      offer.duration,
            price:         offer.price,
            createdAt:     offer.createdAt,
            ridecarClass:  offer.ridecarClass,



            carClass:      offer.driver.carClass,
            userName:      offer.driver.userName,
            FullName:      offer.driver.firstName + ' ' + offer.driver.lastName,
            email:         offer.driver.email,
            dateOfBirth:   offer.driver.dateOfBirth,

            // required discriminator
            dtype:         'Fahrer',

            // DEFERRED photo load as an Observable
            photourl$: this.profileService
              .getPhotoByUsername(offer.driver.userName)
              .pipe(
                map((blob: Blob) => {
                  if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    return this.sanitizer.bypassSecurityTrustUrl(url);
                  }
                  return '/assets/images/default-profile.jpg';
                }),
                catchError(() => of('/assets/images/default-profile.jpg'))
              )
          };
          return dto;
        })
      )
    ).subscribe({
      next: dtos => {
        this.offersdto = dtos;
      },
      error: err => {
        if (err.error.message.includes('Ride not found')) {
          //this.toaster.info('You dont have any Offers right now.', 'Info!!');
        }else{

        this.toaster.error('Something went wrong', 'Oups!!');
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadOffers();



    this.sub = this.refresh.refreshOffers$.subscribe(() => {
      this.loadOffers();
    });


    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      if (kundeDTO) {
        this.myusername = kundeDTO.userName + '';


      }
      if(kundeDTO?.dtype !== 'Kunde'){
        this.isdriver = true;
      }

    }





    // 1) Initialize filter dropdown options
    this.carClassOptions = [
      { label: 'Klein', value: 'klein' },
      { label: 'Medium', value: 'Medium' },
      { label: 'Deluxe', value: 'Deluxe' }
    ];



    // 2) Simulate data load (replace with real service call)
    setTimeout(() => {
      this.loading = false;
    }, 1000);




  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }









  onDistanceFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `distance`
      this.dt.filter(null, 'distance', 'lte');
    } else {
      // Apply “distance ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'distance', 'lte');
    }
  }

  ontotalDistanceFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `distance`
      this.dt.filter(null, 'totalDistance', 'lte');
    } else {
      // Apply “distance ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'totalDistance', 'lte');
    }
  }

  onpickupDistanceFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `distance`
      this.dt.filter(null, 'pickupdistance', 'lte');
    } else {
      // Apply “distance ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'pickupdistance', 'lte');
    }
  }

  onpriceFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `distance`
      this.dt.filter(null, 'price', 'gte');
    } else {
      // Apply “distance ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'price', 'gte');
    }
  }


  onDurationFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `duration`
      this.dt.filter(null, 'duration', 'lte');
    } else {
      // Apply “duration ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'duration', 'lte');
    }
  }

  onRatingFilter(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (input === null || input.trim() === '') {
      // Clear the filter on `duration`
      this.dt.filter(null, 'Rating', 'gte');
    } else {
      // Apply “duration ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'Rating', 'gte');
    }
  }


  // ---------- PAGINATION CONTROLS ----------
  prev() {
    this.first = this.first - this.rows;
    if (this.first < 0) {
      this.first = 0;
    }
  }

  next() {
    const total = this.offers.length;
    this.first = this.first + this.rows;
    if (this.first >= total) {
      this.first = total - this.rows;
    }
  }

  reset() {
    this.first = 0;
  }

  isFirstPage(): boolean {
    return this.first === 0;
  }

  isLastPage(): boolean {
    return this.first + this.rows >= (this.offers ? this.offers.length : 0);
  }

  pageChange(event: any) {
    this.first = event.first;
  }


  customSort(event: SortEvent) {
    // event.data should now be correctly typed
    const dataToSort: any[] = event.data ?? this.offers;

    dataToSort.sort((a: any, b: any) => {
      const v1 = a[event.field!];
      const v2 = b[event.field!];
      let result = 0;

      if (v1 == null && v2 != null) result = -1;
      else if (v1 != null && v2 == null) result = 1;
      else if (v1 == null && v2 == null) result = 0;
      else if (typeof v1 === 'string' && typeof v2 === 'string')
        result = v1.localeCompare(v2);
      else result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

      return (event.order ?? 1) * result;
    });

    // If event.data was undefined, we sorted this.rides directly:
    if (!event.data) {
      this.offers = [...dataToSort];
    }
  }






  accept(offerdto: Offerdto){
    this.rideRequestService.OfferRespond(offerdto.id,true).subscribe({
      next: response => {
        this.toaster.success(`you Just Accepted ${offerdto.FullName}'s offer! \n ${offerdto.FullName} is on his way to pick you up.  `, 'Offer Accepted!!');
        this.refresh.notifyOffersRefresh();
      },
      error: error => {
        this.toaster.error('Something went wrong!', 'Oops!!');
        this.refresh.notifyOffersRefresh();

      }
    })
    setTimeout(()=>{

    this.refresh.notifyOffersRefresh();
    },1000)


  }

  reject(offerdto: Offerdto){
    this.rideRequestService.OfferRespond(offerdto.id,false).subscribe({
      next: response => {
        this.toaster.warning(`you Just rejected ${offerdto.FullName}'s offer!`, 'Offer Rejected!!');
        this.refresh.notifyOffersRefresh();
      },
      error: error => {
        this.toaster.error('Something went wrong!', 'Oops!!');
        this.refresh.notifyOffersRefresh();

      }
    })
  }



  startseite() {
    this.router.navigate(['/home']);

  }

  profile() {
    this.router.navigate(['/profile']);

  }

  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }
}


