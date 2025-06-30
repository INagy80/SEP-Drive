import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {WebsocketService} from '../../services/websocket.service';
import {Button} from 'primeng/button';
import {HeaderComponent} from '../header/header.component';

interface ChartData {
  label: string;
  value: number;
  date: string;
}

interface StatisticsData {
  earnings: ChartData[];
  distance: ChartData[];
  drivingTime: ChartData[];
  averageRating: ChartData[];
}

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

  constructor(
    private router: Router,
    private WebSocketService : WebsocketService,

  ) {
    this.generateAvailableYears();

  }

  ngOnInit(): void {
    this.loadStatisticsData();
  }
  private generateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear; year++) {
      this.availableYears.push(year);
    }
  }

  private loadStatisticsData(): void {
    // Mock data - in real implementation, this would come from a service
    if (this.viewMode === 'monthly') {
      this.loadMonthlyData();
    } else {
      this.loadDailyData();
    }
  }

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

  onViewModeChange(): void {
    this.loadStatisticsData();
  }

  onYearChange(): void {
    this.loadStatisticsData();
  }

  onMonthChange(): void {
    this.loadStatisticsData();
  }

  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(item => item.value));
  }

  getLineChartPoints(data: ChartData[]): string {
    if (data.length === 0) return '';

    const maxValue = this.getMaxValue(data);
    return data.map((item, index) => {
      const x = (index / (data.length - 1)) * 1000;
      const y = 300 - (item.value / maxValue) * 250;
      return `${x},${y}`;
    }).join(' ');
  }

  getTotalValue(data: ChartData[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }

  getAverageValue(data: ChartData[]): number {
    if (data.length === 0) return 0;
    return this.getTotalValue(data) / data.length;
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
