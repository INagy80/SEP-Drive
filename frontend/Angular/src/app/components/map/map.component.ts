import {Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import type * as Leaflet from 'leaflet';
import { HttpClient } from '@angular/common/http';
import togpx from 'togpx';
import {LatLng, rideRequestDTO} from '../../models/rideRequestDTO';
import {RideRequestService} from '../../services/rideRequest/ride-request.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import {Sidebar} from 'primeng/sidebar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import {rideResponse} from '../../models/rideResponse';
import {Button} from 'primeng/button';
import {Router, RouterLink} from "@angular/router";
import {Drawer} from 'primeng/drawer';
import {MatDivider} from '@angular/material/divider';
import {Rating} from 'primeng/rating';


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FormsModule, MatSidenavModule, ScrollPanelModule, NgForOf, DatePipe, NgIf, NgClass, Button, Drawer, MatDivider, Rating, RouterLink]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private L!: typeof Leaflet;
  private map!: Leaflet.Map;

  private pickupMarker?: any;
  private pickupCircle?: any;
  private destMarker?: any;
  private destCircle?: any;
  private routeControl?: any;
  private routingControl: Leaflet.Routing.Control | null = null;
  private routeMarkers: Leaflet.Layer[] = [];









  startAddress =  '';
  zielAddress =  '';
  zwischenstoppsText = '';
  vehicleClasses = ['klein', 'Medium', 'Deluxe'];
  selectedCarClass = '';
  visible: boolean = false;
  private errorMsg: string = '';
  private message: string = '';
  gpxfile: File | null = null;
  routeDistanceKm : number = 0;
  routeDurationMin : number = 0;
  routePriceInEuro: number = 0;



  rideRequests: Array<rideRequestDTO> = [];
  rideResponses : Array<rideResponse> = [];

  ascendingitem: any;
  descendingitem: any;
  search: any;


  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private rideRequestService : RideRequestService,
    private router: Router,

  ) {}

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




  isvisible(){
    this.visible = true;
  }

  get activeRequest(): rideResponse | undefined {
    return this.rideResponses.find(r => r.status === 'Active');
  }

  get historyRequests(): rideResponse[] {
    return this.rideResponses.filter(r => r.status !== 'Active');
  }



  // ngOnInit(): void {
  //   this.findAllrideRequests();
  // }

  findAllrideResponse(){
    this.isvisible()
    this.rideRequestService.getAll()
      .subscribe({
        next: (data) => {
          this.rideResponses = data;
          console.log(data);

        },
        error: (err) => {
          console.log(err);
          alert('something went wrong');
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

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const leafletModule = await import('leaflet');
    (window as any).L = leafletModule;
    await import('leaflet-routing-machine');
    this.L = leafletModule;

    this.initMap();
    this.useCurrentPosition();
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


  private reverseGeocode(latlng: Leaflet.LatLng): Promise<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`;
    return this.http
      .get<{ display_name: string }>(url)
      .toPromise()
      .then(res => res?.display_name || 'unbekannt');
  }



  private onMapClick(e: Leaflet.LeafletMouseEvent): void {
    if (!this.pickupMarker) {
      // First click: set pickup
       const pickupicon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon-2x.png',  // Use your own path here
        iconSize: [25, 41],                      // Default Leaflet size
        iconAnchor: [12, 41],                    // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -41]                    // Point from which the popup should open
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


        this.calculateRoute();
    } else {
      // Set or reset destination
      if (this.destMarker) {
        return;
      }

       const zielicon = this.L.icon({
        iconUrl: 'assets/leaflet/marker-icon-red.png',  // Use your own path here
        iconSize: [25, 41],                      // Default Leaflet size
        iconAnchor: [12, 41],                    // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -41]                    // Point from which the popup should open
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

      this.calculateRoute();
    }
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

      const distanceInKm = (route.summary.totalDistance || route.summary.distance) / 1000; // meters → km
      const durationInMin = (route.summary.totalTime || route.summary.duration) / 60; // seconds → minutes
      console.log(`Route distance: ${distanceInKm.toFixed(2)} km`);
      console.log(`Estimated duration: ${durationInMin.toFixed(2)} minutes`);

      this.routeDistanceKm = distanceInKm;
      this.routeDurationMin = durationInMin;

      // 🟢 2. Generate GPX file
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




   createRideRequest(): void {

    this.updateRoute().then(() => {

     const startLatLng: LatLng = {
       lat: this.pickupMarker.getLatLng().lat,
       lng: this.pickupMarker.getLatLng().lng
     };
     const destLatLng: LatLng = {
       lat: this.destMarker.getLatLng().lat,
       lng: this.destMarker.getLatLng().lng
     };

     //  Build the DTO
     const requestDto: rideRequestDTO = {
       distance: parseFloat(this.routeDistanceKm.toFixed(2)),
       duration: parseFloat(this.routeDurationMin.toFixed(2)),
       price: parseFloat(this.routePriceInEuro.toFixed(2)),
       start: startLatLng,
       startaddress: this.startAddress,
       destination: destLatLng,
       destinationaddress: this.zielAddress,
       carClass: this.selectedCarClass as "Medium" | "Deluxe" | "klein"
     };




       // Call the service
     if (this.selectedCarClass === '') {
       this.errorMsg = 'Bitte wählen Sie eine Auto Klasse aus.';
       alert(this.errorMsg);
       return;

     }

         this.rideRequestService.create(requestDto)
           .subscribe({
             next: (res) => {
               alert('Fahrt angefordert');

             },
             error: (err) => {
               if (err.error.statusCode === 401 || err.error.statusCode === 403 || err.error.statusCode === 500) {
                 if (err.error.message.includes('You already have an active request')){
                   this.errorMsg = 'you already have an active ride request';
                   alert(this.errorMsg);
                 }else if (err.error.message.includes('No acceptable representation')){
                   this.errorMsg = 'your ride request is succesfully created';
                   alert(this.errorMsg);
                 }
                 else{
                   this.errorMsg = 'something went wrong';
                   alert(this.errorMsg);
                   window.location.reload();

                 }
               }
             }
           });

    }).catch(err => {
      console.error('Failed to update route:', err);
      alert('Fehler beim Aktualisieren der Route. Bitte erst auf "Route anzeigen" klicken und dann erneut versuchen.');
    })

     }




  private clearRouteMarkers(): void {
    this.routeMarkers.forEach(m => this.map.removeLayer(m));
    this.routeMarkers = [];
  }


  private drawRoute(coordinates: Leaflet.LatLng[], labels: string[]): void {
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

    this.calculateRoute();


  }


  useCurrentPosition(): void {
    if (!navigator.geolocation) { alert('Geolocation wird von deinem Browser nicht unterstützt.'); return; }

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
       alert('Fehler beim Abrufen der Position: ' + err.message)
       window.location.reload();
      }
    );
  }

  setCurrentlocation(): void{
    if (!navigator.geolocation) { alert('Geolocation wird von deinem Browser nicht unterstützt.'); return; }
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
        alert('Fehler beim Abrufen der Position: ' + err.message)
        window.location.reload();
      }
    );

  }

  async updateRoute(): Promise<void> {
    // 1) clear any old route lines / circles your clearRouteMarkers may not handle
    this.clearRouteMarkers();

    // 2) validation: need at least one of (pickupMarker ↔ startAddress)
    //    and one of (destMarker ↔ zielAddress)
    const hasStart = !!this.pickupMarker || !!this.startAddress;
    const hasEnd   = !!this.destMarker   || !!this.zielAddress;
    if (!hasStart || !hasEnd) {
      alert('Bitte setzen Sie Start- und Zielpunkt (Marker oder Adresse) bevor Sie eine Route anfordern.');
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
          waypoints.push({ coord: c, label: `Zwischenstopp ${i + 1}` });
        } catch (err) {
          console.warn(`Zwischenstopp "${stops[i]}" konnte nicht geokodiert werden`, err);
        }
      }
    }

    waypoints.push({ coord: destCoord, label: 'Ziel' });

    this.calculateRoute();

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


  deleteCustomer($event: rideRequestDTO) {

  }

  updateCustomer($event: rideRequestDTO) {

  }

  protected readonly navigator = navigator;





  startseite() {
    this.router.navigate(['/home']);

  }


  profile() {
    this.router.navigate(['/profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);

  }

  statusdelete() {


        this.rideRequestService.deletestatus().subscribe({
            next: () => {
                alert('rideRequest deleted succesfully');
                this.findAllrideRequests();
            },
            error: (err) => {
                alert('something went wrong');
            }
        });

  }


  onAscendingitemChange($event: any) {

  }

  ondescendingitemChange($event: any) {

  }
}
