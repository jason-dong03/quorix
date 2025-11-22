import { useEffect, useState } from "react";

interface UseBenchmarkTogglesReturn {
  showSPY: boolean;
  showQQQ: boolean;
  showDIA: boolean;
  toggleSPY: () => void;
  toggleQQQ: () => void;
  toggleDIA: () => void;
  activeSymbols: string[];
}


export const useBenchmarkToggles = (): UseBenchmarkTogglesReturn => {
  const [showSPY, setShowSPY] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("cmp_spy") ?? "false")
  );
  const [showQQQ, setShowQQQ] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("cmp_qqq") ?? "false")
  );
  const [showDIA, setShowDIA] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("cmp_dia") ?? "false")
  );

  useEffect(() => {
    localStorage.setItem("cmp_spy", JSON.stringify(showSPY));
  }, [showSPY]);

  useEffect(() => {
    localStorage.setItem("cmp_qqq", JSON.stringify(showQQQ));
  }, [showQQQ]);

  useEffect(() => {
    localStorage.setItem("cmp_dia", JSON.stringify(showDIA));
  }, [showDIA]);


  const activeSymbols = [
    showSPY ? "SPY" : null,
    showQQQ ? "QQQ" : null,
    showDIA ? "DIA" : null,
  ].filter(Boolean) as string[];

  return {
    showSPY,
    showQQQ,
    showDIA,
    toggleSPY: () => setShowSPY((v) => !v),
    toggleQQQ: () => setShowQQQ((v) => !v),
    toggleDIA: () => setShowDIA((v) => !v),
    activeSymbols,
  };
};