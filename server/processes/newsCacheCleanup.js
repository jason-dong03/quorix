import { query } from "../db.js";
import cron from "node-cron";

export function startNewsCleanup() {
    cron.schedule('0 3 * * *', async () => {
    const result = await query('DELETE FROM news_cache WHERE expires_at < NOW()');
    console.log(`🗑️ Cleaned up ${result.rowCount} expired news items`);
    });
}