import {Component, Inject, PLATFORM_ID, AfterViewInit, OnDestroy, OnInit, ViewChild, ElementRef} from '@angular/core';
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
import {Drawer} from 'primeng/drawer';
import {MatDivider} from '@angular/material/divider';
import {Rating} from 'primeng/rating';


@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FormsModule, MatSidenavModule, ScrollPanelModule, NgForOf, DatePipe, NgIf, NgClass, Button, Drawer, MatDivider, Rating]
})
export class MapComponent implements AfterViewInit, OnDestroy {

  @ViewChild('simulationMapContainer', { static: false })
  private simulationMapContainer!: ElementRef<HTMLDivElement>;


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



  rideRequests: Array<rideRequestDTO> = [];
  rideResponses : Array<rideResponse> = [];

  ohnesortierungarray: Array<rideResponse> = [];
  ascendingitem: String = '';
  descendingitem: String = '';
  search: String = '';






  //<..... Simulation ......>

  private simpickupMarker?: any;
  private simpickupCircle?: any;
  private simdestMarker?: any;
  private simdestCircle?: any;
  private simrouteControl?: any;
  private simroutingControl: any;
  private simrouteMarkers: Leaflet.Layer[] = [];

  private simulationmap!: Leaflet.Map;

  // The “simulator” marker that moves
  private simulationMarker?: Leaflet.Marker;


  simstartAddress =  '';
  simzielAddress =  '';
  simzwischenstoppsText = '';
  simzwischenstops : LatLng[] = [];
  simzwischenstoppsTextArray : string[] = [];
  simselectedCarClass = '';
  simrouteDistanceKm : number = 0;
  simrouteDurationMin : number = 0;
  simroutePriceInEuro: number = 0;


  private simulationData?: {
    path:         Leaflet.LatLng[];
    segLengths:   number[];
    totalLength:  number;
    realDuration: number;     // seconds, as returned by OSRM
    travelFrac:   number;     // from 0→1
    lastTimeMs:   number; // timestamp of the last frame
    stops: Leaflet.LatLng[];
  };

   simulationSpeedFactor: number = 1;
  // whether stepSimulation should keep recentering+zooming
  autoZoomEnabled = true;

  // helper to ignore our own zoom event
  ignoreNextZoom = false;

  // your desired fixed zoom level
  simulationZoom = 16;

  simulationPaused = false;
  simulationvisible: boolean = false;


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
          this.ohnesortierungarray = [...data]
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
    this.initSimulationMap();


    this.useCurrentPosition();

    // RESTORE SIMULATION IF DATA EXISTS
    const frac = parseFloat(localStorage.getItem('simTravelFrac')  || '0');
    const path = JSON.parse(localStorage.getItem('simPath')       || 'null');
    const stops= JSON.parse(localStorage.getItem('simStops')      || 'null');
    const dur  = parseFloat(localStorage.getItem('simRealDuration') || '0');

    if (path && Array.isArray(path) && dur > 0) {
      // 1) rebuild simulationData (as before)…
      const segLengths: number[] = [];
      let total = 0;
      for (let i = 1; i < path.length; i++) {
        const d = this.simulationmap.distance(path[i-1], path[i]);
        segLengths.push(d);
        total += d;
      }
      this.simulationData = {
        path:         path as Leaflet.LatLng[],
        segLengths,
        totalLength:  total,
        realDuration: dur,
        travelFrac:   frac,
        lastTimeMs:   performance.now(),
        stops:        stops as Leaflet.LatLng[]
      };

      // 2) draw the blue route polyline again
      this.L.polyline(
        this.simulationData.path,
        { color: 'blue', weight: 5, opacity: 0.7 }
      ).addTo(this.simulationmap);

      // 3) redraw the green Zwischenstopp pins
      const greenIcon = this.L.icon({
        iconUrl:   'assets/leaflet/marker-icon-green.png',
        iconSize:  [25, 41],
        iconAnchor:[12, 41],
        popupAnchor:[0, -41]
      });
      for (const stopLL of this.simulationData.stops) {
        this.L.marker(stopLL, { icon: greenIcon, keyboard: false })
          .addTo(this.simulationmap);
      }

      // 4) place the simulation marker at the correct interpolated spot
      const distAlong = total * frac;
      const current = this.interpolatePosition(
        this.simulationData.path,
        segLengths,
        distAlong
      );
      const simIcon = this.L.icon({
        iconUrl: 'assets/leaflet/carmarker.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41]
      });
      this.simulationMarker = this.L.marker(current, { icon: simIcon })
        .addTo(this.simulationmap);

      // 5) resume the animation
      requestAnimationFrame(this.stepSimulation.bind(this));
    }
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



