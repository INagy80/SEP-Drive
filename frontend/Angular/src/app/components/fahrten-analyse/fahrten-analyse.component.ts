import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {Button} from 'primeng/button';
import {HeaderComponent} from '../header/header.component';
import { StatisticsService } from '../../services/statics.service';
import {ChartData, StatisticsData } from '../../models/statics-data';
import {ToastrService} from 'ngx-toastr';





@Component({
  selector: 'app-fahrten-analyse',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, HeaderComponent],
  templateUrl: './fahrten-analyse.component.html',
  styleUrls: ['./fahrten-analyse.component.scss']
})
export class FahrtenAnalyseComponent implements OnInit {




  // View options
  viewMode: 'daily' | 'monthly' = 'monthly';

  // Date selection
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  // Available years and months
  availableYears: number[] = [];
  availableMonths: { value: number; label: string }[] = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mrz' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Okt' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dez' }
  ];

  // Chart data
  statisticsData: StatisticsData = {
    earnings: [],
    distance: [],
    drivingTime: [],
    averageRating: []
  };




  isLoading: boolean = false;
  errorMessage: string = '';

  // Tooltip-Variablen
  tooltipVisible: boolean = false;
  tooltipText: string = '';
  tooltipX: number = 0;
  tooltipY: number = 0;

  constructor(
    private router: Router,
    private WebSocketService : WebsocketService,
    private statisticsService: StatisticsService,
    private toaster : ToastrService

  ) {
    this.generateAvailableYears();

  }

  ngOnInit(): void {
    this.loadStatisticsData();
  }


  /**
   * Generiert die Liste der verfügbaren Jahre für die Auswahl.
   */
  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      this.availableYears.push(year);
    }
  }


  // ----------------Diese Methode nimmt Daten vom Backend vom Server------------//





  private loadStatisticsData(): void {
    if (this.viewMode === 'monthly') {
      this.loadMonthlyData();
    }else {
      this.loadDailyData();
    }
  }


  private loadMonthlyData(): void {
   this.statisticsService.getMonthlyData(this.selectedYear).subscribe(
     data => {
       this.statisticsData = data;

     },
     error => {

     }
   )
  }

  private loadDailyData(): void {
    this.statisticsService.getDailyData(this.selectedYear, this.selectedMonth).subscribe({
      next: data => {
        this.statisticsData = data;
      },
      error: error => {


      }
      }
    );
  }


  onViewModeChange(): void {
    this.loadStatisticsData();
  }

  /**
   * Wird aufgerufen, wenn das Jahr geändert wird.
   */
  onYearChange(): void {
    this.loadStatisticsData();
  }

  /**
   * Wird aufgerufen, wenn der Monat geändert wird.
   */
  onMonthChange(): void {
    this.loadStatisticsData();
  }

  /**
   * Gibt den Maximalwert einer Datenreihe zurück (für die Skalierung des Diagramms).
   */
  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(item => item.value));
  }

  /**
   * Berechnet die Punkte für das Liniendiagramm als String.
   * xOffset verschiebt die Linie nach rechts (für Y-Achse).
   */
  getLineChartPoints(data: ChartData[], xOffset: number = 0): string {
    if (data.length === 0) {
      return '';
    }

    const maxValue = this.getMaxValue(data);
    // If maxValue is zero, draw a flat line along the bottom (y=300)
    if (maxValue === 0) {
      const denom = (data.length - 1) || 1;
      return data
        .map((_, idx) => {
          const x = xOffset + (idx / denom) * (1000 - xOffset);
          const y = 300;
          return `${x},${y}`;
        })
        .join(' ');
    }

    // Normal case: non-zero max and at least two points
    const denom = (data.length - 1) || 1;
    return data
      .map((item, idx) => {
        const x = xOffset + (idx / denom) * (1000 - xOffset);
        const y = 300 - (item.value / maxValue) * 250;
        return `${x},${y}`;
      })
      .join(' ');
  }

  /**
   * Returns the Y coordinate (in pixels) of the “zero” line in the chart.
   * If maxValue is zero, places the line at the bottom (y=300).
   */
  getZeroLineY(data: ChartData[]): number {
    const maxValue = this.getMaxValue(data);
    // Always safe: if maxValue is zero this yields 300.
    return 300 - (0 / (maxValue || 1)) * 250;
  }

  /**
   * Summiert alle Werte einer Datenreihe.
   */
  getTotalValue(data: ChartData[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }




  getAverageRating(data: ChartData[]): number {
    if (data.length === 0) return 0;
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].value > 0) {
        count++;
      }
    }
    return this.getTotalValue(data) / count;
  }


  /**
   * Gibt die Y-Achsen-Ticks für ein Diagramm zurück.
   */
  getYAxisTicks(data: ChartData[]): number[] {
    const max = this.getMaxValue(data);
    if (max === 0) return [0];
    const step = max / 5;
    return Array.from({length: 6}, (_, i) => Math.round(i * step));
  }



  showTooltip(text: string, event: MouseEvent) {
    this.tooltipText = text;
    this.tooltipX = event.clientX;
    this.tooltipY = event.clientY;
    this.tooltipVisible = true;
  }
  hideTooltip() {
    this.tooltipVisible = false;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }

//---------------------------------------------------------------------------------------------------------------

  startseite() {
    this.router.navigate(['/home']);

  }

  profile() {
    this.router.navigate(['/profile']);

  }

  fahrtangebote() {
    this.router.navigate(['/fahrtangebote']);
  }

  driverdashboard() {
    this.router.navigate(['/driverdashboard']);
  }


  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/welcome']);
    this.WebSocketService.disconnect();
  }

}
