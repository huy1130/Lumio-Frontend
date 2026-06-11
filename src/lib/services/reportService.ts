import { api } from "@/lib/api";

export interface SalesReportResponse {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    cancelRatio: number;
    estimatedProfit: number;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  metadata: {
    startDate: string | null;
    endDate: string | null;
    generatedAt: string;
  };
}

export const reportService = {
  getSalesReport: (params: {
    range?: string;
    startDate?: string;
    endDate?: string;
    shopId?: number;
  }) => {
    const queryParts: string[] = [];
    if (params.range) queryParts.push(`range=${encodeURIComponent(params.range)}`);
    if (params.startDate) queryParts.push(`startDate=${encodeURIComponent(params.startDate)}`);
    if (params.endDate) queryParts.push(`endDate=${encodeURIComponent(params.endDate)}`);
    if (params.shopId) queryParts.push(`shopId=${params.shopId}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    return api.get<SalesReportResponse>(`/reports/sales${queryString}`);
  },
};
