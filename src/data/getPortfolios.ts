import { useEffect, useState } from "react";
import type { Portfolio } from "../types";



export function useFetchAllPortfolios () {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => {
    fetch(`/api/me/portfolios`, {
        method: "GET",
        credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => {
        setPortfolios(data.portfolios ? data.portfolios : []);
        })
        .catch(() => {
        setPortfolios([]);
        });
    }, [refreshKey]);
    const refetch = () => setRefreshKey((prev) => prev + 1);
    return {portfolios, refetch};
}
export async function createPortfolio(name: string, description: string) {
  const response = await fetch("/api/portfolios", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to create portfolio: ${errorMessage}`);
  }

  const data = await response.json();
  return data.success;
}
export async function updatePortfolio(portfolioId: number,name: string,description: string) {
  const response = await fetch(`/api/portfolios/${portfolioId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to update portfolio: ${errorMessage}`);
  }

  const data = await response.json();
  return data.portfolio;
}
export async function deletePortfolio(portfolioId: number) {
  const response = await fetch(`/api/portfolios/${portfolioId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to delete portfolio: ${errorMessage}`);
  }

  const data = await response.json();
  return data.success ?? true; // backend usually returns { success: true }
}
export async function setDefaultPortfolio(portfolioId: number) {
  const response = await fetch(
    `/api/portfolios/${portfolioId}/set-default`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Failed to set default portfolio: ${errorMessage}`);
  }

  const data = await response.json();
  return data.success ?? true;
}

