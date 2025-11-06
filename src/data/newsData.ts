import { useEffect, useState } from "react";
import type { NewsItem } from "../types";
const API_URL = ""; 
export function useFetchAiNews(symbols: string[]) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const symbolsParam = symbols.join(',');
  useEffect(() => {
    if (!symbols || symbols.length === 0) {
      console.log('⏭️ Skipping news fetch - no symbols');
      setNews([]);
      return;
    }
    fetch(`${API_URL}/api/ai-news/?symbols=${symbolsParam}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setNews(data.news ? data.news : []);
      })
      .catch(() => {
        setNews([]);
      });
  },[symbols.join(',')]);
  return {news};
}