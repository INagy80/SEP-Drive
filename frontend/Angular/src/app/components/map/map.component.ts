import {Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
import {DatePipe, isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import type * as Leaflet from 'leaflet';
import { HttpClient } from '@angular/common/http';
import togpx from 'togpx';
import {LatLng, rideRequestDTO} from '../../models/rideRequestDTO';
import {RideRequestService} from '../../services/rideRequest/ride-request.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {rideResponse} from '../../models/rideResponse';
import {Button} from 'primeng/button';
import {Router} from "@angular/router";
import {Drawer} from 'primeng/drawer';
import {MatDivider} from '@angular/material/divider';
import {Rating} from 'primeng/rating';
import {AuthenticationResponse} from '../../models/authentication-response';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {Subscription, switchMap, tap} from 'rxjs';
import { GeldKontoService } from '../../services/geld-konto.service';
import {GeldKontoComponent} from '../geld-konto/geld-konto.component';
import {HeaderComponent} from '../header/header.component';
import { ToastrService } from 'ngx-toastr';
import {WebsocketService} from '../../services/websocket.service';
import {RefreshService} from '../../services/refresh-service';
import { SimulationUpdate } from '../../models/simulation-state.model';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FormsModule, MatSidenavModule, ScrollPanelModule, Drawer, MatDivider, Rating, BadgeModule, CommonModule, ButtonModule, HeaderComponent, ChatComponent],
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @ViewChild('simulationMapContainer', { static: false })
  private simulationMapContainer!: ElementRef<HTMLDivElement>;

  // Chat properties
  showChat: boolean = false;
  chatOtherUser: string = '';
  currentUser: string = '';

  private L!: typeof Leaflet;
  private map!: Leaflet.Map;

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
  selectedCarClass = '';
  visible: boolean = false;
  private errorMsg: string = '';
  private message: string = '';
  gpxfile: File | null = null;
  routeDistanceKm : number = 0;
  routeDurationMin : number = 0;
  routePriceInEuro: number = 0;

  isdriver : boolean = false;
  myBalance = 0.0;

  rideRequests: Array<rideRequestDTO> = [];
  rideResponses : Array<rideResponse> = [];

  ohnesortierungarray: Array<rideResponse> = [];
  ascendingitem: String = '';
  descendingitem: String = '';
  search: String = '';

  private simpickupMarker?: any;
  private simpickupCircle?: any;
  private simdestMarker?: any;
  private simdestCircle?: any;
  private simroutingControl: any;
  private simrouteMarkers: Leaflet.Layer[] = [];

  private simulationmap!: Leaflet.Map;

  private simulationMarker?: Leaflet.Marker;

  private animationFrameId: number | null = null;

  private simLayer!: L.LayerGroup;

  private sub!: Subscription;

  simstartAddress =  '';
  simzielAddress =  '';
  simzwischenstoppsText = '';
  simzwischenstops : LatLng[] = [];
  simzwischenstoppsTextArray : string[] = [];
  simrouteDistanceKm : number = 0;
  simrouteDurationMin : number = 0;
  simroutePriceInEuro: number = 0;
  simulationstatus: boolean = false;

  private simulationData?: {
    path:         Leaflet.LatLng[];
    segLengths:   number[];
    totalLength:  number;
    realDuration: number;     // seconds, as returned by OSRM
    travelFrac:   number;     // from 0→1
    lastTimeMs:   number; // timestamp of the last frame
    stops: Leaflet.LatLng[];
    paused: boolean;
    simulationSpeedFactor: number
  };

  simulationSpeedFactor: number = 1;

  simulationSpeedUI: number = this.simulationSpeedFactor;
  autoZoomEnabled = true;

  ignoreNextZoom = false;

  simulationZoom = 16;

  simulationPaused = false;
  simulationvisible: boolean = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private rideRequestService : RideRequestService,
    private router: Router,
    private geldkontoService: GeldKontoService,
    private toastr: ToastrService,
    private WebSocketService : WebsocketService,
    private refresh: RefreshService,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.WebSocketService.connect();

   this.sub = this.refresh.simulationUpdatePayload$.subscribe((update: SimulationUpdate) => {
      this.applyRemoteSimulationUpdate(update);
    });

   this.refresh.refreshStartSimulationEnds$.subscribe(() =>{
     this.startSimulationAfterAccepted(this.activeRequest)
     });

    this.refresh.refreshAfterSimulationEnds$.subscribe((rideId : number) =>{
     this.resetSimulationAfterEnd();
     this.searchforAssignedstatus();

    });

    this.refresh.simulationrefresh$.subscribe(() =>{
      if(this.simulationPaused){
        this.pauseSimulation()
      }else{
      this.resumeSimulation()
      }
    })

    this.loadMyBalance();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      const kundeDTO = authResponse.kundeDTO;
      this.isdriver = kundeDTO?.dtype !== 'Kunde';
    }

    this.searchforAssignedstatus();
    this.sub = this.refresh.refreshOffers$.subscribe(() => {
      this.searchforAssignedstatus();
    });

    if (!isPlatformBrowser(this.platformId)) return;

    const leafletModule = await import('leaflet');
    (window as any).L = leafletModule;
    await import('leaflet-routing-machine');
    this.L = leafletModule;

    this.initMap();
    this.initSimulationMap();
    this.useCurrentPosition();

    const frac = parseFloat(localStorage.getItem('simTravelFrac') || '0');
    const path = JSON.parse(localStorage.getItem('simPath') || 'null');
    const stops = JSON.parse(localStorage.getItem('simStops') || 'null');
    const dur = parseFloat(localStorage.getItem('simRealDuration') || '0');
    const paused = localStorage.getItem('isPaused') === 'true';
    this.simulationSpeedFactor = parseFloat(localStorage.getItem('simulationSpeedFactor') || '1');

    if (Array.isArray(path) && dur > 0) {
      const segLengths: number[] = [];
      let total = 0;
      for (let i = 1; i < path.length; i++) {
        const d = this.simulationmap.distance(path[i - 1], path[i]);
        segLengths.push(d);
        total += d;
      }

      this.simulationData = {
        path,
        segLengths,
        totalLength: total,
        realDuration: dur,
        travelFrac: frac,
        lastTimeMs: performance.now(),
        stops,
        paused,
        simulationSpeedFactor: this.simulationSpeedFactor,
      };

      this.simulationPaused = paused;

      this.L.polyline(path, {
        color: 'blue',
        weight: 5,
        opacity: 0.7
      }).addTo(this.simulationmap);

      const greenIcon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });
      for (const stopLL of stops) {
        this.L.marker(stopLL, { icon: greenIcon, keyboard: false }).addTo(this.simulationmap);
      }

      const distAlong = total * frac;
      const current = this.interpolatePosition(path, segLengths, distAlong);
      const simIcon = this.L.icon({
        iconUrl: 'assets/leaflet/carmarker.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });
      this.simulationMarker = this.L.marker(current, { icon: simIcon }).addTo(this.simulationmap);

      if (!paused) {
        requestAnimationFrame(this.stepSimulation.bind(this));
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.clearRouteMarkers();
  }

  private initMap(): void {
    const { map, tileLayer } = this.L;
    this.map = map('map', { center: [51.430575,  6.896667], zoom: 13 });

    tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google'
    }).addTo(this.map);

    this.map.on('click', (e: Leaflet.LeafletMouseEvent) => this.onMapClick(e));

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

  async loadMyBalance() : Promise<void> {
    this.geldkontoService.getMyBalance().subscribe({
      next: balance => {
        this.myBalance = balance;
      }, error: error => {
        console.log(error);
      }
    });

  }

  isvisible(){
    this.visible = true;
  }

  updateRating(user:String , rideRequestId:number, rating:number) {
    this.rideRequestService.updateRating(user, rideRequestId, rating).subscribe({
        next: ()  => {
          console.log('rating updated to '+ rating);
          console.log(rideRequestId);
          console.log(user);
          this.findAllrideRequests();
        },
        error: (err) => {
          this.toastr.error('something went wrong', 'Error!!');
        }

      }
    );

  }

  searchforAssignedstatus() {
    this.rideRequestService.getAll().subscribe({
      next: (data) => {
        this.rideResponses = data;
        this.ohnesortierungarray = [...data];
        console.log(data);

        const response = data.find(r => r.status === 'Assigned');
        if (response) {
          console.log(response);

          this.simstartAddress = `${response?.startLatLong?.lat ?? ''} , ${response?.startLatLong?.lng ?? ''}`;
          this.simzielAddress = `${response?.destinationLatLong?.lat ?? ''} , ${response?.destinationLatLong?.lng ?? ''}`;
          this.simzwischenstoppsText = '';
          for (const latlng of response?.zwischenstposlatlong ?? []) {
            this.simzwischenstoppsText += `${latlng.lat} ${latlng.lng} , `;
          }

          this.simrouteDurationMin = response?.duration ?? 0;
          this.simrouteDistanceKm = response?.distance ?? 0;
          this.simroutePriceInEuro = response?.price ?? 0;

          if (response?.status === 'Assigned') {
            this.simulationstatus = true;
            this.updateRouteforsimulation(true);
          }
        }
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('something went wrong', 'Error!!');
      }
    });
  }

  private onMapClick(e: Leaflet.LeafletMouseEvent): void {
    if (!this.pickupMarker) {
      const pickupicon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });

      this.pickupMarker = this.L.marker(e.latlng, {
        draggable: false,
        icon: pickupicon,
      })
        .addTo(this.map)
        .bindPopup('Pickup')
        .openPopup();

      this.pickupCircle= this.L.circleMarker(e.latlng, {
        radius: 15,
        color: 'blue',
        fillColor: 'lightblue',
        fillOpacity: 0.4,
        weight: 2
      }).addTo(this.map);


    } else {
      if (this.destMarker) {
        return;
      }

       const zielicon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });

      this.destMarker = this.L.marker(e.latlng, {
        icon: zielicon,
        draggable: false,
      })
        .addTo(this.map)
        .bindPopup('Ziel')
        .openPopup();

      this.destCircle = this.L.circleMarker(e.latlng, { radius: 15, color: 'red', fillColor: 'lightred', fillOpacity: 0.4, weight: 2 })
        .addTo(this.map)


    }
    this.calculateRoute();
  }

  private calculateRoute(): void {
    if (!this.pickupMarker || !this.destMarker) return;
    if (this.routeControl) this.map.removeControl(this.routeControl);

    const Routing = (this.L as any).Routing;
    this.routeControl = Routing.control({
      waypoints: [this.pickupMarker.getLatLng(), this.destMarker.getLatLng()],
      router: Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      lineOptions: { styles: [{ weight: 4 }] },
      show: true,
      addWaypoints: true,
      showAlternatives: true,
      createMarker: () => null,
      altLineOptions: {
        styles: [{ color: 'lightblue', opacity: 0.5, weight: 4 }]
      },

    }).addTo(this.map);

    this.routeControl.on('routesfound', (e: any) => {
      const route = e.routes[0];

      const distanceInKm = (route.summary.totalDistance || route.summary.distance) / 1000;
      const durationInMin = (route.summary.totalTime || route.summary.duration) / 60;

      console.log(`Route distance: ${distanceInKm.toFixed(2)} km`);
      console.log(`Estimated duration: ${durationInMin.toFixed(2)} minutes`);

      this.routeDistanceKm = distanceInKm;
      this.routeDurationMin = durationInMin;
      switch (this.selectedCarClass) {
        case 'klein':
          this.routePriceInEuro = this.routeDistanceKm * 1.0;
          break;
        case 'Medium':
          this.routePriceInEuro = this.routeDistanceKm * 2.0;
          break;
        case 'Deluxe':
          this.routePriceInEuro = this.routeDistanceKm * 10.0;
      }


      const coords = route.coordinates.map((c: any) => [c.lng, c.lat]);
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords
        },
        properties: { name: 'Car route' }
      };

      const gpx = togpx(geojson);
      const blob = new Blob([gpx], { type: 'application/gpx+xml' });
      const gpxFile = new File([blob], 'route.gpx', { type: 'application/gpx+xml' });
      this.gpxfile = gpxFile;
    });
  }

   async createRideRequest(): Promise<void> {
     console.log('createRideRequest called!'); // Debug-Log
     
     // Temporär GeldKonto-Check deaktiviert wegen 500-Fehler
     /*
     this.geldkontoService.getMyBalance().subscribe({
       next: balance => {
         this.myBalance = balance;
         // ... existing code ...
       }, error: error => {
         console.log(error);
       }
     });
     */
     
     // Direkt mit der Fahrtanfrage fortfahren
     if (this.routeDurationMin === 0 || this.routeDistanceKm === 0) {
       this.toastr.warning('please click on (Route anzeigen) button first to calculate the route', 'Oups!!');
       return;
     }

     if (this.routePriceInEuro === 0) {
       this.toastr.warning('Bitte wählen Sie eine Auto Klasse aus.', 'Oups!!');
       return;
     }

     // Temporär GeldKonto-Check übersprungen
     /*
     if (this.routePriceInEuro > this.myBalance) {
       this.toastr.warning('Sie haben nicht genug Geld. Bitte laden Sie Ihr Konto auf!', 'Oups!!');
       return;
     }
     */

     this.updateRoute().then(() => {

       const startLatLng: LatLng = {
         lat: this.pickupMarker.getLatLng().lat,
         lng: this.pickupMarker.getLatLng().lng
       };
       const destLatLng: LatLng = {
         lat: this.destMarker.getLatLng().lat,
         lng: this.destMarker.getLatLng().lng
       };

       const requestDto: rideRequestDTO = {
         distance: parseFloat(this.routeDistanceKm.toFixed(2)),
         duration: parseFloat(this.routeDurationMin.toFixed(2)),
         price: parseFloat(this.routePriceInEuro.toFixed(2)),
         start: startLatLng,
         startaddress: this.startAddress,
         zwischenstops: this.zwischenstops,
         zwischenstopssaddress: this.zwischenstoppsTextArray,
         destination: destLatLng,
         destinationaddress: this.zielAddress,
         carClass: this.selectedCarClass as "Medium" | "Deluxe" | "klein"
       };


       if (this.selectedCarClass === '') {
         this.errorMsg = 'Bitte wählen Sie eine Auto Klasse aus.';
         //alert(this.errorMsg);
         this.toastr.warning('Bitte wählen Sie eine Auto Klasse aus.', 'Oups!!');

         return;

       }

       this.rideRequestService.create(requestDto)
         .subscribe({
           next: (res) => {
            // alert('Fahrt angefordert');
             this.toastr.success('Fahrt angefordert', 'Done!!');


           },
           error: (err) => {
             console.log(err)
             if (err.message.includes('Http failure during parsing')) {
               this.errorMsg = 'your ride request is succesfully created';
               //alert(this.errorMsg);
               this.toastr.success('your ride request is succesfully created', 'Done!!');

             }
             if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
               if (err.error.message.includes('You already have an active request')) {
                 this.errorMsg = 'you already have an active ride request';
                 //alert(this.errorMsg);
                 this.toastr.info('you already have an active ride request', 'info!!');

               } else {
                 this.errorMsg = 'something went wrong';
                 //alert(this.errorMsg);
                 window.location.reload();
                 this.toastr.error('something went wrong', 'Oups!!');



               }
             }
           }
         });

     }).catch(err => {
       console.error('Failed to update route:', err);
       //alert('Fehler beim Aktualisieren der Route. Bitte erst auf "Route anzeigen" klicken und dann erneut versuchen.');
       this.toastr.error('Fehler beim Aktualisieren der Route. Bitte erst auf "Route anzeigen" klicken und dann erneut versuchen.', 'Oups!!');

     })
   }



  private clearRouteMarkers(): void {
    this.routeMarkers.forEach(m => this.map.removeLayer(m));
    this.routeMarkers = [];
  }



  private clearsimRouteMarkers(): void {
    this.simrouteMarkers.forEach(m => this.simulationmap.removeLayer(m));
    this.simrouteMarkers = [];

  }



  async updateRoute(): Promise<void> {
    // 1) clear any old route lines / circles your clearRouteMarkers may not handle
    this.clearRouteMarkers();

    this.zwischenstops = [];
    this.zwischenstoppsTextArray = [];

    // 2) validation: need at least one of (pickupMarker ↔ startAddress)
    //    and one of (destMarker ↔ zielAddress)
    const hasStart = !!this.pickupMarker || !!this.startAddress;
    const hasEnd   = !!this.destMarker   || !!this.zielAddress;
    if (!hasStart || !hasEnd) {
      //alert('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.');
      this.toastr.warning('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.', 'Oops!!');

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



  private drawRoute(coordinates: Leaflet.LatLng[], labels: string[]) {
    console.log('drawRoute called with coordinates:', coordinates.length); // Debug-Log
    
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


    this.routingControl.on('routesfound', (e: any) => {
      console.log('Route found successfully!'); // Debug-Log
      const route = e.routes[0];

      const distanceInKm = (route.summary.totalDistance || route.summary.distance) / 1000; // meters → km
      const durationInMin = (route.summary.totalTime || route.summary.duration) / 60; // seconds → minutes

      console.log(`Route distance: ${distanceInKm.toFixed(2)} km`);
      console.log(`Estimated duration: ${durationInMin.toFixed(2)} minutes`);

      this.routeDistanceKm = distanceInKm;
      this.routeDurationMin = durationInMin;
      switch (this.selectedCarClass) {
        case 'klein':
          this.routePriceInEuro = this.routeDistanceKm * 1.0;
          break;
        case 'Medium':
          this.routePriceInEuro = this.routeDistanceKm * 2.0;
          break;
        case 'Deluxe':
          this.routePriceInEuro = this.routeDistanceKm * 10.0;
      }

    });

    // Add error handling for routing failures
    this.routingControl.on('routingerror', (e: any) => {
      console.error('Routing error:', e);
      this.toastr.error('Fehler bei der Routenberechnung. Bitte versuchen Sie es erneut.', 'Routing-Fehler');
    });

    // Add timeout handling
    setTimeout(() => {
      if (!this.routeDistanceKm && !this.routeDurationMin) {
        console.warn('Route calculation timeout');
        this.toastr.warning('Routenberechnung dauert länger als erwartet. Bitte versuchen Sie es erneut.', 'Timeout');
      }
    }, 10000); // 10 seconds timeout
  }



  useCurrentPosition(): void {
    if (!navigator.geolocation) { //alert('Geolocation wird von deinem Browser nicht unterstützt.');
      this.toastr.error('Geolocation wird von deinem Browser nicht unterstützt.', 'Oups!!');

      return; }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coord = this.L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setView(coord, 13);
        this.clearRouteMarkers();
        const curr = this.L.circleMarker(coord, { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5 });
        curr.addTo(this.map).bindPopup('Aktuelle Position');
        //this.routeMarkers.push(curr);
      },
      err =>{
      // alert('Fehler beim Abrufen der Position: ' + err.message)
        this.toastr.error('Fehler beim Abrufen der Position: ' + err.message, 'Oups!!');

      }
    );
  }



  setCurrentlocation(): void{
    if (!navigator.geolocation) {
      //alert('Geolocation wird von deinem Browser nicht unterstützt.');
      this.toastr.error('Geolocation wird von deinem Browser nicht unterstützt.', 'Oups!!');

      return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coord = this.L.latLng(pos.coords.latitude, pos.coords.longitude);
        this.map.setView(coord, 13);
        this.clearRouteMarkers();
        const curr = this.L.circleMarker(coord, { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5 });
        curr.addTo(this.map).bindPopup('Aktuelle Position');
        const pickupicon = this.L.icon({
          iconUrl: 'assets/leaflet/marker-icon-2x.png',  // Use your own path here
          iconSize: [25, 41],                      // Default Leaflet size
          iconAnchor: [12, 41],                    // Point of the icon which will correspond to marker's location
          popupAnchor: [0, -41]                    // Point from which the popup should open
        });

        this.pickupMarker = this.L.marker(coord, {
          draggable: false,
          icon: pickupicon,
        })
          .addTo(this.map)
          .bindPopup('Pickup')
          .openPopup();

        this.pickupCircle= this.L.circleMarker(coord, {
          radius: 15,
          color: 'blue',
          fillColor: 'lightblue',
          fillOpacity: 0.4,
          weight: 2
        }).addTo(this.map);
        this.reverseGeocode(coord).then(address => {
          this.startAddress = address;
        }).catch(err => console.error('Reverse geocode failed', err));
        //this.routeMarkers.push(curr);
      },
      err => {
       // alert('Fehler beim Abrufen der Position: ' + err.message)
        window.location.reload();
        this.toastr.error('Fehler beim Abrufen der Position: ' + err.message, 'Oups!!');

      }
    );

  }




  //<-----------road transformation--------------->//
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



  private reverseGeocode(latlng: Leaflet.LatLng): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`;
    return this.http
      .get<{ display_name: string }>(url)
      .toPromise()
      .then(res => res?.display_name || 'unbekannt');
  }



  onAddresChange(adress: string) {
    this.routeDurationMin = 0;
    this.routeDistanceKm = 0;
    this.routePriceInEuro = 0;

  }








  // <----------------------Rawan Code:--------------------->//


  findAllrideResponse(){
    this.isvisible()
    this.rideRequestService.getAll()
      .subscribe({
        next: (data) => {
          this.rideResponses = data;
          this.ohnesortierungarray = [...data]
          console.log(data);


        },
        error: (err) => {
          console.log(err);
          // alert('something went wrong');
          this.toastr.error('something went wrong', 'Error!!');

        }
      })
  }


  findAllrideRequests() {
    this.isvisible()
    this.rideRequestService.findAll()
      .subscribe({
        next: (data) => {
          this.rideRequests = data;
          console.log(data);

        }
      })

  }


  otherProfileClicked(userName: string | undefined) {
    if(userName !== null && userName !== undefined && userName !== ' ' ) {
      localStorage.setItem('otherProfile', userName || '');
      this.router.navigate(['search-profile/others']);
    }

  }


  get activeRequest(): rideResponse | undefined {
    return this.rideResponses.find(r => r.status === 'Active' || r.status === 'Assigned');
  }


  get historyRequests(): rideResponse[] {
    return this.rideResponses.filter(
      r => r.status !== 'Active' && r.status !== 'Assigned'
    );
  }


  onAscendingitemChange(ascendingitem: String) {
    this.ascendingitem = ascendingitem;

    switch (this.ascendingitem) {
      case 'no':
        this.rideResponses = this.ohnesortierungarray;
        break;
      case 'CFN':
        this.rideResponses = this.rideResponses.sort((a, b) => a.customerFullName.localeCompare(b.customerFullName) );
        break;
      case 'CUN':
        this.rideResponses = this.rideResponses.sort((a, b) => a.customerUserName.localeCompare(b.customerUserName) );
        break;
      case 'Id':
        this.rideResponses = this.rideResponses.sort((a, b) => a.id - b.id);
        break;
      case 'status':
        this.rideResponses = this.rideResponses.sort((a, b) => a.status.localeCompare(b.status) );
        break;
      case 'DFN':
        this.rideResponses = this.rideResponses.sort((a, b) => a.driverFullName.localeCompare(b.driverFullName) );
        break;
      case 'DUN':
        this.rideResponses = this.rideResponses.sort((a, b) => a.driverUserName.localeCompare(b.driverUserName) );
        break;
      case 'CC':
        this.rideResponses = this.rideResponses.sort((a, b) => a.carClass.localeCompare(b.carClass) );
        break;
      case 'SA':
        this.rideResponses = this.rideResponses.sort((a, b) => a.startAddress.localeCompare(b.startAddress) );
        break;
      case 'DA':
        this.rideResponses = this.rideResponses.sort((a, b) => a.destinationAddress.localeCompare(b.destinationAddress) );
        break;
      case 'CD':
        this.rideResponses = this.rideResponses.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'UD':
        this.rideResponses = this.rideResponses.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        break;
      case 'km':
        this.rideResponses = this.rideResponses.sort((a, b) => a.distance - b.distance);
        break;
      case 'min':
        this.rideResponses = this.rideResponses.sort((a, b) => a.duration - b.duration);
        break;
      case '€':
        this.rideResponses = this.rideResponses.sort((a, b) => a.price - b.price);
        break;
      case 'DR':
        this.rideResponses = this.rideResponses.sort((a, b) => a.driverRating - b.driverRating);
        break;
      case 'CR':
        this.rideResponses = this.rideResponses.sort((a, b) => a.customerRating - b.customerRating);
        break;
    }


  }



  ondescendingitemChange(descendingitem: String) {
    this.descendingitem = descendingitem;


    switch (this.descendingitem) {
      case 'no':
        this.rideResponses = this.ohnesortierungarray;
        break;
      case 'CFN':
        this.rideResponses = this.rideResponses.sort((a, b) => b.customerFullName.localeCompare(a.customerFullName) );
        break;
      case 'CUN':
        this.rideResponses = this.rideResponses.sort((a, b) => b.customerUserName.localeCompare(a.customerUserName) );
        break;
      case 'Id':
        this.rideResponses = this.rideResponses.sort((a, b) => b.id - a.id);
        break;
      case 'status':
        this.rideResponses = this.rideResponses.sort((a, b) => b.status.localeCompare(a.status) );
        break;
      case 'DFN':
        this.rideResponses = this.rideResponses.sort((a, b) => b.driverFullName.localeCompare(a.driverFullName) );
        break;
      case 'DUN':
        this.rideResponses = this.rideResponses.sort((a, b) => b.driverUserName.localeCompare(a.driverUserName) );
        break;
      case 'CC':
        this.rideResponses = this.rideResponses.sort((a, b) => b.carClass.localeCompare(a.carClass) );
        break;
      case 'SA':
        this.rideResponses = this.rideResponses.sort((a, b) => b.startAddress.localeCompare(a.startAddress) );
        break;
      case 'DA':
        this.rideResponses = this.rideResponses.sort((a, b) => b.destinationAddress.localeCompare(a.destinationAddress) );
        break;
      case 'CD':
        this.rideResponses = this.rideResponses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'UD':
        this.rideResponses = this.rideResponses.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'km':
        this.rideResponses = this.rideResponses.sort((a, b) => b.distance - a.distance);
        break;
      case 'min':
        this.rideResponses = this.rideResponses.sort((a, b) => b.duration - a.duration);
        break;
      case '€':
        this.rideResponses = this.rideResponses.sort((a, b) => b.price - a.price);
        break;
      case 'DR':
        this.rideResponses = this.rideResponses.sort((a, b) => b.driverRating - a.driverRating);
        break;
      case 'CR':
        this.rideResponses = this.rideResponses.sort((a, b) => b.customerRating - a.customerRating);
        break;
    }

  }



  onSearchChange(search: string) {
    this.search = search;
    if (this.search !== '') {
      this.rideResponses = this.rideResponses.filter(a => a.status==='Active' || a.driverFullName.toLowerCase().includes(this.search.toLowerCase()) || a.driverUserName.toLowerCase().includes(this.search.toLowerCase()));
    }
    else {
      this.rideResponses = this.ohnesortierungarray;
    }
  }





  statusdelete(ride:rideResponse) {


    if(ride.status === 'Assigned'){
      this.toastr.warning('you Can not delete this ride request because you are already Assigned with a driver', 'Oops!!');

      return;
    }

    this.rideRequestService.deletestatus().pipe(
      // 1) show delete toast as soon as deletion succeeds
      tap(() => {
        this.toastr.success('Ride request deleted successfully.', 'Deleted!!');
      }),
      // 2) once deleted, switch to the "get all" Observable
      switchMap(() => this.rideRequestService.getAll() ),
      // 3) now we have the fresh array—assign it and calc stats
      tap(requests => {
        this.rideResponses = requests;
        this.ohnesortierungarray = [...requests]
        this.refresh.notifyOffersRefresh();


      })
    ).subscribe({
      error: err => {
        if (err.error.message.includes('you Can not delete this ride request because you are already in a ride')){
          this.toastr.warning('you Can not delete this ride request because you are already in a ride', 'Oops!!');
        }else{
          this.toastr.error('Something went wrong', 'Oops!!');

        }
        console.error(err);
      }
    });
    this.simulationmap.removeLayer(this.simroutingControl)
    this.clearsimRouteMarkers()
    this.simulationmap.removeControl(this.simroutingControl);
    this.simroutingControl = undefined!;

    this.simzwischenstops = [];
    this.simzwischenstoppsTextArray = [];

    localStorage.removeItem('simPath');
    localStorage.removeItem('simRealDuration');
    localStorage.removeItem('simStops');
    localStorage.removeItem('simTravelFrac');

  }





//<-----------------Navigation------------------->//

  startseite() {
    this.router.navigate(['/home']);

  }

  driverdashboard(){
    this.router.navigate(['/driverdashboard']);
  }

  fahrtangebote(){
    this.router.navigate(['/fahrtangebote']);
  }


  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();

  }



  //<--------------------Simulation-------------------->//




  //<---simulation view----->

  private initSimulationMap(): void {
    // 1) build the Leaflet map on the drawer's container
    this.simulationmap = this.L.map(
      this.simulationMapContainer.nativeElement,
      { center: [51.430575, 6.896667], zoom: 13 }
    );

    // 2) add the same tile layer (or any you like)
    this.L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      { subdomains: ['mt0','mt1','mt2','mt3'], attribution: '&copy; Google' }
    ).addTo(this.simulationmap);

    this.simLayer = this.L.layerGroup().addTo(this.simulationmap);

    // 3) wire up zoom/drag listeners *on simulationmap*
    this.simulationmap.on('zoom', () => {
      if (this.ignoreNextZoom) {
        this.ignoreNextZoom = false;
      }
    });
    this.simulationmap.on('dragstart', () => {
      this.autoZoomEnabled = false;
    });
    this.simulationmap.on('zoom', (e: any) => {
      const z = this.simulationmap.getZoom();
      if (z < this.simulationZoom) {
        this.autoZoomEnabled = false;
      }
    });

  }


  onSimulationVisibleChange(opened: boolean) {
    if (opened) {
      // wait until drawer CSS transition is done
      setTimeout(() => {
        this.simulationmap.invalidateSize();
      }, 300);
    }
  }

  ViewRoadForUnassignedRides(response: rideResponse | undefined) {
    if (!response) return;

    this.simulationvisible = true;

    this.simstartAddress = `${response?.startLatLong?.lat ?? ''} , ${response?.startLatLong?.lng ?? ''}`;
    this.simzielAddress = `${response?.destinationLatLong?.lat ?? ''} , ${response?.destinationLatLong?.lng ?? ''}`;

    // Zwischenstopps
    this.simzwischenstoppsText = '';
    for (const latlng of response?.zwischenstposlatlong ?? []) {
      this.simzwischenstoppsText += `${latlng.lat} ${latlng.lng}, `;
    }

    // These must be OUTSIDE the loop
    this.simrouteDurationMin = response?.duration ?? 0;
    this.simrouteDistanceKm = response?.distance ?? 0;
    this.simroutePriceInEuro = response?.price ?? 0;

    // Decide whether to simulate or just draw
    if (response?.status === 'Assigned') {
      //this.simulationstatus = true;
      //this.updateRouteforsimulation(true);
    } else {
      this.simulationstatus = false;
      this.updateRouteforsimulation(false);
    }

    // Fix Leaflet map rendering
    setTimeout(() => this.simulationmap.invalidateSize(), 300);
  }


  ViewSimulationmap(response: rideResponse | undefined){
    this.simulationvisible = true;
    if(response){
      this.rideRequestService.refreshsumilation(response?.id).subscribe();
    }
    setTimeout(() => this.simulationmap.invalidateSize(), 300);
  }



  //<-----route - simulation---->
  async updateRouteforsimulation(isaktive : boolean): Promise<void> {
    // 1) clear any old route lines / circles your clearRouteMarkers may not handle
    this.clearsimRouteMarkers();
    this.simzwischenstops = [];
    this.simzwischenstoppsTextArray = [];

    // 2) validation: need at least one of (pickupMarker ↔ startAddress)
    //    and one of (destMarker ↔ zielAddress)
    const hasStart = !!this.simpickupMarker || !!this.simstartAddress;
    const hasEnd   = !!this.simdestMarker   || !!this.simzielAddress;
    if (!hasStart || !hasEnd) {
      // alert('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.');
      this.toastr.warning('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.', 'Oops!!');

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
        this.simpickupMarker?.remove();
        this.simpickupCircle?.remove();
      } else {
        this.simdestMarker?.remove();
        this.simdestCircle?.remove();
      }

      // marker
      const m = this.L.marker(coord, {
        icon,
        draggable: false,
        keyboard: false
      })
        .addTo(this.simulationmap)
        .bindPopup(popupText)
        .openPopup();

      // circle underneath
      const c = this.L.circleMarker(coord, {
        radius: 15,
        color: popupText === 'Pickup' ? 'blue' : 'red',
        fillColor:  popupText === 'Pickup' ? 'lightblue' : 'lightred',
        fillOpacity: 0.4,
        weight: 2
      }).addTo(this.simulationmap);

      // store references
      if (popupText === 'Pickup') {
        this.simpickupMarker = m;
        this.simpickupCircle = c;
      } else {
        this.simdestMarker = m;
        this.simdestCircle = c;
      }
    };

    // 3) SYNC START
    let startCoord: Leaflet.LatLng;
    if (this.simpickupMarker && !this.simstartAddress) {
      // user clicked map but left address blank → reverse-geocode marker
      startCoord = this.simpickupMarker.getLatLng();
      try {
        this.simstartAddress = await this.reverseGeocode(startCoord);
      } catch {
        this.simstartAddress = 'unbekannt';
      }
    } else {
      // user typed address → geocode & place marker + circle
      startCoord = await this.geocodeAddress(this.simstartAddress!);
      placeMarker(startCoord, 'assets/leaflet/marker-icon-2x.png', 'Pickup');

      // now reverse-geocode to fill in a full formatted address
      try {
        this.simstartAddress = await this.reverseGeocode(startCoord);
      } catch {
        this.simstartAddress = 'unbekannt';
      }
    }

    // 4) SYNC DESTINATION
    let destCoord: Leaflet.LatLng;
    if (this.simdestMarker && !this.simzielAddress) {
      destCoord = this.simdestMarker.getLatLng();
      try {
        this.simzielAddress = await this.reverseGeocode(destCoord);
      } catch {
        this.simzielAddress = 'unbekannt';
      }
    } else {
      destCoord = await this.geocodeAddress(this.simzielAddress!);
      placeMarker(destCoord, 'assets/leaflet/marker-icon-red.png', 'Ziel');
      try {
        this.simzielAddress = await this.reverseGeocode(destCoord);
      } catch {
        this.simzielAddress = 'unbekannt';
      }
    }

    // 5) Zwischenstopps
    interface Way { coord: Leaflet.LatLng; label: string; }
    const waypoints: Way[] = [
      { coord: startCoord, label: 'Start' }
    ];

    if (this.simzwischenstoppsText) {
      const stops = this.simzwischenstoppsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      for (let i = 0; i < stops.length; i++) {
        try {
          const c = await this.geocodeAddress(stops[i]);
          waypoints.push({ coord: c, label: `Zwischenstopp ${i + 1}` });
        } catch (err) {
          console.warn(`Zwischenstopp "${stops[i]}" konnte nicht geokodiert werden`, err);
        }
      }
    }

    waypoints.push({ coord: destCoord, label: 'Ziel' });



    // 6) Draw the route once
    this.drawRouteforsimulation(
      waypoints.map(w => w.coord),
      waypoints.map(w => w.label),
      isaktive
    );
  }



  private drawRouteforsimulation(coordinates: Leaflet.LatLng[], labels: string[], isaktive : boolean): void {

    console.log('simu');

    //this.simulationSpeedSecPerMin = this.routeDurationMin;
    // 1) Remove any existing routing control
    if (this.simroutingControl) {
      this.simulationmap.removeControl(this.simroutingControl);
      this.simroutingControl = undefined!;
    }

    // 2) Clear only the *route* markers (your Zwischenstopp pins),
    //    not the pickup/dest markers or circles
    this.clearsimRouteMarkers();

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
          .addTo(this.simulationmap)
          .bindPopup(label);

        this.simrouteMarkers.push(m);
      }
    });

    // 4) Re-draw the route line without adding any extra markers
    const Routing   = (this.L as any).Routing;
    const osrmRouter = Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1'
    });

    this.simroutingControl = Routing.control({
      waypoints:           coordinates,
      routeWhileDragging:  false,
      addWaypoints:        false,
      draggableWaypoints:  false,
      fitSelectedRoutes:   true,
      show: false,

      showAlternatives: true,
      altLineOptions: {
        styles: [{ color: 'rgba(51,49,49,0.69)', opacity: 0.8, weight: 5 }]
      },
      lineOptions:         { styles: [{ color: 'blue', weight: 5, opacity: 0.7 }] },

      // 🚫 disable all built-in markers:
      createMarker: () => null,

      router: osrmRouter
    })
      .addTo(this.simulationmap);

    const container = this.simroutingControl.getContainer();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }


    this.simroutingControl.on('routesfound', (e: any) => {
      console.log('Route found successfully!'); // Debug-Log
      const route = e.routes[0];
      const coords = route.coordinates as Leaflet.LatLng[];
      const duration = route.summary.totalTime; // in seconds


      // get the waypoints the user set: [start, ...middles, end]
      const wps = this.simroutingControl.getWaypoints() as Array<{ latLng: Leaflet.LatLng }>;
      // drop first & last to get only the Zwischenstopps
      const mids = wps.slice(1, -1).map(wp => wp.latLng);
      // start the moving marker
      if (isaktive) {

        this.simulateRoute(coords, duration, mids);
        // if(!this.simulationData){
        // }
      }
    });

  }



  private simulateRoute(path: Leaflet.LatLng[], realDurationSec: number, stops: Leaflet.LatLng[]): void {
    // 1) Remove any existing marker from the map.
    if (this.simulationMarker) {
      this.simulationmap.removeLayer(this.simulationMarker);
    }

    // 2) Check if we can resume the same simulation
    let isSamePath = false;
    if (this.simulationData && this.simulationData.path.length === path.length) {
      isSamePath = path.every((pt, i) => {
        const old = this.simulationData!.path[i];
        return old.lat === pt.lat && old.lng === pt.lng;
      });
    }

    // Marker icon
    const simIcon = this.L.icon({
      iconUrl: 'assets/leaflet/carmarker.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
    });

    if (isSamePath) {
      const data = this.simulationData!;
      const distAlong = data.totalLength * data.travelFrac;
      const currentLL = this.interpolatePosition(data.path, data.segLengths, distAlong);

      this.simulationMarker = this.L.marker(currentLL, { icon: simIcon }).addTo(this.simulationmap);
      data.lastTimeMs = performance.now();

      if (!this.simulationPaused) {
        requestAnimationFrame(this.stepSimulation.bind(this));
      }
      return;
    }

    // 3) Fresh setup for a new route
    const segLengths: number[] = [];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const d = this.simulationmap.distance(path[i - 1], path[i]);
      segLengths.push(d);
      total += d;
    }

    this.simulationMarker = this.L.marker(path[0], { icon: simIcon }).addTo(this.simulationmap);

    this.simulationData = {
      path,
      segLengths,
      totalLength: total,
      realDuration: realDurationSec,
      travelFrac: 0,
      lastTimeMs: performance.now(),
      stops: [...stops],
      paused: this.simulationPaused,
      simulationSpeedFactor: this.simulationSpeedFactor
    };

    localStorage.setItem('simTravelFrac', '0');
    localStorage.setItem('simPath', JSON.stringify(path));
    localStorage.setItem('simStops', JSON.stringify(stops));
    localStorage.setItem('simRealDuration', realDurationSec.toString());
    localStorage.setItem('isPaused', this.simulationPaused.toString());
    localStorage.setItem('simulationSpeedFactor', this.simulationSpeedFactor.toString());

    if (!this.simulationPaused) {
      requestAnimationFrame(this.stepSimulation.bind(this));
    }
  }



  private stepSimulation(nowMs: number) {
    // ❶ If paused or missing data/marker, bail out.
    if (this.simulationPaused) return;
    if (!this.simulationData || !this.simulationMarker) return;

    const data = this.simulationData;

    // ❷ Fix: If this is the first frame, initialize lastTimeMs
    if (!data.lastTimeMs) {
      data.lastTimeMs = nowMs;
    }

    // ❸ Compute elapsed time (in seconds) since last frame:
    const dtSec = (nowMs - data.lastTimeMs) / 1000;
    data.lastTimeMs = nowMs;

    // ❹ Advance the "travel fraction" by (dt / realDuration) × speedFactor:
    data.travelFrac = Math.min(
      1,
      data.travelFrac + dtSec * (this.simulationSpeedFactor / data.realDuration)
    );

    // ❺ Determine the total distance along the path to place the marker:
    const targetDist = data.totalLength * data.travelFrac;

    // ❻ Figure out which segment index we're on:
    let acc = 0, idx = 0;
    while (idx < data.segLengths.length && acc + data.segLengths[idx] <= targetDist) {
      acc += data.segLengths[idx++];
    }

    // ❼ If we've reached the end, snap marker to final point & stop:
    if (idx >= data.segLengths.length) {
      const lastLL = data.path[data.path.length - 1];
      this.simulationMarker.setLatLng(lastLL);

      if (this.autoZoomEnabled) {
        this.simulationmap.setView(lastLL, this.simulationZoom, { animate: false });
      }

      console.log('Just ended');

      // Stop simulation
      this.simulationPaused = true;
      this.animationFrameId = null;

      // Inform backend that ride has ended
      if (this.activeRequest) {
        const update: SimulationUpdate = {
          rideId: this.activeRequest.id,
          ...data,
          simulationSpeedFactor: this.simulationSpeedFactor,
          paused: true
        };
        this.WebSocketService.sendSimulationUpdate(update.rideId, update, true);
      }

      this.resetSimulationAfterEnd();

      return;
    }

    // ❽ Otherwise, interpolate the exact LatLng within the current segment:
    const fracInSeg = (targetDist - acc) / data.segLengths[idx];
    const p0 = data.path[idx], p1 = data.path[idx + 1];
    const currentLat = p0.lat + (p1.lat - p0.lat) * fracInSeg;
    const currentLng = p0.lng + (p1.lng - p0.lng) * fracInSeg;
    const currentLL  = this.L.latLng(currentLat, currentLng);

    // ❾ Move the marker & optionally recenter/zoom:
    this.simulationMarker.setLatLng(currentLL);
    if (this.autoZoomEnabled) {
      this.ignoreNextZoom = true;
      this.simulationmap.setView(currentLL, this.simulationZoom, { animate: false });
    }

    // ❿ Persist progress to localStorage (so closing/reopening resumes later):
    localStorage.setItem('simTravelFrac',   data.travelFrac.toString());
    localStorage.setItem('simPath',         JSON.stringify(data.path));
    localStorage.setItem('simStops',        JSON.stringify(data.stops));
    localStorage.setItem('simRealDuration', data.realDuration.toString());

    // ⓫ Check for arrival at any "Zwischenstopp":
    const threshold = 100; // meters
    for (const stopLL of data.stops) {
      if (this.simulationmap.distance(currentLL, stopLL) <= threshold) {
        this.pauseSimulation();
        data.stops = data.stops.filter(s => !(s.lat === stopLL.lat && s.lng === stopLL.lng));
        this.toastr.info('The ride has been paused in a middle Stopp. you can resume it any time','Ride Paused on ZwischenStop!!')
        return;
      }
    }

    // ⓬ If not at end, queue next frame:
    if (!this.simulationPaused && data.travelFrac < 1) {
      this.animationFrameId = requestAnimationFrame(this.stepSimulation.bind(this));
    } else {
      this.animationFrameId = null;
    }
  }




//<-----------simulation controls---------------->//


  public enableAutoZoom(): void {
    this.autoZoomEnabled = true;
    if (this.simulationMarker) {
      const ll = this.simulationMarker.getLatLng();
      this.simulationmap.setView(ll, this.simulationZoom, { animate: true });
    }
  }


  public pauseSimulation(): void {
    this.simulationPaused = true;
    localStorage.setItem('isPaused', 'true');

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.simulationData && this.simulationMarker && this.activeRequest) {
      const { paused, ...rest } = this.simulationData;
      const update: SimulationUpdate = {
        rideId: this.activeRequest.id,
        ...rest,
        simulationSpeedFactor: this.simulationSpeedFactor,
        paused: true
      };
      this.WebSocketService.sendSimulationUpdate(update.rideId, update,false);
    }
  }



  applyRemoteSimulationUpdate(update: SimulationUpdate): void {
    // 1. Sync speed to both UI and logic
    this.simulationSpeedFactor = update.simulationSpeedFactor;
    this.simulationSpeedUI = update.simulationSpeedFactor;
    localStorage.setItem('simulationSpeedFactor', update.simulationSpeedFactor.toString());

    // 2. Sync paused state
    this.simulationPaused = update.paused;
    localStorage.setItem('isPaused', update.paused.toString());

    // 3. Either update or fully create simulationData
    if (!this.simulationData) {
      this.simulationData = {
        path: update.path,
        segLengths: update.segLengths,
        totalLength: update.totalLength,
        realDuration: update.realDuration,
        travelFrac: update.travelFrac,
        lastTimeMs: performance.now(),
        stops: update.stops,
        paused: update.paused,
        simulationSpeedFactor: update.simulationSpeedFactor
      };
    } else {
      this.simulationData.travelFrac = update.travelFrac;
      this.simulationData.lastTimeMs = performance.now();
      this.simulationData.paused = update.paused;
      this.simulationData.simulationSpeedFactor = update.simulationSpeedFactor;
    }

    // 4. Move simulation marker immediately to synced position
    const distAlong = this.simulationData.totalLength * this.simulationData.travelFrac;
    const current = this.interpolatePosition(
      this.simulationData.path,
      this.simulationData.segLengths,
      distAlong
    );
    this.simulationMarker?.setLatLng(current);

    // 5. Start or restart animation loop
    if (!update.paused) {
      // clear previous frame just in case
      if (this.animationFrameId != null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = requestAnimationFrame(this.stepSimulation.bind(this));
    }
  }


  resetSimulationAfterEnd(): void {
    const keysToRemove = [
      'simTravelFrac',
      'simPath',
      'simStops',
      'simRealDuration',
      'isPaused',
      'simulationSpeedFactor',
      'currentll'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    localStorage.setItem('offeredId', JSON.stringify(-1));
    localStorage.setItem('hasAllreadyOfferd', JSON.stringify(false));

    // 🔄 2. Reset simulation state
    this.simulationSpeedFactor = 1;
    this.simulationSpeedUI = 1;
    this.simulationPaused = false;
    this.simulationstatus = false;
    this.simulationData = undefined!;

    // 🚫 3. Remove simulation marker
    if (this.simulationMarker) {
      this.simulationmap.removeLayer(this.simulationMarker);
      this.simulationMarker = undefined!;
    }

    // 🚫 4. Remove Zwischenstopp route markers (green pins)
    this.clearsimRouteMarkers?.();  // safeguard with optional chaining

    // 🚫 5. Remove routing control (blue route line)
    if (this.simroutingControl) {
      try {
        this.simulationmap.removeControl(this.simroutingControl);
      } catch (err) {
        console.warn('Routing control was already removed:', err);
      }
      this.simroutingControl = undefined!;
    }

    // 🔚 6. Cancel animation frame if one is running
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log('✅ Simulation fully reset for ride ID:');
  }


  startSimulationAfterAccepted(response: rideResponse | undefined){

    if (!response) return;

    this.simstartAddress = `${response?.startLatLong?.lat ?? ''} , ${response?.startLatLong?.lng ?? ''}`;
    this.simzielAddress = `${response?.destinationLatLong?.lat ?? ''} , ${response?.destinationLatLong?.lng ?? ''}`
    this.simzwischenstoppsText = '';
    for (var latlng of response?.zwischenstposlatlong ?? []) {
      this.simzwischenstoppsText += `${latlng.lat} ${latlng.lng} , `;


      this.simrouteDurationMin = response?.duration ?? 0;
      this.simrouteDistanceKm = response?.distance ?? 0;
      this.simroutePriceInEuro = response?.price ?? 0;

      if (response?.status === 'Assigned' ) {

        this.simulationstatus = true;

        this.updateRouteforsimulation(true);


      } else {
        this.simulationstatus = false;
        this.updateRouteforsimulation(false);
      }

      setTimeout(() => this.simulationmap.invalidateSize(), 300);


    }
  }



  public resumeSimulation(): void {
    if (!this.simulationData || !this.simulationMarker || !this.activeRequest) return;

    this.simulationPaused = false;
    this.simulationData.paused = false; // ✅ Update the simulationData too
    localStorage.setItem('isPaused', 'false');

    const update: SimulationUpdate = {
      rideId: this.activeRequest.id,
      ...this.simulationData,
      simulationSpeedFactor: this.simulationSpeedFactor,
      paused: false
    };

    this.WebSocketService.sendSimulationUpdate(update.rideId, update, false);
    this.simulationData.lastTimeMs = performance.now();
    this.animationFrameId = requestAnimationFrame(this.stepSimulation.bind(this));
  }



  public toggleSimulation(): void {
    if (this.simulationPaused) {
      this.resumeSimulation();
    } else {
      this.pauseSimulation();
    }
  }



  onSpeedSliderCommit(): void {
    // 1️⃣ Apply chosen speed to the real simulation factor
    this.simulationSpeedFactor = this.simulationSpeedUI;
    localStorage.setItem('simulationSpeedFactor', this.simulationSpeedFactor.toString());

    // 2️⃣ Prepare and send update only if simulation is running
    if (this.simulationData && this.simulationMarker && this.activeRequest) {
      const update: SimulationUpdate = {
        rideId: this.activeRequest.id,

        // Only critical data for syncing
        simulationSpeedFactor: this.simulationSpeedFactor,
        travelFrac: this.simulationData.travelFrac,
        paused: this.simulationPaused,

        // Use *local* timestamp, NEVER trust remote time
        lastTimeMs: performance.now(),

        // Skip full data for speed updates
        path: [],
        segLengths: [],
        totalLength: 0,
        realDuration: 0,
        stops: [],
      };

      // 3️⃣ Send via WebSocket (no backend save)
      this.WebSocketService.sendSimulationUpdate(update.rideId, update, false);
    }
  }



  // Chat methods
  openChat(ride: rideResponse): void {
    if (!ride) return;

    console.log('Opening chat for ride:', ride);
    console.log('Current user is driver:', this.isdriver);

    // Determine the other user (driver or customer)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const authResponse: AuthenticationResponse = JSON.parse(storedUser);
      this.currentUser = authResponse.kundeDTO?.userName || '';
    }

    if (this.isdriver) {
      // If current user is driver, chat with customer
      this.chatOtherUser = ride.customerUserName;
      console.log('Driver chatting with customer:', this.chatOtherUser);
    } else {
      // If current user is customer, chat with driver
      this.chatOtherUser = ride.driverUserName;
      console.log('Customer chatting with driver:', this.chatOtherUser);
    }



    console.log('Final chatOtherUser:', this.chatOtherUser);

    this.showChat = true;
    this.toastr.info(`Chat mit ${this.chatOtherUser} geöffnet`, 'Chat');
  }

  closeChat(): void {
    this.showChat = false;
    this.chatOtherUser = '';
    this.toastr.info('Chat geschlossen', 'Chat');
  }

  // Track message by ID for performance
  trackByMessageId(index: number, message: any): number {
    return message.id;
  }

  private interpolatePosition(path: Leaflet.LatLng[], segLens: number[], dist: number): Leaflet.LatLng {
    let acc = 0, idx = 0;
    while (idx < segLens.length && acc + segLens[idx] < dist) {
      acc += segLens[idx++];
    }
    if (idx >= segLens.length) return path[path.length - 1];
    const frac = (dist - acc) / segLens[idx];
    const p0 = path[idx], p1 = path[idx+1];
    return this.L.latLng(
      p0.lat + (p1.lat - p0.lat) * frac,
      p0.lng + (p1.lng - p0.lng) * frac
    );
  }

}
