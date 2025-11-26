import { useEffect, useState } from "react";
import { fetchPortfolioHistory } from "../data/cacheData";
import { etMidnightMs } from "../utils/ETHelper";
import { toMs, isRegularSessionET, type ChartData } from "../utils/chartHelpers";
import { usePortfolio } from "../context/PortfolioContext";

interface UsePortfolioDataReturn {
  chartData: ChartData[];
  loading: boolean;
  error: string | null;
}
export const usePortfolioData = (timeframe: string): UsePortfolioDataReturn => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {currentPortfolio} = usePortfolio();

  const portfolioId = currentPortfolio?.id ?? null;

  useEffect(() => {
    
    if (!portfolioId) {
      setChartData([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const history = await fetchPortfolioHistory(timeframe, portfolioId);
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
        
  
        if (!cancelled) {
          setChartData(transformed);
        }
      } catch (e) {
        console.error("Failed to load portfolio history:", e);
        if (!cancelled) {
          setError("Failed to load portfolio data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    load();
    return () => {
      cancelled = true;
    };
  }, [timeframe, portfolioId]); // 👈 watch both

  return { chartData, loading, error };
};