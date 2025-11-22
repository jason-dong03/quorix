import { etMidnightMs } from "../utils/ETHelper";

export interface ChartData {
  timestamp: number;
  dayStart?: number;
  date: string;
  value: number;
  SPY?: number;
  QQQ?: number;
  DIA?: number;
}

export const toMs = (t: number): number => (t > 1e12 ? t : t * 1000);

export const isRegularSessionET = (ts: number): boolean => {
  const d = new Date(ts);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hh = Number(parts.find((p) => p.type === "hour")!.value);
  const mm = Number(parts.find((p) => p.type === "minute")!.value);
  const minutes = hh * 60 + mm;
  return minutes >= 570 && minutes <= 960; // 09:30 (570) to 16:00 (960)
};

export const etAtSameDay = (baseTs: number, hh: number, mm: number): number => {
  const day0 = etMidnightMs(baseTs);
  return day0 + (hh * 60 + mm) * 60_000;
};

export const calculateYDomain = (chartData: ChartData[]): [number, number] => {
  if (!chartData.length) return [0, 0];
  
  let min = Infinity;
  let max = -Infinity;
  
  for (const d of chartData) {
    const v = Number(d.value) || 0;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  
  if (!isFinite(min) || !isFinite(max) || min === max) {
    return [min || 0, (max || 0) + 1];
  }
  
  const pad = (max - min) * 0.06;
  return [min - pad, max + pad];
};

export const calculateIntradayDomain = (
  chartData: ChartData[]
): [number, number] | undefined => {
  if (!chartData.length) return undefined;
  
  const base = chartData[0].timestamp;
  const start = etAtSameDay(base, 9, 30);
  const end16 = etAtSameDay(base, 16, 0);
  const now = Date.now();
  const right = Math.max(start, Math.min(now, end16));
  
  return [start, right];
};

export const calculateMultiDayDomain = (
  chartData: ChartData[],
  timeframe: string
): [number, number] | undefined => {
  const is5D = timeframe === "5D";
  const is1M = timeframe === "1M";
  
  if (!(is5D || is1M) || !chartData.length) return undefined;

  const now = Date.now();
  const sorted = [...chartData].sort((a, b) => a.timestamp - b.timestamp);
  const first = sorted[0].timestamp;
  const last = sorted[sorted.length - 1].timestamp;

  if (is5D) {
    const todayEnd = etAtSameDay(now, 16, 0);
    const right = Math.min(now, todayEnd);
    return [first, Math.max(last, right)];
  }
  const isToday = etMidnightMs(last) === etMidnightMs(now);
  const todayEnd = etAtSameDay(now, 16, 0);
  const right = isToday ? Math.min(now, todayEnd) : last;

  return [first, right];
};

export const calculateRangeDomain = (
  chartData: ChartData[],
  timeframe: string,
  xKey: string
): [number, number] | undefined => {
  const is5D = timeframe === "5D";
  const is1M = timeframe === "1M";
  
  if (!(is5D || is1M) || !chartData.length) return undefined;

  const now = Date.now();
  const sorted = [...chartData].sort((a, b) => a.timestamp - b.timestamp);
  const firstDataPoint = sorted[0];
  const lastDataPoint = sorted[sorted.length - 1];
  
  if (xKey === "timestamp") {

    const left = firstDataPoint.timestamp;
    const todayEnd = etAtSameDay(now, 16, 0);
    
    const right = Math.max(lastDataPoint.timestamp, Math.min(now, todayEnd));
    
    return [left, right];
  } else {
    const left = firstDataPoint.dayStart || etMidnightMs(firstDataPoint.timestamp);

    const right = Math.max(
      lastDataPoint.dayStart || etMidnightMs(lastDataPoint.timestamp),
      etMidnightMs(now)
    );
    
    return [left, right];
  }
};