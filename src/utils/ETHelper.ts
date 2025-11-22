

function getEtParts(ms: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).formatToParts(ms);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  // map.timeZoneName like "GMT-4" or "GMT-5"
  const offMin = -60 * Number(map.timeZoneName.replace("GMT", "")); // e.g., -240 or -300
  return {
    y: Number(map.year), m: Number(map.month), d: Number(map.day),
    H: Number(map.hour), M: Number(map.minute),
    offsetMinutes: offMin,
  };
}

export function etAt(baseMs: number, hh: number, mm: number) {
  const { y, m, d, offsetMinutes } = getEtParts(baseMs);
  const utc = Date.UTC(y, m - 1, d, hh, mm, 0);
  return utc - offsetMinutes * 60_000;
}
export function formatEtDate(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  }).format(ms);
}

export function formatEtTime(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }).format(ms);
}
// ETHelper.ts
export function getEtOffsetMinutes(ms: number) {
  // e.g., "GMT-5" (standard) or "GMT-4" (DST)
  const tz = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(ms).find(p => p.type === "timeZoneName")?.value ?? "GMT-5";

  const hours = Number(tz.replace("GMT", "")); // -> -5 or -4
  return hours * 60;                            // -> -300 or -240
}

export function etMidnightMs(ms: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ms);

  const y = Number(parts.find(p => p.type === "year")!.value);
  const m = Number(parts.find(p => p.type === "month")!.value);
  const d = Number(parts.find(p => p.type === "day")!.value);

  const offsetMin = getEtOffsetMinutes(ms);     // -300 or -240
  const utcMidnight = Date.UTC(y, m - 1, d, 0, 0, 0);
  // IMPORTANT: subtracting a negative adds hours -> ET midnight in epoch ms
  return utcMidnight - offsetMin * 60_000;
}


export function addEtMonths(ms: number, delta: number) {
  const { year, month, day } = (() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(ms);
    return {
      year: Number(parts.find(p => p.type === "year")!.value),
      month: Number(parts.find(p => p.type === "month")!.value),
      day: Number(parts.find(p => p.type === "day")!.value),
    };
  })();
  const d = new Date(Date.UTC(year, month - 1 + delta, day)); // UTC temp
  return d.getTime(); // ms UTC; we’ll convert with etMidnightMs where needed
}

export function buildDailyTicksEt([lo, hi]: [number, number]) {
  // expects lo/hi both to be **ET-midnight based** (i.e., dayStart values)
  const ticks: number[] = [];
  let cur = etMidnightMs(lo);
  const end = etMidnightMs(hi);
  while (cur <= end) {
    ticks.push(cur);
    cur += 24 * 60 * 60 * 1000;
  }
  return ticks;
}
