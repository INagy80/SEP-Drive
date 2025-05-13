import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type * as Leaflet from 'leaflet';
import togpx from 'togpx';
import {marker} from 'leaflet';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private L!: typeof Leaflet;
  private map!: Leaflet.Map;
  private pickupMarker?: Leaflet.Marker;
  private destMarker?: Leaflet.Marker;
  private routeControl?: any;
  private routingControl: Leaflet.Routing.Control | null = null;


  startAddress: string = '';
  zielAddress: string = '';
  zwischenstoppsText: string = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  async ngAfterViewInit(): Promise<void> {
    // Only run in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Dynamically import Leaflet & routing plugin
    this.L = await import('leaflet');
    await import('leaflet-routing-machine');

    this.initMap();
    this.useCurrentPosition();
  }

  ngOnDestroy(): void {
    // Clean up map instance
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const {map, tileLayer} = this.L;

    // Initialize map centered on Berlin
    this.map = map('map', {
      center: [52.52, 13.405],
      zoom: 13
    });

    // Google Streets tile layer
    tileLayer(
      'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google'
      }
    ).addTo(this.map);

    // Click handler for placing markers
    this.map.on('click', (e: Leaflet.LeafletMouseEvent) => this.onMapClick(e));
  }

  private onMapClick(e: Leaflet.LeafletMouseEvent): void {
    const {marker} = this.L;

    if (!this.pickupMarker) {
      this.pickupMarker = marker(e.latlng, {draggable: true})
        .addTo(this.map)
        .bindPopup('Pickup')
        .openPopup();
      this.startAddress = e.latlng.toString();

      this.pickupMarker.on('dragend', () => this.calculateRoute());
    } else if (!this.destMarker) {
      this.destMarker = marker(e.latlng, {draggable: true})
        .addTo(this.map)
        .bindPopup('Destination')
        .openPopup();

      this.zielAddress = e.latlng.toString();
      this.destMarker.on('dragend', () => this.calculateRoute());
      this.calculateRoute();
    }
  }


  private calculateRoute(): void {
    if (!this.pickupMarker || !this.destMarker) {
      return;
    }

    // Remove previous route if present
    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
    }


    const Routing = (this.L as any).Routing;
    this.routeControl = Routing.control({
      waypoints: [
        this.pickupMarker.getLatLng(),
        this.destMarker.getLatLng()
      ],
      router: Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      lineOptions: {
        styles: [{weight: 4}]
      },
      show: true,
      addWaypoints: true
    }).addTo(this.map);

    // When route is found, export to GPX
    this.routeControl.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const coords = route.coordinates.map((c: any) => [c.lng, c.lat]);
      const geojson = {
        type: 'Feature',
        geometry: {type: 'LineString', coordinates: coords},
        properties: {name: 'Car route'}
      };
      const gpx = togpx(geojson);
      this.downloadGpx(gpx);
      // Or send to your backend:
      // this.uploadGpx(gpx);
    });
  }

  private downloadGpx(gpx: string): void {
    const blob = new Blob([gpx], {type: 'application/gpx+xml'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route.gpx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private uploadGpx(gpx: string): void {
    this.http.post('/api/routes', {gpx}).subscribe({
      next: () => console.log('Route uploaded'),
      error: err => console.error('Upload failed', err)
    });
  }


  private drawRoute(coordinates: L.LatLng[], labels: string[]): void {
    // Vorherige Route entfernen, falls vorhanden
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    // Marker für Start/Zwischenstopps/Ziel setzen
    coordinates.forEach((point, index) => {

      const marker = this.L.marker(point).addTo(this.map);
      marker.bindPopup(labels[index]); // Popup wird nur beim Klick geöffnet
    });

    // OSRM-Router separat definieren
    const osrmRouter = this.L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1' // Routing-URL des OSRM-Servers
    });

    // Routing-Kontrolle mit deutscher Wegbeschreibung
    this.routingControl = this.L.Routing.control({
      waypoints: coordinates,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{color: 'blue', weight: 5, opacity: 0.7}]
      },
      createMarker: (i: number, wp: Leaflet.Routing.Waypoint, nWps: number) => {
        return this.L.marker(wp.latLng); // Dummy Marker zur Unterdrückung der Standardmarker
      },
      router: osrmRouter // Setze den Router direkt – Umgehung des Typs mit `as any` unten
    } as any).addTo(this.map); // `as any` um TypeScript-Beschränkung zu umgehen
  }

  useCurrentPosition(): void {
    // Abfrage nach aktueller Position des Benutzers
    if (!navigator.geolocation) {
      alert('Geolocation wird von deinem Browser nicht unterstützt.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentCoord = this.L.latLng(position.coords.latitude, position.coords.longitude);

        // Karte zentrieren und einzoomen auf die aktuelle Position
        this.map.setView(currentCoord, 13); // Zoomstufe 13

        // Marker für aktuelle Position hinzufügen
        this.L.marker(currentCoord)
          .addTo(this.map)
          .bindPopup('Aktuelle Position'); // Popup wird nur bei Klick geöffnet

        // Route nur mit aktuellem Standort darstellen (als Startpunkt)
        this.drawRoute([currentCoord], ['Aktuelle Position']);
      },
      (error) => {
        alert('Fehler beim Abrufen der Position: ' + error.message);
      }
    );
  }

  private geocodeAddress(address: string): Promise<L.LatLng> {
    // Nominatim OpenStreetMap API zur Adressauflösung
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return this.http.get<any[]>(url).toPromise().then((data) => {
      if (!data || data.length === 0) {
        throw new Error('Adresse konnte nicht gefunden werden.');
      }
      const {lat, lon} = data[0];
      return this.L.latLng(parseFloat(lat), parseFloat(lon));
    });
  }

  updateRoute(): void {
    // Adressen verarbeiten und geokodieren
    const addressPromises: Promise<Leaflet.LatLng>[] = [];
    const labels: string[] = [];

    if (this.startAddress) {
      addressPromises.push(this.geocodeAddress(this.startAddress));
      labels.push('Start');
    }

    if (this.zwischenstoppsText) {
      const stops = this.zwischenstoppsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      stops.forEach((stop, i) => {
        addressPromises.push(this.geocodeAddress(stop));
        labels.push(`Zwischenstopp ${i + 1}`);
      });
    }

    if (this.zielAddress) {
      addressPromises.push(this.geocodeAddress(this.zielAddress));
      labels.push('Ziel');
    }

    // Wenn alle Koordinaten bereit sind: Route zeichnen
    Promise.all(addressPromises)
      .then((coordinates) => {
        this.drawRoute(coordinates, labels);
      })
      .catch((error) => {
        alert('Fehler bei der Geokodierung: ' + error.message);
      });
  }
}
