import React, { useEffect, useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, Brain, Target, Eye, Bell, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/NavBar';

import "./css/Portfolio.css";
import "./css/Dashboard.css";
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from './context/PortfolioContext';
import { getStockColor } from './utils/stockColor';
import { getNumHoldings, getPortfolioTodayGainPct, getPortfolioTotalReturn, getPortfolioTotalReturnPct, getPortfolioTotalValue } from './data/dashboardCalculationFunctions';
import { PortfolioHoldingList } from './components/PortfolioHoldingList';
import type { WatchlistStock } from './types';
import { usePortfolioActions } from './hooks/usePortfolioActions';
import BuyStockModal from './components/BuyStockModal';
import { PortfolioGraph } from './components/PortfolioGraph';


interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
}
interface PieDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

const PortfolioDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {holdings , positions, availableStocks, riskScore, riskScoreLabel} = usePortfolio();
  const {sellStock, sellAllLots } = usePortfolioActions();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);



  const [timeframe, setTimeframe] = useState<string>('1D');
  const [selectedStock, setSelectedStock] = useState<WatchlistStock | null>(null);
  const [activeTab, setActiveTab] = useState<string>('holdings');
  const [pieHoverIndex, setPieHoverIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleBuyClick = (stock: WatchlistStock) => {
      setSelectedStock(stock);
    };
  
  
    const totalValue = getPortfolioTotalValue(holdings, availableStocks).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
    const totalChangePercent = getPortfolioTodayGainPct(holdings,availableStocks);
    const totalGain = getPortfolioTotalReturn(holdings, availableStocks).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
    const totalGainPct = getPortfolioTotalReturnPct(holdings, availableStocks).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
    
    const numOfHoldings = getNumHoldings(holdings);

    const winningHoldings = positions.reduce<typeof positions>(
        (arr, stock) => {
            if(stock.last_change_pct >0) arr.push(stock);
            return arr;
        },[] );
    const totalValueForPie = positions.reduce(
    (sum, h) => sum + Number(h.shares) * Number(h.last_price),
    0
    );
    const pieData: PieDataPoint[] = positions.map(h => (
        {
        name: h.symbol,
        value: (Number(h.shares) * h.last_price),
        color: getStockColor(h.sector)
    }));

    const topGainers: MarketStock[] = [
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 892.45, change: 8.34, volume: '45.2M' },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 245.67, change: 6.12, volume: '89.1M' },
        { symbol: 'AMD', name: 'Advanced Micro', price: 178.23, change: 5.87, volume: '52.3M' },
    ];

    const trending: MarketStock[] = [
        { symbol: 'MSFT', name: 'Microsoft Corp', price: 425.89, change: 2.45, volume: '28.9M' },
        { symbol: 'AAPL', name: 'Apple Inc', price: 189.34, change: 1.88, volume: '65.4M' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', price: 142.56, change: -1.21, volume: '31.2M' },
    ];

    const topLosers: MarketStock[] = [
        { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.34, change: -4.56, volume: '18.7M' },
        { symbol: 'NFLX', name: 'Netflix Inc', price: 478.12, change: -3.21, volume: '8.9M' },
        { symbol: 'UBER', name: 'Uber Technologies', price: 68.45, change: -2.89, volume: '22.4M' },
    ];

  return (<>
    <BuyStockModal stock={selectedStock} />
    <div className="portfolio-wrapper p-2">
      <NavBar/>

      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="text-white fw-bold mb-2">Investment Hub</h1>
            <p className="text-white-50 mb-0">AI-powered portfolio intelligence</p>
          </div>
          <div className="d-flex gap-3">
            <button className="btn btn-link text-white-50 p-3">
              <Search size={20} />
            </button>
            <button className="btn btn-link text-white-50 p-3">
              <Filter size={20} />
            </button>
            <button className="btn btn-link text-white-50 p-3 position-relative">
              <Bell size={20} />
            </button>
          </div>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="stat-card stat-card-blue">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>Total Value</span>
                <Zap size={24} className="text-primary" />
              </div>
              <h2 className="text-white fw-bold mb-2" style={{ fontSize: '3rem' }}>${totalValue}</h2>
              <p className="text-primary mb-0" style={{ fontSize: '0.875rem' }}>+{totalChangePercent.toFixed(2)}% today</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card stat-card-green">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>Total Gain</span>
                <TrendingUp size={24} className="text-success" />
              </div>
              <h2 className="text-white fw-bold mb-2" style={{ fontSize: '3rem' }}>{Number(totalGain) > 0? "+": "-"}${Math.abs(Number(totalGain))}</h2>
              <p className={`text-success mb-0`} style={{ fontSize: '0.875rem' }}>{Number(totalGainPct)>0? "+" : ""}{totalGainPct}%</p>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="stat-card stat-card-cyan">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>Win Rate</span>
                <Target size={24} className="text-info" />
              </div>
              <h2 className="text-white fw-bold mb-2" style={{ fontSize: '3rem' }}>{(winningHoldings.length/numOfHoldings) *100}%</h2>
              <p className="text-info mb-0" style={{ fontSize: '0.875rem' }}>{winningHoldings.length}/{numOfHoldings} positions up</p>
            </div>
          </div>
          
          <div className="col-md-3">
            <div className="stat-card stat-card-purple">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>AI Score</span>
                <Brain size={24} style={{ color: '#a855f7' }} />
              </div>
              <h2 className="text-white fw-bold mb-2" style={{ fontSize: '3rem' }}>{riskScore}</h2>
              <p className="mb-0" style={{ fontSize: '0.875rem', color: '#a855f7' }}>{riskScoreLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="graph-card mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h2 className="text-white fw-bold mb-3 ps-2">Portfolio Performance</h2>           
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 pe-1">
                <p className="text-white-50 small mb-0 ps-2">
                    Last updated: Market close • 4:00 PM ET
                </p>
                <div className="btn-group w-25" role="group">
                    {["1D", "5D", "1M"].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`btn ${timeframe === tf ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                    >
                        {tf}
                    </button>
                    ))}
                </div>
            </div>
            <PortfolioGraph timeframe={timeframe}/>
        </div>
          {/* Holdings Section */}
        <div>
            <h3 className="text-white fw-bold mb-3">Stocks</h3>

            {/* Search */}
            <div className="position-relative mb-3">
              <Search className="position-absolute text-white-50" size={20} style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Tabs */}
            <div className="d-flex gap-2 p-2 mb-3" style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid rgba(51, 65, 85, 1)' }}>
              <button
                onClick={() => setActiveTab('holdings')}
                className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
                style={activeTab === 'holdings' ? {
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                } : {}}
              >
                Your Holdings ({holdings.length})
              </button>
              <button
                onClick={() => setActiveTab('gainers')}
                className={`tab-btn ${activeTab === 'gainers' ? 'active' : ''}`}
                style={activeTab === 'gainers' ? {
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                } : {}}
              >
                Top Gainers
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
                style={activeTab === 'trending' ? {
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                } : {}}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveTab('losers')}
                className={`tab-btn ${activeTab === 'losers' ? 'active' : ''}`}
                style={activeTab === 'losers' ? {
                  background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                } : {}}
              >
                Top Losers
              </button>
            </div>

            {activeTab === 'holdings' && 
            <PortfolioHoldingList
                onBuyClick={handleBuyClick}
                onSellClick={sellStock}
                onRemovePosition={sellAllLots}
                modalID="#staticBackdrop"/>
             }
            {/* Top Gainers Content */}
            {activeTab === 'gainers' && topGainers.map((stock, idx) => (
              <div key={idx} className="stock-card mb-3" style={{ borderColor: 'rgba(16, 185, 129, 0.5)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center text-white fw-bold rounded"
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        fontSize: '1.125rem'
                      }}
                    >
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-white fw-bold mb-1">{stock.symbol}</h5>
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>{stock.name}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-4">
                    <div className="text-end">
                      <h4 className="text-white fw-bold mb-1">${stock.price}</h4>
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <ArrowUpRight size={16} className="text-success" />
                        <span className="fw-semibold text-success">+{stock.change}%</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Volume</p>
                      <p className="text-white mb-0" style={{ fontSize: '0.875rem' }}>{stock.volume}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Trending Content */}
            {activeTab === 'trending' && trending.map((stock, idx) => (
              <div key={idx} className="stock-card mb-3" style={{ borderColor: 'rgba(245, 158, 11, 0.5)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center text-white fw-bold rounded"
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                        fontSize: '1.125rem'
                      }}
                    >
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-white fw-bold mb-1">{stock.symbol}</h5>
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>{stock.name}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-4">
                    <div className="text-end">
                      <h4 className="text-white fw-bold mb-1">${stock.price}</h4>
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {stock.change >= 0 ? (
                          <ArrowUpRight size={16} className="text-success" />
                        ) : (
                          <ArrowDownRight size={16} className="text-danger" />
                        )}
                        <span className={`fw-semibold ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change}%
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Volume</p>
                      <p className="text-white mb-0" style={{ fontSize: '0.875rem' }}>{stock.volume}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Top Losers Content */}
            {activeTab === 'losers' && topLosers.map((stock, idx) => (
              <div key={idx} className="stock-card mb-3" style={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center text-white fw-bold rounded"
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                        fontSize: '1.125rem'
                      }}
                    >
                      {stock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h5 className="text-white fw-bold mb-1">{stock.symbol}</h5>
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>{stock.name}</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-4">
                    <div className="text-end">
                      <h4 className="text-white fw-bold mb-1">${stock.price}</h4>
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <ArrowDownRight size={16} className="text-danger" />
                        <span className="fw-semibold text-danger">{stock.change}%</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Volume</p>
                      <p className="text-white mb-0" style={{ fontSize: '0.875rem' }}>{stock.volume}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4">
          {/* Allocation Pie Chart */}
          <div className="sidebar-card mb-4">
            <h4 className="text-white fw-bold mb-4">Asset Allocation</h4>
            <div style={{ height: '224px' }} className="mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setPieHoverIndex(index)}
                    onMouseLeave={() => setPieHoverIndex(null)}
                    >
                    {pieData.map((entry, index) => (
                        <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={pieHoverIndex === null || pieHoverIndex === index ? 1 : 0.4}
                        style={{ 
                            filter: pieHoverIndex === index ? 'brightness(1.3)' : 'none',
                            cursor: 'pointer'
                        }}
                        />
                    ))}
                </Pie>
               <Tooltip
                contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #3b82f6',
                    borderRadius: 8,
                    color: '#fff',
                }}
                />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              {positions.map((h, idx) => (
                <div
                    key={idx}
                    className={`asset-item ${pieHoverIndex === idx ? 'active' : ''}`}
                    onMouseEnter={() => setPieHoverIndex(idx)}
                    onMouseLeave={() => setPieHoverIndex(null)}
                    style={{ borderLeft: `4px solid ${getStockColor(h.sector)}` }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle" 
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          backgroundColor: getStockColor(h.sector),
                          boxShadow: pieHoverIndex === idx ? `0 0 16px ${getStockColor(h.sector)}` : 'none',
                          transform: pieHoverIndex === idx ? 'scale(1.2)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}
                      ></div>
                     <span className={`${pieHoverIndex === idx ? 'text-white fw-bold' : 'text-white-50'}`}>
                        {h.symbol}
                    </span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                    <span className={`fw-semibold ${pieHoverIndex === idx ? 'text-white' : 'text-white-50'}`}>
                    {((Number(h.shares) * Number(h.last_price) / totalValueForPie) * 100)
                        .toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                    </span>
                    
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="sidebar-card mb-4" style={{ 
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 27, 75, 0.6))',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
          }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <Brain size={24} className="text-primary" />
              <h4 className="text-white fw-bold mb-0">AI Insights</h4>
            </div>
            
            <div className="mb-3 p-3 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>Portfolio Health</span>
                <span className="text-white fw-bold fs-4">92/100</span>
              </div>
              <div className="progress" style={{ height: '8px', background: 'rgba(51, 65, 85, 1)' }}>
                <div className="progress-bar bg-success" role="progressbar" style={{ width: '92%', boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }}></div>
              </div>
            </div>

            <div className="mb-3 p-3 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
              <p className="text-white-50 mb-2" style={{ fontSize: '0.875rem' }}>Risk Level</p>
              <p className="text-white fw-bold fs-5 mb-1">{riskScoreLabel}</p>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Balanced growth strategy detected</p>
            </div>

            <div className="p-3 rounded" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
              <p className="text-white-50 mb-2" style={{ fontSize: '0.875rem' }}>Next Recommendation</p>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Consider increasing healthcare exposure for better diversification</p>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="sidebar-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Eye size={20} className="text-white-50" />
              <h4 className="text-white fw-bold mb-0">Market Sentiment</h4>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-white-50" style={{ fontSize: '0.875rem' }}>S&P 500</span>
              <span className="text-success fw-semibold">+0.85%</span>
            </div>
            <div className="mb-2 d-flex justify-content-between">
              <span className="text-white-50" style={{ fontSize: '0.875rem' }}>NASDAQ</span>
              <span className="text-success fw-semibold">+1.23%</span>
            </div>
            <div className="mb-4 d-flex justify-content-between">
              <span className="text-white-50" style={{ fontSize: '0.875rem' }}>DOW</span>
              <span className="text-danger fw-semibold">-0.32%</span>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid rgba(51, 65, 85, 1)' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite' }}></div>
                <span className="text-white fw-medium" style={{ fontSize: '0.875rem' }}>Market Open</span>
              </div>
              <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>Trading active • 6h 24m remaining</p>
            </div>
          </div>

          {/* Action Button */}
          <button className="btn w-100 text-white fw-bold py-3 rounded-3" style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.5)',
            border: 'none',
            fontSize: '1rem'
          }}>
            Optimize Portfolio
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  </>);
};

export default PortfolioDashboard;