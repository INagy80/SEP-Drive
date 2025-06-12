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
import { DropdownModule } from 'primeng/dropdown';   // for <p-dropdown>
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
import {Subscription} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {NotificationService} from '../../services/notification.service';
import {AuthenticationResponse} from '../../models/authentication-response';
import {GeldKontoService} from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import {WebsocketService} from '../../services/websocket.service';
import { ToastrService } from 'ngx-toastr';
import {RefreshService} from '../../services/refresh-service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SafeUrl } from '@angular/platform-browser';



export interface ride {
  driverUserName: string;
  carClass: 'klein' | 'Medium' | 'Deluxe';
  createdAt: Date;
  updatedAt: Date;
  startAddress: string;
  startLatLong: LatLng;
  destinationAddress: string;
  destinationLatLong: LatLng;
  customerRating: number;
  driverRating: number;
  status: 'Active' | 'Rejected' | 'Completed' | 'Cancelled' | 'Pending' | 'Assigned';
  id: number;
  driverFullName: string;
  customerFullName: string;
  customerUserName: string;
  distance: number;
  pickupdistance: number;
  duration: number;
  price: number;
  zwischenstposlatlong: LatLng[];
  zwischenstposaddress: string[];
  photourl?: string;
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
  templateUrl: './driverdashboard.component.html',
  styleUrl: './driverdashboard.component.scss'
})
export class DriverdashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dt') dt!: Table;


  @ViewChild('simulationMapContainer', { static: false })
  private simulationMapContainer!: ElementRef<HTMLDivElement>;



  myusername = ''

  private L!: typeof Leaflet;
  private map!: Leaflet.Map;



  private currLocationMarker?: any;
  private pickupMarker?: any;
  private pickupCircle?: any;
  private destMarker?: any;
  private destCircle?: any;
  private routeControl?: any;
  private routingControl: any;
  private routeMarkers: Leaflet.Layer[] = [];




  startAddress =  '';
  zielAddress =  '';
  zwischenstoppsText = '';
  zwischenstops : LatLng[] = [];
  zwischenstoppsTextArray : string[] = [];
  selectedCarClass: string | null = null;
  visible: boolean = false;
  private errorMsg: string = '';
  private message: string = '';
  routeDistanceKm : number = 0;
  routeDurationMin : number = 0;
  routePriceInEuro: number = 0;





  rides: ride[] = [];
  riderespones : rideResponse[] = [];
  loading: boolean = true;

  first: number = 0;
  rows: number = 12;


  globalFilterFields: string[] = [
    'customerUserName',
    'customerFullName',
    'startAddress',
    'destinationAddress',
  ];

  carClassOptions: SelectItem[] = [];
  statusOptions: SelectItem[] = [];
  private sub!: Subscription;


  constructor(
    private router: Router,
    private rideRequestService : RideRequestService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private WebSocketService : WebsocketService,
    private toaster: ToastrService,
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

  loadrideRequests() {
    this.riderespones= [];

    this.loading = true;

    // 1) Initialize filter dropdown options
    this.carClassOptions = [
      { label: 'Klein',  value: 'klein'  },
      { label: 'Medium', value: 'Medium' },
      { label: 'Deluxe', value: 'Deluxe' }
    ];

    this.rideRequestService.getAllactiverideRequests().pipe(
      // 2) Filter & toast
      map(data =>
        data.filter(r =>
          r.driverUserName === ' ' &&
          r.customerUserName  !== this.myusername &&
          r.driverUserName    !== this.myusername
        )
      ),
      tap(filtered => {
        this.riderespones = filtered;
        if (filtered.length === 0) {
          this.toaster.info('There is no Active rideRequests now', 'Info');
        }
      }),

      // 3) Map each ride → DTO *with* pickupdistance & photourl$ Observable
      map(filtered =>
        filtered.map(r => {
          const pickupdistance = Math.floor(Math.random() * 40) + 1;

          return {
            ...r,
            pickupdistance,

            // leave this as an Observable and bind with async in the template
            photourl$: this.profileService
              .getPhotoByUsername(r.customerUserName)
              .pipe(
                map((blob: Blob): SafeUrl|string => {
                  if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    return this.sanitizer.bypassSecurityTrustUrl(url);
                  }
                  return '/assets/images/default-profile.jpg';
                }),
                catchError(() => of('/assets/images/default-profile.jpg'))
              )
          };
        })
      )
    ).subscribe({
      next: ridesWithPhotos => {
        this.rides   = ridesWithPhotos;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.toaster.error('Something went wrong', 'Oops!!');
        this.loading = false;
      }
    });
  }



  async ngAfterViewInit(): Promise<void> {


    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      if (kundeDTO) {
      this.myusername = kundeDTO.userName + '';

      }

    }


    if (!isPlatformBrowser(this.platformId)) return;

    // 1) Load Leaflet and LRM
    const leafletModule = await import('leaflet');
    (window as any).L = leafletModule;
    await import('leaflet-routing-machine');
    this.L = leafletModule;

    // 2) Initialize both maps
    this.initMap();

    // 3) Center the main map on the user’s current position
    this.useCurrentPosition();

    this.loadrideRequests();

    this.sub = this.refresh.refreshOffers$.subscribe(() => {
      this.loadrideRequests();
    });


  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.clearRouteMarkers();
  }

  private initMap(): void {
    // 1) build the Leaflet map on the drawer’s container
    this.map = this.L.map(
      this.simulationMapContainer.nativeElement,
      { center: [51.430575, 6.896667], zoom: 13 }
    );

    // 2) add the same tile layer (or any you like)
    this.L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      { subdomains: ['mt0','mt1','mt2','mt3'], attribution: '&copy; Google' }
    ).addTo(this.map);


  }

  onSimulationVisibleChange(opened: boolean) {
    if (opened) {
      // wait until drawer CSS transition is done
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);
    }
  }





  private reverseGeocode(latlng: Leaflet.LatLng): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`;
    return this.http
      .get<{ display_name: string }>(url)
      .toPromise()
      .then(res => res?.display_name || 'unbekannt');
  }





  private calculateRoute(startLatLng: LatLng): Promise<number> {
    return new Promise((resolve, reject) => {
      // 1) Clean up any old control
      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      // 2) Determine “current” position (fallback to fixed coords if needed)
      let curr: Leaflet.LatLng;
      if (!this.currLocationMarker) {
        curr = this.L.latLng(51.430575, 6.896667);
      } else {
        curr = this.currLocationMarker.getLatLng();
      }

      // 3) Create a Routing control—set `show: false` if you don’t want it visible
      const Routing = (this.L as any).Routing;
      this.routeControl = Routing.control({
        waypoints: [curr, this.L.latLng(startLatLng.lat, startLatLng.lng)],
        router: Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        lineOptions: { styles: [{ weight: 0 }] }, // zero-weight = invisible line
        createMarker: () => null,
        fitSelectedRoutes: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        routeWhileDragging: false
      });

      // 4) **Crucial**: add it to the map so LRM actually makes the request
      this.routeControl.addTo(this.map);

      // 5) Listen for the route result
      this.routeControl.on('routesfound', (e: any) => {
        try {
          const route = e.routes[0];
          const distKm = (route.summary.totalDistance || route.summary.distance) / 1000;

          // Remove the hidden control so it doesn’t linger
          this.map.removeControl(this.routeControl!);
          resolve(distKm);
        } catch (ex) {
          this.map.removeControl(this.routeControl!);
          reject(ex);
        }
      });

      this.routeControl.on('routingerror', (err: any) => {
        this.map.removeControl(this.routeControl!);
        reject(err.error?.message || err);
      });
    });
  }






  private clearRouteMarkers(): void {
    this.routeMarkers.forEach(m => this.map.removeLayer(m));
    this.routeMarkers = [];
  }




  private drawRoute(coordinates: Leaflet.LatLng[], labels: string[]) {
    // 1) Remove any existing routing control
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = undefined!;
    }

    // 2) Clear only the *route* markers (your Zwischenstopp pins),
    //    not the pickup/dest markers or circles
    this.clearRouteMarkers();

    // 3) Add custom markers for *only* the Zwischenstopps
    coordinates.forEach((pt, i) => {
      const label = labels[i];
      if (label.startsWith('Zwischenstopp')) {
        const zwischenicon = this.L.icon({
          iconUrl:   'assets/leaflet/marker-icon-green.png',
          iconSize:  [25, 41],
          iconAnchor:[12, 41],
          popupAnchor:[0, -41]
        });

        const m = this.L
          .marker(pt, { icon: zwischenicon, keyboard: false })
          .addTo(this.map)
          .bindPopup(label);

        this.routeMarkers.push(m);
      }
    });

    // 4) Re-draw the route line without adding any extra markers
    const Routing   = (this.L as any).Routing;
    const osrmRouter = Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    });

    this.routingControl = Routing.control({
      waypoints:           coordinates,
      routeWhileDragging:  false,
      addWaypoints:        false,
      draggableWaypoints:  false,
      fitSelectedRoutes:   true,
      show: true,
      showAlternatives: true,
      altLineOptions: {
        styles: [{ color: 'rgba(51,49,49,0.69)', opacity: 0.8, weight: 5 }]
      },
      lineOptions:         { styles: [{ color: 'blue', weight: 5, opacity: 0.7 }] },

      // 🚫 disable all built-in markers:
      createMarker: () => null,

      router: osrmRouter
    })
      .addTo(this.map);

    // const container = this.routingControl.getContainer();
    // if (container && container.parentNode) {
    //   container.parentNode.removeChild(container);
    // }

    this.routingControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      console.log('Route found');
    });



  }






  useCurrentPosition(): void {
    if (!navigator.geolocation) {
      //alert('Geolocation wird von deinem Browser nicht unterstützt.');
      this.toaster.error('Geolocation wird von deinem Browser nicht unterstützt.','Error!!')
      return; }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coord = this.L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setView(coord, 13);
        this.clearRouteMarkers();
        const curr = this.L.circleMarker(coord, { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5 });
        curr.addTo(this.map).bindPopup('Aktuelle Position');
        //this.routeMarkers.push(curr);
        const simIcon = this.L.icon({
          iconUrl:   'assets/leaflet/carmarker.png',
          iconSize:  [25, 41],
          iconAnchor:[12, 41],
          popupAnchor:[0, -41]
        });
        this.currLocationMarker = this.L
          .marker(coord, { icon: simIcon })
          .addTo(this.map);
      },
      err =>{
        //alert('Fehler beim Abrufen der Position: ' + err.message)
        this.toaster.error('Fehler beim Abrufen der Position: ' ,'Oops!!')

      }
    );
  }

  async updateRoute(): Promise<void> {
    // 1) clear any old route lines / circles your clearRouteMarkers may not handle
    this.clearRouteMarkers();

    this.zwischenstops = [];
    this.zwischenstoppsTextArray = [];

    const hasStart = !!this.pickupMarker || !!this.startAddress;
    const hasEnd   = !!this.destMarker   || !!this.zielAddress;
    if (!hasStart || !hasEnd) {
     // alert('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.');
      this.toaster.warning('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.', 'Oops!');
      return;
    }


    // small helper to place a non-draggable marker + circle
    const placeMarker = (
      coord: Leaflet.LatLng,
      iconUrl: string,
      popupText: 'Pickup' | 'Ziel'
    ) => {
      const icon = this.L.icon({
        iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });

      // remove old if exists
      if (popupText === 'Pickup') {
        this.pickupMarker?.remove();
        this.pickupCircle?.remove();
      } else {
        this.destMarker?.remove();
        this.destCircle?.remove();
      }

      // marker
      const m = this.L.marker(coord, {
        icon,
        draggable: false,
        keyboard: false
      })
        .addTo(this.map)
        .bindPopup(popupText)
        .openPopup();

      // circle underneath
      const c = this.L.circleMarker(coord, {
        radius: 15,
        color: popupText === 'Pickup' ? 'blue' : 'red',
        fillColor:  popupText === 'Pickup' ? 'lightblue' : 'lightred',
        fillOpacity: 0.4,
        weight: 2
      }).addTo(this.map);

      // store references
      if (popupText === 'Pickup') {
        this.pickupMarker = m;
        this.pickupCircle = c;
      } else {
        this.destMarker = m;
        this.destCircle = c;
      }
    };

    // 3) SYNC START
    let startCoord: Leaflet.LatLng;
    if (this.pickupMarker && !this.startAddress) {
      // user clicked map but left address blank → reverse-geocode marker
      startCoord = this.pickupMarker.getLatLng();
      try {
        this.startAddress = await this.reverseGeocode(startCoord);
      } catch {
        this.startAddress = 'unbekannt';
      }
    } else {
      // user typed address → geocode & place marker + circle
      startCoord = await this.geocodeAddress(this.startAddress!);
      placeMarker(startCoord, 'assets/leaflet/marker-icon-2x.png', 'Pickup');

      // now reverse-geocode to fill in a full formatted address
      try {
        this.startAddress = await this.reverseGeocode(startCoord);
      } catch {
        this.startAddress = 'unbekannt';
      }
    }

    // 4) SYNC DESTINATION
    let destCoord: Leaflet.LatLng;
    if (this.destMarker && !this.zielAddress) {
      destCoord = this.destMarker.getLatLng();
      try {
        this.zielAddress = await this.reverseGeocode(destCoord);
      } catch {
        this.zielAddress = 'unbekannt';
      }
    } else {
      destCoord = await this.geocodeAddress(this.zielAddress!);
      placeMarker(destCoord, 'assets/leaflet/marker-icon-red.png', 'Ziel');
      try {
        this.zielAddress = await this.reverseGeocode(destCoord);
      } catch {
        this.zielAddress = 'unbekannt';
      }
    }

    // 5) Zwischenstopps
    interface Way { coord: Leaflet.LatLng; label: string; }
    const waypoints: Way[] = [
      { coord: startCoord, label: 'Start' }
    ];



    if (this.zwischenstoppsText) {
      const stops = this.zwischenstoppsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      for (let i = 0; i < stops.length; i++) {
        try {
          const c = await this.geocodeAddress(stops[i]);
          this.zwischenstops.push(c);
          const s = await this.reverseGeocode(c);
          this.zwischenstoppsTextArray.push(s);
          waypoints.push({ coord: c, label: `Zwischenstopp ${i + 1}` });
        } catch (err) {
          console.warn(`Zwischenstopp "${stops[i]}" konnte nicht geokodiert werden`, err);
        }
      }
    }

    waypoints.push({ coord: destCoord, label: 'Ziel' });



    // 6) Draw the route once
    this.drawRoute(
      waypoints.map(w => w.coord),
      waypoints.map(w => w.label)
    );
  }


  private geocodeAddress(address: string): Promise<Leaflet.LatLng> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return this.http.get<any[]>(url).toPromise().then(data => {
      if (!data || data.length === 0) {
        throw new Error('Adresse konnte nicht gefunden werden.');
        window.location.reload();
      }


      return this.L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    });
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
      this.dt.filter(null, 'price', 'lte');
    } else {
      // Apply “distance ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'price', 'lte');
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
      this.dt.filter(null, 'customerRating', 'gte');
    } else {
      // Apply “duration ≤ value”
      const numericValue = Number(input);
      this.dt.filter(numericValue, 'customerRating', 'gte');
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
    const total = this.rides.length;
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
    return this.first + this.rows >= (this.rides ? this.rides.length : 0);
  }

  pageChange(event: any) {
    this.first = event.first;
  }


  customSort(event: SortEvent) {
    // event.data should now be correctly typed
    const dataToSort: any[] = event.data ?? this.rides;

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
      this.rides = [...dataToSort];
    }
  }



  viewRoute(ride: ride) {
    this.map.invalidateSize();
    this.visible = true;
    this.startAddress = `${ride?.startLatLong?.lat ?? ''} , ${ride?.startLatLong?.lng ?? ''}`;
    this.zielAddress = `${ride?.destinationLatLong?.lat ?? ''} , ${ride?.destinationLatLong?.lng ?? ''}`
    this.zwischenstoppsText = '';
    for ( var latlng of ride?.zwischenstposlatlong ?? [] ){
      this.zwischenstoppsText += `${latlng.lat} ${latlng.lng} , `;

    }
    this.routeDurationMin = ride?.duration ?? 0;
    this.routeDistanceKm = ride?.distance ?? 0;
    this.routePriceInEuro = ride?.price ?? 0;

    this.updateRoute();
    this.visible = true;
  }


  makeOffer(ride: rideResponse) {
   this.WebSocketService.makeOffer(ride.id, ride.customerFullName)
  }



  startseite() {
    this.router.navigate(['/home']);

  }

  profile() {
    this.router.navigate(['/profile']);

  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }


  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }
}