  private initSimulationMap(): void {
    // 1) build the Leaflet map on the drawer’s container
    this.simulationmap = this.L.map(
      this.simulationMapContainer.nativeElement,
      { center: [51.430575, 6.896667], zoom: 13 }
    );

    // 2) add the same tile layer (or any you like)
    this.L.tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      { subdomains: ['mt0','mt1','mt2','mt3'], attribution: '&copy; Google' }
    ).addTo(this.simulationmap);

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

   if(this.routeDurationMin === 0 || this.routeDistanceKm === 0){
     alert("please click on (Route anzeigen) button first to calculate the route");
     return;
   }
   if(this.routePriceInEuro === 0){
     alert("Bitte wählen Sie eine Auto Klasse aus.");
     return;
   }

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
       zwischenstops: this.zwischenstops,
       zwischenstopssaddress: this.zwischenstoppsTextArray,
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

  private clearsimRouteMarkers(): void {
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


    this.routingControl.on('routesfound', (e: any) => {
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

    this.zwischenstops = [];
    this.zwischenstoppsTextArray = [];

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


  deleteCustomer($event: rideRequestDTO) {

  }

  updateCustomer($event: rideRequestDTO) {

  }






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


  onAscendingitemChange(ascendingitem: String) {
    this.ascendingitem = ascendingitem;

    switch (this.ascendingitem) {
      case 'no':
      case 'CFN':
      case 'CUN':
        this.rideResponses = this.ohnesortierungarray;
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
      case 'CFN':
      case 'CUN':
        this.rideResponses = this.ohnesortierungarray;
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

  onAddresChange(adress: string) {
    this.routeDurationMin = 0;
    this.routeDistanceKm = 0;
    this.routePriceInEuro = 0;

  }



  private drawRouteforsimulation(coordinates: Leaflet.LatLng[], labels: string[]): void {

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
      .addTo(this.simulationmap);



    this.simroutingControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const coords = route.coordinates as Leaflet.LatLng[];
      const duration = route.summary.totalTime; // in seconds


      // get the waypoints the user set: [start, ...middles, end]
      const wps = this.simroutingControl.getWaypoints() as Array<{ latLng: Leaflet.LatLng }>;
      // drop first & last to get only the Zwischenstopps
      const mids = wps.slice(1, -1).map(wp => wp.latLng);
      // start the moving marker
      this.simulateRoute(coords, duration, mids);
    });




  }

  private simulateRoute(path: Leaflet.LatLng[], realDurationSec: number, stops: Leaflet.LatLng[]) {
    // 1) remove old
    if (this.simulationMarker) {
      this.simulationmap.removeLayer(this.simulationMarker);
    }

    // 2) precompute segment lengths & total
    const segLengths: number[] = [];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const d = this.simulationmap.distance(path[i-1], path[i]);
      segLengths.push(d);
      total += d;
    }
    const simIcon = this.L.icon({
      iconUrl: 'assets/leaflet/carmarker.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
    });

    // 3) place the marker
    this.simulationMarker = this.L.marker(path[0], { icon: simIcon })
      .addTo(this.simulationmap);

    // 4) store state
    this.simulationData = {
      path,
      segLengths,
      totalLength: total,
      realDuration: realDurationSec,
      travelFrac: 0,
      lastTimeMs: performance.now(),
      stops
    };

    // 5) kick off the loop
    requestAnimationFrame(this.stepSimulation.bind(this));
  }





  private stepSimulation(nowMs: number) {
    if (this.simulationPaused) return;
    if (!this.simulationData || !this.simulationMarker) return;

    const data = this.simulationData;

    // 1) compute delta time since last frame
    const dtSec = (nowMs - data.lastTimeMs) / 1000;
    data.lastTimeMs = nowMs;

    // 2) increment travel fraction by (dt / realDuration) scaled by speedFactor
    data.travelFrac = Math.min(
      1,
      data.travelFrac + dtSec * (this.simulationSpeedFactor / data.realDuration)
    );

    // 3) compute target distance along the route
    const targetDist = data.totalLength * data.travelFrac;

    // 4) find which segment we’re on
    let acc = 0, idx = 0;
    while (idx < data.segLengths.length && acc + data.segLengths[idx] < targetDist) {
      acc += data.segLengths[idx++];
    }

    // 5) if at the end, snap and stop
    if (idx >= data.segLengths.length) {
      const last = data.path[data.path.length - 1];
      this.simulationMarker.setLatLng(last);
      // center & zoom one final time
      this.simulationmap.setView(last, this.simulationZoom, { animate: false });
      return;
    }

    // 6) interpolate within the segment
    const fracInSeg = (targetDist - acc) / data.segLengths[idx];
    const p0 = data.path[idx], p1 = data.path[idx + 1];
    const lat = p0.lat + (p1.lat - p0.lat) * fracInSeg;
    const lng = p0.lng + (p1.lng - p0.lng) * fracInSeg;
    const current = new this.L.LatLng(lat, lng);

    // move marker
    this.simulationMarker.setLatLng(current);

    // ** center & lock zoom **
    if (this.autoZoomEnabled) {
      // tell our listener to ignore the next zoomstart
      this.ignoreNextZoom = true;
      this.simulationmap.setView(current, this.simulationZoom, { animate: false });
    }

    // 2) SAVE PROGRESS
    localStorage.setItem('simTravelFrac',    data.travelFrac.toString());
    localStorage.setItem('simPath',          JSON.stringify(data.path));
    localStorage.setItem('simStops',         JSON.stringify(data.stops));
    localStorage.setItem('simRealDuration',  data.realDuration.toString());


    // --- check for arrival at any remaining stop ---
    const threshold = 100; // meters
    for (const stopLL of data.stops) {
      if (this.simulationmap.distance(current, stopLL) <= threshold) {
        this.pauseSimulation();
        // remove that stop so we don't pause there again
        data.stops = data.stops.filter(s => s !== stopLL);
        return;  // exit without scheduling next frame
      }
    }

    // 7) continue animating until travelFrac===1
    if (data.travelFrac < 1) {
      requestAnimationFrame(this.stepSimulation.bind(this));
    }
  }


  public enableAutoZoom(): void {
    this.autoZoomEnabled = true;
    if (this.simulationMarker) {
      const ll = this.simulationMarker.getLatLng();
      this.simulationmap.setView(ll, this.simulationZoom, { animate: true });
    }
  }


  public pauseSimulation(): void {
    this.simulationPaused = true;
  }

  public resumeSimulation(): void {
    if (!this.simulationData || !this.simulationMarker) return;
    this.simulationPaused = false;
    // reset the “last frame” clock so we don’t get a huge dt
    this.simulationData.lastTimeMs = performance.now();
    requestAnimationFrame(this.stepSimulation.bind(this));
  }

  public toggleSimulation(): void {
    if (this.simulationPaused) {
      this.resumeSimulation();
    } else {
      this.pauseSimulation();
    }
  }

  simulationview(response: rideResponse | undefined){


    this.simulationvisible = true;
      console.log(response)
      this.simstartAddress = `${response?.startLatLong?.lat ?? ''} , ${response?.startLatLong?.lng ?? ''}`;
      this.simzielAddress = `${response?.destinationLatLong?.lat ?? ''} , ${response?.destinationLatLong?.lng ?? ''}`
      this.simzwischenstoppsTextArray = response?.zwischenstposaddress ?? [];
      this.simrouteDurationMin = response?.duration ?? 0;
      this.simrouteDistanceKm = response?.distance ?? 0;
      this.simroutePriceInEuro = response?.price ?? 0;

    if (!this.simulationData) {
      this.updateRouteforsimulation();

    }

    setTimeout(() => this.simulationmap.invalidateSize(), 300);


  }



  async updateRouteforsimulation(): Promise<void> {
    // 1) clear any old route lines / circles your clearRouteMarkers may not handle
    this.clearsimRouteMarkers();

    // 2) validation: need at least one of (pickupMarker ↔ startAddress)
    //    and one of (destMarker ↔ zielAddress)
    const hasStart = !!this.simpickupMarker || !!this.simstartAddress;
    const hasEnd   = !!this.simdestMarker   || !!this.simzielAddress;
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
      waypoints.map(w => w.label)
    );
  }

}
