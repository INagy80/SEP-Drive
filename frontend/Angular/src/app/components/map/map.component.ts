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
import {Router} from "@angular/router";


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FormsModule, MatSidenavModule, Sidebar, ScrollPanelModule, NgForOf, DatePipe, NgIf, NgClass, Button]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private L!: typeof Leaflet;
  private map!: Leaflet.Map;

  private pickupMarker?: Leaflet.Marker;
  private destMarker?: Leaflet.CircleMarker;
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


  rideRequests: Array<rideRequestDTO> = [];
  rideResponses : Array<rideResponse> = [];


  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private rideRequestService : RideRequestService,
    private router: Router,

  ) {}

  onCarClassChange(newClass: string) {
    this.selectedCarClass = newClass;
  }

  isvisible(){
    this.visible = true;
    console.log('click working');
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
      this.pickupMarker = this.L.marker(e.latlng, { draggable: true })
        .addTo(this.map)
        .bindPopup('Pickup')
        .openPopup();

      this.pickupMarker.on('dragend', () => {
        const latlng = this.pickupMarker!.getLatLng();
        this.reverseGeocode(latlng)
          .then(address => {
            this.startAddress = address;   // or this.zielAddress, etc.
            // marker.bindPopup(address).openPopup();
          })
          .catch(err => console.error('Reverse geocode failed', err));
      });
        this.calculateRoute();
    } else {
      // Set or reset destination
      if (this.destMarker) this.destMarker.remove();
      this.destMarker = this.L.circleMarker(e.latlng, { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 1 })
        .addTo(this.map)
        .bindPopup('Ziel')
        .openPopup();

      this.destMarker.on('dragend', () => {
        const latlng = this.destMarker!.getLatLng();
        this.reverseGeocode(latlng).then(address => {
          this.zielAddress = address;
        }).catch(err => console.error('Reverse geocode failed', err));

        this.calculateRoute();
      });
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
      addWaypoints: true
    }).addTo(this.map);

    this.routeControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const coords = route.coordinates.map((c: any) => [c.lng, c.lat]);

      const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { name: 'Car route' } };
      const gpx = togpx(geojson);
      const blob = new Blob([gpx], { type: 'application/gpx+xml' });
      const gpxFile = new File([blob], 'route.gpx', { type: 'application/gpx+xml' });
      this.gpxfile = gpxFile;

      // this.downloadGpx(gpx);
    });
  }




   createRideRequest(): void {

    this.updateRoute()

     this.geocodeAddress(this.startAddress).then(coord => {
       if (this.pickupMarker) {
         this.map.removeLayer(this.pickupMarker);
       }
       this.pickupMarker = this.L.marker(coord, { draggable: true }).addTo(this.map).bindPopup('Pickup');

     })
     this.geocodeAddress(this.zielAddress).then(coord => {
       if (this.destMarker) {
         this.map.removeLayer(this.destMarker);
       }
       this.destMarker = this.L.circleMarker(coord, { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 1 })
         .addTo(this.map)
         .bindPopup('Ziel');
     })

     if (!this.pickupMarker || !this.destMarker) {
       alert('Bitte setzen Sie Start- und Zielmarker, bevor Sie eine Fahrt anfordern.');
       return;
     }

     const startLatLng: LatLng = {
       lat: this.pickupMarker.getLatLng().lat,
       lng: this.pickupMarker.getLatLng().lng
     };
     const destLatLng: LatLng = {
       lat: this.destMarker.getLatLng().lat,
       lng: this.destMarker.getLatLng().lng
     };





     // 3) Build the DTO
     const requestDto: rideRequestDTO = {
       start: startLatLng,
       startaddress: this.startAddress,
       destination: destLatLng,
       destinationaddress: this.zielAddress,
       carClass: this.selectedCarClass as "Medium" | "Deluxe" | "klein"
     };




       // 4) Call the service
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

                 }
               }
             }
           });

     }












  private clearRouteMarkers(): void {
    this.routeMarkers.forEach(m => this.map.removeLayer(m));
    this.routeMarkers = [];
  }

  private downloadGpx(gpx: string): void {
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route.gpx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private drawRoute(coordinates: Leaflet.LatLng[], labels: string[]): void {
    if (this.routingControl) this.map.removeControl(this.routingControl);
    this.clearRouteMarkers();

    // Draw only intermediate and current position markers
    coordinates.forEach((point, i) => {
      const label = labels[i];
      let markerLayer: Leaflet.Layer | null = null;
      if (label.startsWith('Zwischenstopp')) {
        markerLayer = this.L.circleMarker(point, { radius: 10, color: 'green', fillColor: 'green', fillOpacity: 1 });
      } else if (label === 'Aktuelle Position') {
        markerLayer = this.L.circleMarker(point, { radius: 10, color: 'blue', fillColor: 'blue', fillOpacity: 0.5 });
      }
      if (markerLayer) {
        markerLayer.addTo(this.map).bindPopup(label);
        this.routeMarkers.push(markerLayer);
      }
    });

    const Routing = (this.L as any).Routing;
    const osrmRouter = Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' });
    this.routingControl = Routing.control({
      waypoints: coordinates,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: 'blue', weight: 5, opacity: 0.7 }] },
      createMarker: (_i: number, wp: Leaflet.Routing.Waypoint) => this.L.marker(wp.latLng),
      router: osrmRouter
    }).addTo(this.map);
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
        this.routeMarkers.push(curr);
      },
      err => alert('Fehler beim Abrufen der Position: ' + err.message)
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
        this.pickupMarker = this.L.marker(coord, { draggable: true }).addTo(this.map).bindPopup('Pickup');
        this.reverseGeocode(coord).then(address => {
          this.startAddress = address;
        }).catch(err => console.error('Reverse geocode failed', err));
        this.routeMarkers.push(curr);
      },
      err => alert('Fehler beim Abrufen der Position: ' + err.message)
    );

  }

  updateRoute(): void {








    interface Pending { isMarker: boolean; marker?: Leaflet.LatLng; address?: string; label: string; }
    const pending: Pending[] = [];



    // Start point: marker or address

    this.geocodeAddress(this.startAddress).then(coord => {
      if (this.pickupMarker) {
        this.map.removeLayer(this.pickupMarker);
      }
      this.pickupMarker = this.L.marker(coord, { draggable: true }).addTo(this.map).bindPopup('Pickup');

    })
    this.geocodeAddress(this.zielAddress).then(coord => {
      if (this.destMarker) {
        this.map.removeLayer(this.destMarker);
      }
      this.destMarker = this.L.circleMarker(coord, { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 1 })
        .addTo(this.map)
        .bindPopup('Ziel');
    })




    if (this.pickupMarker) {
      pending.push({ isMarker: true, marker: this.pickupMarker.getLatLng(), label: 'Start' });
    } else if (this.startAddress) {
      pending.push({ isMarker: false, address: this.startAddress, label: 'Start' });
    }

    // Zwischenstopps
    if (this.zwischenstoppsText) {
      this.zwischenstoppsText.split(',').map(s => s.trim()).filter(s => s).forEach((stop, i) => {
        pending.push({ isMarker: false, address: stop, label: `Zwischenstopp ${i + 1}` });
      });
    }

    // Destination: marker or address
    if (this.destMarker) {
      pending.push({ isMarker: true, marker: this.destMarker.getLatLng(), label: 'Ziel' });
    } else if (this.zielAddress) {
      pending.push({ isMarker: false, address: this.zielAddress, label: 'Ziel' });
    }


    const addressPromises = pending.map(item =>
      item.isMarker ? Promise.resolve(item.marker!) : this.geocodeAddress(item.address!)
    );

    Promise.all(addressPromises).then(latlngs => {
      // Sync pickupMarker and startAddress
      const startIdx = pending.findIndex(p => p.label === 'Start');
      if (startIdx >= 0) {
        const coord = latlngs[startIdx];
        if (this.pickupMarker) {
          this.pickupMarker.setLatLng(coord);
        } else {
          this.pickupMarker = this.L.marker(coord, { draggable: true }).addTo(this.map).bindPopup('Pickup');
          this.pickupMarker.on('dragend', () => {
            const ll = this.pickupMarker!.getLatLng();
            this.reverseGeocode(ll).then(address => {
              this.startAddress = address
            }).catch(err => this.startAddress = 'unbekannt');
            this.calculateRoute();
          });
        }
        this.reverseGeocode(coord).then(address => {
          this.startAddress = address
        }).catch(err => this.startAddress = 'unbekannt');
        this.calculateRoute();
      }

      // Sync destMarker and zielAddress
      const destIdx = pending.findIndex(p => p.label === 'Ziel');
      if (destIdx >= 0) {
        const coord = latlngs[destIdx];
        if (this.destMarker) {
          this.destMarker.setLatLng(coord);
        } else {
          this.destMarker = this.L.circleMarker(coord, { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 1 })
            .addTo(this.map)
            .bindPopup('Ziel');
          this.destMarker.on('dragend', () => {
            const ll = this.destMarker!.getLatLng();
            this.reverseGeocode(ll).then(address => {
              this.zielAddress = address
            }).catch(err => this.zielAddress = 'unbekannt');
            this.calculateRoute();
          });
        }
        this.reverseGeocode(coord).then(address => {
          this.zielAddress = address
        }).catch(err => this.zielAddress = 'unbekannt');
        this.calculateRoute();
      }


      // Draw route with all points
      const coords = latlngs;
      const labels = pending.map(p => p.label);
      this.drawRoute(coords, labels);
    }).catch(error => {
      alert('Fehler bei der Geokodierung: ' + error.message);
    });




  }

  private geocodeAddress(address: string): Promise<Leaflet.LatLng> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return this.http.get<any[]>(url).toPromise().then(data => {
      if (!data || data.length === 0) throw new Error('Adresse konnte nicht gefunden werden.');
      return this.L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    });
  }


  deleteCustomer($event: rideRequestDTO) {

  }

  updateCustomer($event: rideRequestDTO) {

  }

  protected readonly navigator = navigator;

  startseite() {
    this.router.navigate(['/map']);

  }

  profile() {
    this.router.navigate(['/profile']);

  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);

  }
}
