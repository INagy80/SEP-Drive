export interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

export interface StatisticsData {
  earnings: ChartDataPoint[];
  distance: ChartDataPoint[];
  drivingTime: ChartDataPoint[];
  averageRating: ChartDataPoint[];
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
