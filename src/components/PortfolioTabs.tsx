import { usePortfolio }
from "../context/PortfolioContext.tsx";
import type { HoldingsTab } from "../types.ts"; 
  
interface PortfolioTabsProps { 
    holdingsTab: string; setHoldingsTab: React.Dispatch<React.SetStateAction<HoldingsTab>>; 
    searchQuery: string; setSearchQuery: React.Dispatch<React.SetStateAction<string>>; 
    filteredStocks: any[];
  } 
export const PortfolioTabs: React.FC<PortfolioTabsProps> = 
({ holdingsTab,
  setHoldingsTab,
  searchQuery, 
  setSearchQuery, filteredStocks }) => { 
    const { holdings, watchlist } = usePortfolio(); 
    const handleTabChange = (tab: "holdings" | "watchlist" | "addstock") => { 
        setHoldingsTab(tab); 
        if (tab !== "addstock"){ 
          setSearchQuery("");       
        } 
  }; return ( <>
   <ul className="nav nav-pills mb-4 gap-2"> 
    <li className="nav-item">
       <button onClick={() => setHoldingsTab("holdings")} 
        className={`nav-link ${holdingsTab === "holdings" ? "active" : ""}`} > 
        Holdings ({holdings.length}) 
       </button>
    </li> 
    <li className="nav-item"> 
      <button onClick={() => setHoldingsTab("watchlist")} 
        className={`nav-link ${holdingsTab === "watchlist" ? "active" : "" }`} > 
        Watchlist ({watchlist.length}) 
      </button> </li> 
    <li className="nav-item"> 
      <button onClick={() => handleTabChange("addstock")} 
      className={`nav-link ${holdingsTab === "addstock" ? "active" : ""}`} >
         Search </button> </li> 
    </ul> 
    {holdingsTab === "addstock" && 
    ( <div className="mb-4"> 
      <input type="text" 
      className="form-control search-input" 
      placeholder="Search stocks by symbol or name..." 
      value={searchQuery} 
      onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
       <small className="text-muted mt-2 d-block"> 
        {filteredStocks.length} stock{filteredStocks.length !== 1 ? "s" : ""} found </small> </div> 
      )}
     </> ); 
  };