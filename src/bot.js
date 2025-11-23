import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { connectDB } from "./database/connection.js";
import { startHandler, statsHandler } from "./handlers/startHandler.js";
import { callbackHandler } from "./handlers/callbackHandler.js";
import { viewSavedHandler } from "./handlers/factHandler.js";
import { leaderboardHandler } from "./handlers/leaderboardHandler.js";
import { startNotificationScheduler } from "./services/notificationScheduler.js";
// import { shareFactAsCard } from "./handlers/shareCardHandler.js";
import { analyticsHandler } from "./handlers/analyticsHandler.js";

dotenv.config();

import http from "http";

// ============================================
// HEALTH CHECK SERVER (for Fly.io)
// ============================================
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive! 🤖');
  } else {
    const stats = {
      status: 'running',
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      timestamp: new Date().toISOString()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats, null, 2));
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Connect to MongoDB Atlas
connectDB();
// Start the notification scheduler
startNotificationScheduler(bot);

// ============================================
// ERROR HANDLING - Suppress timeout errors
// ============================================
bot.on("polling_error", (error) => {
  // Ignore timeout errors
  if (error.code === "ETELEGRAM" && error.message.includes("query is too old")) {
    return; // Silently ignore
  }
  console.error("❌ Polling error:", error.message);
});

process.on("unhandledRejection", (reason, promise) => {
  // Ignore Telegram query timeout errors
  if (
    reason?.message?.includes("query is too old") ||
    reason?.message?.includes("query ID is invalid")
  ) {
    return; // Silently ignore
  }
  console.error("❌ Unhandled Rejection:", reason);
});

// ============================================
// HEALTHCHECK - Keep service alive
// ============================================
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`💚 Bot alive - Memory: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
}, 5 * 60 * 1000); // Every 5 minutes

// ============================================
// COMMAND HANDLERS
// ============================================
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/saved/, (msg) => viewSavedHandler(bot, msg));
bot.onText(/\/stats/, (msg) => statsHandler(bot, msg));
bot.onText(/\/leaderboard/, (msg) => leaderboardHandler(bot, msg));
// bot.onText(/\/share/, (msg) => shareFactAsCard(bot, msg.chat.id, msg.from.id));
bot.onText(/\/analytics/, (msg) => analyticsHandler(bot, msg));
bot.onText(/\/admin/, (msg) => analyticsHandler(bot, msg));

bot.on("callback_query", (query) => callbackHandler(bot, query));

// ============================================
// BOT STARTUP LOGS
// ============================================
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down gracefully...");
  bot.stopPolling();
  process.exit(0);
});

console.log("🤖 Knowledge Drop Bot started successfully!");
console.log("✨ Bot is ready to receive messages...\n");