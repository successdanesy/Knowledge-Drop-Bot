import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { connectDB } from "./database/connection.js";
import { startHandler, statsHandler } from "./handlers/startHandler.js";
import { callbackHandler } from "./handlers/callbackHandler.js";
import { viewSavedHandler } from "./handlers/factHandler.js";
import { leaderboardHandler } from "./handlers/leaderboardHandler.js";
import { startNotificationScheduler } from "./services/notificationScheduler.js";

dotenv.config();

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
// COMMAND HANDLERS
// ============================================
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.onText(/\/saved/, (msg) => viewSavedHandler(bot, msg));
bot.onText(/\/stats/, (msg) => statsHandler(bot, msg));
bot.onText(/\/leaderboard/, (msg) => leaderboardHandler(bot, msg));

bot.on("callback_query", (query) => callbackHandler(bot, query));

// ============================================
// BOT STARTUP LOGS
// ============================================
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  process.exit(0);
});

console.log("🤖 Knowledge Drop Bot started successfully!");
console.log("✨ Bot is ready to receive messages...\n");