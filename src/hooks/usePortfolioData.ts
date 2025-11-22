import { useEffect, useState } from "react";
import { fetchPortfolioHistory } from "../data/cacheData";
import { etMidnightMs } from "../utils/ETHelper";
import { toMs, isRegularSessionET, type ChartData } from "../utils/chartHelpers";

interface UsePortfolioDataReturn {
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
}


export const usePortfolioData = (timeframe: string): UsePortfolioDataReturn => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const history = await fetchPortfolioHistory(timeframe);
        const is1D = timeframe === "1D";
        
        const transformed: ChartData[] = history
          .map((item: any) => {
            const ts = toMs(Number(item.timestamp) || Date.parse(item.date));
            return {
              timestamp: ts,
              dayStart: etMidnightMs(ts),
              date: item.date,
              value: Number(item.value),
            };
          })
          .filter((p) => (is1D ? isRegularSessionET(p.timestamp) : true));
        
        setChartData(transformed);
      } catch (e) {
        console.error("Failed to load portfolio history:", e);
        setError("Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [timeframe]);

  return { chartData, loading, error };
};