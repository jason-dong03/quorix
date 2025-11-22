import type { Position } from "../types";


export function getHoldingTrends(holding: Position[], is_gainer: boolean){
    const res = holding.sort((a,b) =>{
        return is_gainer? b.last_change_pct - a.last_change_pct : a.last_change_pct - b.last_change_pct;
    });
    return res.slice(0, 3);
}
