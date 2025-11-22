import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { getHoldingTrends } from "../../utils/holdingHelper";


interface HoldingTrendsProp{
    mode: boolean; //1 = gain , 0 = loser
}
const HoldingTrends: React.FC<HoldingTrendsProp> =({mode})=>{
    const {positions} = usePortfolio();
    const list = getHoldingTrends(positions, mode);
    
    return (<>
    {list.map((stock, idx) => (
        <div key={idx} className="stock-card mb-3" style={ mode? {borderColor: 'rgba(16, 185, 129, 0.5)'}: {borderColor: 'rgba(239, 68, 68, 0.5)'} }>
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                <div 
                    className="d-flex align-items-center justify-content-center text-white fw-bold rounded"
                    style={mode?{ 
                    width: '56px', 
                    height: '56px', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    fontSize: '1.125rem'
                    }:
                    { 
                    width: '56px', 
                    height: '56px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                    fontSize: '1.125rem'
                    }
                    }
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
                    <h4 className="text-white fw-bold mb-1">${Number(stock.last_price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</h4>
                    <div className="d-flex align-items-center justify-content-end gap-2">
                    {stock.last_change_pct > 0? <ArrowUpRight size={16} className="text-success" />:  <ArrowDownRight size={16} className="text-danger"/> }
                    <span className={`fw-semibold ${stock.last_change_pct > 0? "text-success": "text-danger"}`}>{stock.last_change_pct}%</span>
                    </div>
                </div>
                </div>
            </div>
        </div>
    ))}
    </>);
}

export default HoldingTrends;