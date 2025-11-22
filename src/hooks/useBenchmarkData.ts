import { useEffect, useState } from "react";
import { fetchBenchmarkData } from "../data/cacheData";
import { processBenchmarkData, type BenchmarkMap } from "../utils/benchmarkHelpers";

interface UseBenchmarkDataReturn {
  benchmarkData: BenchmarkMap;
}
export const useBenchmarkData = (
  timeframe: string,
  activeSymbols: string[]
): UseBenchmarkDataReturn => {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkMap>({});

  useEffect(() => {
    if (!activeSymbols.length) {
      setBenchmarkData({});
      return;
    }

    const load = async () => {
      try {
        const res = await fetchBenchmarkData(timeframe, activeSymbols.join(","));
        const is1D = timeframe === "1D";
        const cleaned = processBenchmarkData(res, is1D);
        setBenchmarkData(cleaned);
      } catch (e) {
        console.error("Failed to load benchmark data:", e);
        setBenchmarkData({});
      }
    };

    load();
  }, [timeframe, activeSymbols.join(",")]);

  return { benchmarkData };
};