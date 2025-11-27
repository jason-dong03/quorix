import type { TourStep } from "../types";


export const steps: TourStep[] = [
     {
        id: "ai-news",
        title: "Catered news list",
        content:"This news list section quickly shows news relevant to your portfolio.",
        placement: "bottom",
    },
    {
        id: "portfolio-selector",
        title: "Select your portfolio",
        content:
        "Use this dropdown to switch between your portfolios. Your onboarding portfolio is selected by default.",
        placement: "right",
    },
    {
        id: "benchmark-toggle",
        title: "Compare to major indices",
        content:
        "Quickly benchmark your performance against the S&P 500, Nasdaq, or Dow Jones with a single click.",
        placement: "left",
    },
    {
        id: "portfolio-graph",
        title: "Track your portfolio growth",
        content:"Visually analyze how your portfolio is doing against the market, and view its trends over time.",
        placement: "right",
    },
    {
        id: "portfolio-graph-tabs",
        title: "Check out your portfolio's history",
        content:"Use these tabs to switch between 1 Day, 5 Days, and 1 Month of your portfolio's history.",
        placement: "right",
    },
    {
        id: "performances",
        title: "Track your performance",
        content: "These sections shows how your portfolio is doing today, in total, and by risk (along with analysis).",
        placement: "left",
    },
    {
        id: "holdings-table",
        title: "Your holdings",
        content:
        "This table shows all positions in the selected portfolio, including quantity, cost basis, and profit & loss.",
        placement: "right",
    },
    {
        id: "watchlist-tab",
        title: "Build your watchlist",
        content:
        "Track tickers you're interested in without adding them to your portfolio yet.",
        placement: "right",
    },
    {
        id: "search-tab",
        title: "Get Started Now!",
        content:"Search from an extensive list of stocks to add to your portfolio!",
        placement: "right",
    },
];