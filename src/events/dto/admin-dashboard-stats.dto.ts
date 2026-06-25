export class AdminDashboardStatsDto {
  servicios!: {
    name: string;
    status: string;
    latency: string;
    color: string;
  }[];
  logs!: {
    id: string;
    timestamp: string;
    type: 'SUCCESS' | 'INFO' | 'WARN' | 'CRITICAL';
    message: string;
  }[];
}
