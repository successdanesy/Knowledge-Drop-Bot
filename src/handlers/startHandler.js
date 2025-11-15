import { getOrCreateUser, getUserStats } from "../services/userService.js";
import { formatUserStats } from "../utils/formatters.js";

export async function startHandler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    await getOrCreateUser(msg.from.id, msg.from);

    const welcomeMessage = `
🌍 *Welcome to Knowledge Drop Bot!*

I'll share fascinating facts from around the world. Choose a theme or try random:

📚 *What would you like to explore?*
    `;

    await bot.sendMessage(chatId, welcomeMessage.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🌎 Countries", callback_data: "theme:countries" },
            { text: "🌿 Nature", callback_data: "theme:nature" },
          ],
          [
            { text: "🏺 History", callback_data: "theme:history" },
            { text: "🌍 Africa Focus", callback_data: "theme:africa_focus" },
          ],
          [
            { text: "🔍 Origins", callback_data: "theme:origins" },
            { text: "🎲 Random Mix", callback_data: "theme:random_mix" },
          ],
          [{ text: "⭐ My Saved Facts", callback_data: "action:view_saved" }],
        ],
      },
    });

    console.log(`👋 Start handler called for user ${msg.from.id}`);
  } catch (error) {
    console.error("Error in startHandler:", error.message);
  }
}

export async function statsHandler(bot, msg) {
  try {
    const chatId = msg.chat.id;

    const stats = await getUserStats(msg.from.id);
    const statsMessage = formatUserStats(stats);

    await bot.sendMessage(chatId, statsMessage, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "🏠 Home", callback_data: "action:home" }]],
      },
    });

    console.log(`📊 Stats shown for user ${msg.from.id}`);
  } catch (error) {
    console.error("Error in statsHandler:", error.message);
  }
}