import { etMidnightMs } from "../utils/ETHelper";
import { toMs, isRegularSessionET } from "./chartHelpers";

export interface BenchmarkData {
  timestamp: number;
  value: number;
}

export type BenchmarkMap = Record<string, BenchmarkData[]>;


export const processBenchmarkData = (
  rawData: Record<string, any[]>,
  is1D: boolean
): BenchmarkMap => {
  const cleaned: BenchmarkMap = {};
  
  for (const [sym, arr] of Object.entries(rawData)) {
    cleaned[sym] = (arr ?? [])
      .map((p) => ({
        timestamp: toMs(Number(p.timestamp)),
        value: Number(p.value),
      }))
      .filter((p) => !is1D || isRegularSessionET(p.timestamp));
  }
  
  return cleaned;
};

export const createBenchmarkMaps = (
  benchData: BenchmarkMap,
  timeframe: string
): Record<string, Map<number, number>> => {
  const maps: Record<string, Map<number, number>> = {};
  const isIntraday = timeframe === "1D" || timeframe === "5D"; 
  
  for (const [sym, arr] of Object.entries(benchData)) {
    const m = new Map<number, number>();
    
    for (const p of arr ?? []) {
      const key = isIntraday ? p.timestamp : etMidnightMs(p.timestamp);
      m.set(key, p.value);
    }
    
    maps[sym] = m;
  }
  
  return maps;
};

export const mergeBenchmarkData = <T extends { timestamp: number; dayStart?: number }>(
  chartData: T[],
  benchmarkMaps: Record<string, Map<number, number>>,
  timeframe: string
): (T & { SPY?: number; QQQ?: number; DIA?: number })[] => {
  if (!chartData.length) return [];
  
  const isIntraday = timeframe === "1D" || timeframe === "5D"; // Both use timestamp keys
  
  return chartData.map((p) => {
    const key = isIntraday ? p.timestamp : p.dayStart!;
    
    return {
      ...p,
      ...(benchmarkMaps.SPY ? { SPY: benchmarkMaps.SPY.get(key) } : {}),
      ...(benchmarkMaps.QQQ ? { QQQ: benchmarkMaps.QQQ.get(key) } : {}),
      ...(benchmarkMaps.DIA ? { DIA: benchmarkMaps.DIA.get(key) } : {}),
    };
  });
};
export const extendDataToDomain = <T extends { timestamp: number }>(
  data: T[],
  rightEdge: number
): T[] => {
  if (!data.length) return [];
  
  const out = [...data];
  const last = out[out.length - 1];
  
  if (last && last.timestamp < rightEdge) {
    out.push({ ...last, timestamp: rightEdge });
  }
  
  return out;
};