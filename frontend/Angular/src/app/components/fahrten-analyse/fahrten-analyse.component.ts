import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {Button} from 'primeng/button';
import {HeaderComponent} from '../header/header.component';
import { StatisticsData, ChartData, StatisticsResponse } from '../../models/statistics-data';
import { StatisticsService } from '../../services/statistics/statistics.service';




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
      private statisticsService: StatisticsService

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
    this.isLoading = true;
    this.errorMessage = '';

    const request$ = this.viewMode === 'daily'
        ? this.statisticsService.getDailyStatistics(this.selectedYear, this.selectedMonth)
        : this.statisticsService.getYearlyStatistics(this.selectedYear);

    request$.subscribe({
      next: (response) => {

        console.log('📊 Antwort vom Backend:', response);  // <--- DAS IST WICHTIG

        // Transformiere die Arrays in ChartData[]
        this.statisticsData = {
          earnings: this.mapToChartData(response.income),
          distance: this.mapToChartData(response.distance),
          drivingTime: this.mapToChartData(response.duration),
          averageRating: this.mapToChartData(response.rating)
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Statistikdaten:', error);

        this.errorMessage = 'Statistiken konnten nicht geladen werden.';
        this.isLoading = false;
      }
    });
  }




  //----------------------------------- Mock-Daten------------------------------------------

/**
   private loadStatisticsData(): void {
   if (this.viewMode === 'monthly') {
   this.loadMonthlyData();
   }else {
   this.loadDailyData();
   }
   }

*/

  private loadMonthlyData(): void {
    // Generate mock monthly data for the selected year
    this.statisticsData = {
      earnings: this.generateMonthlyEarningsData(),
      distance: this.generateMonthlyDistanceData(),
      drivingTime: this.generateMonthlyDrivingTimeData(),
      averageRating: this.generateMonthlyRatingData()
    };
  }

  private loadDailyData(): void {
    // Generate mock daily data for the selected month and year
    this.statisticsData = {
      earnings: this.generateDailyEarningsData(),
      distance: this.generateDailyDistanceData(),
      drivingTime: this.generateDailyDrivingTimeData(),
      averageRating: this.generateDailyRatingData()
    };
  }

  // Mock-Daten, durch Zufallszahlen pro Monat/Tag  // werden später beim verbinden entfernt

  private generateMonthlyEarningsData(): ChartData[] {
    const data: ChartData[] = [];
    for (let month = 1; month <= 12; month++) {
      data.push({
        label: this.availableMonths[month - 1].label,
        value: Math.floor(Math.random() * 2000) + 500,
        date: `${this.selectedYear}-${month.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateMonthlyDistanceData(): ChartData[] {
    const data: ChartData[] = [];
    for (let month = 1; month <= 12; month++) {
      data.push({
        label: this.availableMonths[month - 1].label,
        value: Math.floor(Math.random() * 5000) + 1000,
        date: `${this.selectedYear}-${month.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateMonthlyDrivingTimeData(): ChartData[] {
    const data: ChartData[] = [];
    for (let month = 1; month <= 12; month++) {
      data.push({
        label: this.availableMonths[month - 1].label,
        value: Math.floor(Math.random() * 200) + 50,
        date: `${this.selectedYear}-${month.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateMonthlyRatingData(): ChartData[] {
    const data: ChartData[] = [];
    for (let month = 1; month <= 12; month++) {
      data.push({
        label: this.availableMonths[month - 1].label,
        value: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        date: `${this.selectedYear}-${month.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateDailyEarningsData(): ChartData[] {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const data: ChartData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        label: day.toString(),
        value: Math.floor(Math.random() * 200) + 20,
        date: `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateDailyDistanceData(): ChartData[] {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const data: ChartData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        label: day.toString(),
        value: Math.floor(Math.random() * 300) + 50,
        date: `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateDailyDrivingTimeData(): ChartData[] {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const data: ChartData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        label: day.toString(),
        value: Math.floor(Math.random() * 8) + 2,
        date: `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    return data;
  }

  private generateDailyRatingData(): ChartData[] {
    const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    const data: ChartData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      data.push({
        label: day.toString(),
        value: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        date: `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      });
    }
    return data;
  }
  //--------------------------------------Mock Daten ---------------------------

  /**
   * Wandelt ein Array von Zahlen in ChartData[] um.
   * Für daily: label = Tag (1,2,3,...), für yearly: label = Monatsname.
   */
  private mapToChartData(values: number[]): ChartData[] {
    const isDaily = this.viewMode === 'daily';
    const labels = isDaily
        ? Array.from({ length: values.length }, (_, i) => (i + 1).toString())
        : this.availableMonths.map(m => m.label);

    return values.map((val, i) => ({
      label: labels[i],
      value: val,
      date: isDaily
          ? `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`
          : `${this.selectedYear}-${(i + 1).toString().padStart(2, '0')}`
    }));
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
    if (data.length === 0) return '';
    const maxValue = this.getMaxValue(data);
    return data.map((item, index) => {
      const x = xOffset + (index / (data.length - 1)) * (1000 - xOffset);
      const y = 300 - (item.value / maxValue) * 250;
      return `${x},${y}`;
    }).join(' ');
  }

  /**
   * Summiert alle Werte einer Datenreihe.
   */
  getTotalValue(data: ChartData[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }

  /**
   * Berechnet den Durchschnittswert einer Datenreihe.
   */
  getAverageValue(data: ChartData[]): number {
    if (data.length === 0) return 0;
    return this.getTotalValue(data) / data.length;
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

  /**
   * Gibt die Y-Position der X-Achse (bei Wert 0) für das Diagramm zurück.
   */
  getZeroLineY(data: ChartData[]): number {
    const maxValue = this.getMaxValue(data);
    // 300 ist der untere Rand, 250 die Höhe des Diagramms
    return 300 - (0 / maxValue) * 250;
  }

  /**
   * Gibt den aktuellen Benutzernamen aus dem LocalStorage zurück.
   */
  private getCurrentDriverUsername(): string {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return userData.username || userData.driverUsername || '';
    }
    return '';
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
