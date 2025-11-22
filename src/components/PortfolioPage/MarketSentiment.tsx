import { Eye } from "lucide-react";
import { useFetchMarketSentiment } from "../../data/stockData";
import { getTimeUntil400PM, getTimeUntil930AM, isMarketOpen } from "../../utils/marketHelpers";


const MarketSentiment: React.FC = () =>{
    const { sentiment } = useFetchMarketSentiment();
    const marketOpen = isMarketOpen();
    const timeLeft = getTimeUntil930AM();
    const timeLeftUntilMarketClose = getTimeUntil400PM();
    return (<>
        <div className="sidebar-card mb-4">
            <div className="d-flex align-items-center gap-2 mb-3">
                <Eye size={20} className="text-white-50" />
                <h4 className="text-white fw-bold mb-0">Market Sentiment</h4>
            </div>
            
            <div className="mb-2 d-flex justify-content-between">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>S&P 500</span>
                <span className={`${sentiment?.sp500 && sentiment?.sp500?.last_change_pct>0? "text-success": "text-danger"} fw-semibold`}>{sentiment?.sp500?.last_change_pct}%</span>
            </div>
            <div className="mb-2 d-flex justify-content-between">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>NASDAQ</span>
                <span className={`${sentiment?.nasdaq && sentiment?.nasdaq?.last_change_pct>0? "text-success": "text-danger"} fw-semibold`}>{sentiment?.nasdaq?.last_change_pct}%</span>
            </div>
            <div className="mb-4 d-flex justify-content-between">
                <span className="text-white-50" style={{ fontSize: '0.875rem' }}>DOW</span>
                <span className={`${sentiment?.dow && sentiment?.dow?.last_change_pct>0? "text-success": "text-danger"} fw-semibold`}>{sentiment?.dow?.last_change_pct}%</span>
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid rgba(51, 65, 85, 1)' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                <div className={`${marketOpen?"market-open":"bg-danger"} rounded-circle`} style={{ width: '8px', height: '8px', animation: 'pulse 3s infinite' }}></div>
                <span className="text-white fw-medium" style={{ fontSize: '0.875rem' }}>Market {marketOpen? "Open": "Closed"}</span>
                </div>
                <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem' }}>{marketOpen? 
                `Trading active • ${timeLeftUntilMarketClose.hours}h ${timeLeftUntilMarketClose.minutes}m remaining` 
                : `Trading Paused • ${timeLeft.hours}h ${timeLeft.minutes}m until market opens`}</p>
            </div>
        </div>
    </>
    );
}

export default MarketSentiment;