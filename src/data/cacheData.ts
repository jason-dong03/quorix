import type { ChartData } from "../types";


export interface PortfolioHistoryResponse {
  history: ChartData[];
}

export const fetchPortfolioHistory = async (
  timeframe: string
): Promise<ChartData[]> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const response = await fetch(
      `${API_URL}/api/portfolio-history?timeframe=${timeframe}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PortfolioHistoryResponse = await response.json();
    return data.history || [];
    
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    throw error;
  }
};
