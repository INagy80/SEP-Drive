export interface ChartData {
  label: string;
  value: number;
  date: string;
}

export interface StatisticsData {
  earnings: ChartData[];
  distance: ChartData[];
  drivingTime: ChartData[];
  averageRating: ChartData[];
}

export interface StatisticsRequest {
  driverUsername: string;
  viewMode: 'daily' | 'monthly';
  year: number;
  month?: number; // Only required for daily view
}

export interface StatisticsResponse {
  success: boolean;
  data: StatisticsData;
  message?: string;
}
