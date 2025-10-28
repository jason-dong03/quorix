export interface NewsItem {
  category: string;
  time: string;
  title: string;
  desc: string;
  source: string;
  color: string;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export const newsData: NewsItem[] = [
  {
    category: "Technology",
    time: "2h ago",
    title: "Tech Giants Report Strong Q3 Earnings Amid AI Boom",
    desc: "Major technology companies exceed analyst expectations...",
    source: "Financial Times",
    color: "bg-blue-100 text-blue-700",
  },
  {
    category: "Healthcare",
    time: "4h ago",
    title: "Healthcare Sector Sees Innovation Surge in...",
    desc: "Pharmaceutical companies announce breakthrough...",
    source: "Reuters",
    color: "bg-blue-100 text-blue-700",
  },
  {
    category: "Financial",
    time: "5h ago",
    title: "Financial Services Adapt to Digital Banking Trends",
    desc: "Major banks invest heavily in digital infrastructure to meet...",
    source: "Bloomberg",
    color: "bg-blue-100 text-blue-700",
  },
  {
    category: "Consumer Goods",
    time: "6h ago",
    title: "Consumer Goods Companies Navigate...",
    desc: "Leading consumer brands report improved margins as...",
    source: "Wall Street Journal",
    color: "bg-blue-100 text-blue-700",
  },
];

export const chartData: ChartPoint[] = [
  { date: "Jan", value: 27500 },
  { date: "Feb", value: 29200 },
  { date: "Mar", value: 28800 },
  { date: "Apr", value: 30100 },
  { date: "May", value: 31500 },
  { date: "Jun", value: 33200 },
  { date: "Jul", value: 32800 },
  { date: "Aug", value: 34500 },
  { date: "Sep", value: 33900 },
  { date: "Oct", value: 36200 },
  { date: "Nov", value: 38100 },
  { date: "Dec", value: 42605.8 },
];
