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
        const is5D = timeframe === "5D";
        const isIntraday = is1D || is5D;
        
        const transformed: ChartData[] = history
          .map((item: any) => {
            const ts = toMs(Number(item.timestamp) || Date.parse(item.date));
            return {
              timestamp: ts,
              ...(isIntraday ? {} : { dayStart: etMidnightMs(ts) }), 
              date: item.date || new Date(ts).toISOString(),
              value: Number(item.value),
            };
          })
          .filter((p) => (is1D ? isRegularSessionET(p.timestamp) : true));
        
       /* console.log(`\n========== ${timeframe} FRONTEND ==========`);
        console.log(`📊 Received ${history.length} raw points`);
        console.log(`📊 Transformed to ${transformed.length} chart points`);
        console.log(`📊 isIntraday: ${isIntraday}`);
        if (transformed.length > 0) {
          console.log(`   First:`, transformed[0]);
          console.log(`   Last:`, transformed[transformed.length - 1]);
          const timestamps = transformed.map(p => p.timestamp);
          const uniqueTimestamps = new Set(timestamps);
          if (timestamps.length !== uniqueTimestamps.size) {
            console.log(`⚠️  WARNING: ${timestamps.length - uniqueTimestamps.size} duplicate timestamps!`);
          }
        }
        console.log(`========================================\n`);*/
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