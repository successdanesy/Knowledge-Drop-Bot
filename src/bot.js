import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connection.js";
import { startHandler, statsHandler } from "./handlers/startHandler.js";
import { callbackHandler } from "./handlers/callbackHandler.js";
import { viewSavedHandler } from "./handlers/factHandler.js";
import { leaderboardHandler } from "./handlers/leaderboardHandler.js";
import { startNotificationScheduler } from "./services/notificationScheduler.js";
import { analyticsHandler } from "./handlers/analyticsHandler.js";

dotenv.config();

// Connect to MongoDB
connectDB();

// Create bot (webhook mode)
const bot = new TelegramBot(process.env.BOT_TOKEN);

// Setup webhook
const WEBHOOK_URL = process.env.WEBHOOK_URL || `https://${process.env.FLY_APP_NAME}.fly.dev`;
bot.setWebHook(`${WEBHOOK_URL}/webhook`, {
    drop_pending_updates: true
}).then(() => console.log('✅ Webhook configured'));

// Create Express server
const app = express();
app.use(express.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'alive',
        uptime: Math.floor(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
});

// Start notification scheduler
startNotificationScheduler(bot);

// Command handlers
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/saved/, (msg) => viewSavedHandler(bot, msg));
bot.onText(/\/stats/, (msg) => statsHandler(bot, msg));
bot.onText(/\/leaderboard/, (msg) => leaderboardHandler(bot, msg));
bot.onText(/\/analytics/, (msg) => analyticsHandler(bot, msg));
bot.onText(/\/share/, (msg) => {
    bot.sendMessage(msg.chat.id, '📤 Use the inline share button when viewing facts!');
});

bot.on("callback_query", (query) => callbackHandler(bot, query));

// Error handling
process.on("unhandledRejection", (reason) => {
    if (reason?.message?.includes("query is too old")) return;
    console.error("❌ Error:", reason);
});

console.log("🤖 Knowledge Drop Bot started with webhooks! (Lol, Cheapskate)");