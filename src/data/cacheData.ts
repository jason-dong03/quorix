import type { ChartData } from "../types";


interface PortfolioHistoryResponse {
  history: ChartData[];
}

interface BenchmarkResponse{
  series: Record<string, Array<{timestamp:number; value:number}>>;
  mode: string;
}
export const fetchPortfolioHistory = async (
  timeframe: string
): Promise<ChartData[]> => {
  try {
    const response = await fetch(
      `api/portfolio-history?timeframe=${timeframe}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    //returns {timestamp: ... , date: ... , value: ...}
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


export const fetchBenchmarkData = async(timeframe:string, symbols: string) =>{

  try{
    const response = await fetch(
      `api/benchmarks?timeframe=${timeframe}&symbols=${symbols}&mode=percent`,{
        method: 'GET',
        credentials: 'include',
      } );
    const data: BenchmarkResponse = await response.json();
    return data.series || {};
  }catch(error){
    console.error('Error fetching portfolio history:', error);
    throw error;
  }
}