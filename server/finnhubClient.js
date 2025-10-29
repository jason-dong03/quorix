import finnhub from "finnhub";

const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);

export default finnhubClient;
