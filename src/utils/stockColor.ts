export function getStockColor(stock_name: string){
    switch(stock_name){
        case "Communication Services":
            return "#7B61FF";
        case "Consumer Discretionary":
            return "#FF7F50";
        case "Consumer Staples":
            return "#FFC107";
        case "Energy":
            return "#E74C3C";
        case "Financials":
            return "#00C1D4";
        case "Healthcare":
            return "#2ECC71";
        case "Industrials":
            return "#F39C12";
        case "Information Technology":
            return "#1E88E5";
        case "Materials":
            return "#8E44AD";
        case "Real Estate":
            return "#B565A7";
        case "Utilities":
            return "#95A5A6";
        default:
            return "#6c757d"; 
    }
}
