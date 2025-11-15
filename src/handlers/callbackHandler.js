import {
  getOrCreateUser,
  incrementFactsViewed,
  saveFact,
} from "../services/userService.js";
import { getRandomFactFromTheme } from "../services/factService.js";
import { formatFactMessage } from "../utils/formatters.js";
import { updateStreakOnce } from "../services/streakService.js";
import { handleNotificationPreferences, handleNotificationTime } from "./notificationHandler.js";
import { handleLeaderboardRequest } from "./leaderboardHandler.js";
import {
  quizMenuHandler,
  handleQuizThemeSelection,
  startQuiz,
  handleQuizAnswer,
  showQuizStats,
} from "./quizHandler.js";

export async function callbackHandler(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const action = query.data;

  try {
    await getOrCreateUser(userId, query.from);

    if (action.startsWith("theme:")) {
      const themeId = action.split(":")[1];
      await handleThemeSelection(bot, chatId, userId, themeId, query.id);
    } else if (action.startsWith("action:")) {
      const actionType = action.split(":")[1];
      if (actionType === "view_saved") {
        await handleViewSaved(bot, chatId, userId);
      } else if (actionType === "home") {
        const { startHandler } = await import("./startHandler.js");
        await startHandler(bot, { chat: { id: chatId }, from: query.from });
      } else if (actionType === "stats") {
        const { statsHandler } = await import("./startHandler.js");
        await statsHandler(bot, { chat: { id: chatId }, from: query.from });
      } else if (actionType === "leaderboard") {
        await handleLeaderboardRequest(bot, chatId, userId, "facts", "all_time");
      } else if (actionType === "notif_prefs") {
        await handleNotificationPreferences(bot, chatId, userId);
      }
    } else if (action.startsWith("leaderboard:")) {
      const [, metric, period] = action.split(":");
      await handleLeaderboardRequest(bot, chatId, userId, metric, period);
    } else if (action.startsWith("notif:")) {
      const time = action.split(":")[1] + ":" + action.split(":")[2];
      await handleNotificationTime(bot, chatId, userId, time);
    } else if (action.startsWith("save:")) {
      const [, themeId, factHash] = action.split(":");
      await handleSaveFact(bot, chatId, userId, themeId, factHash, query.id);
    }

    await bot
      .answerCallbackQuery(query.id, { text: "", show_alert: false })
      .catch(() => {});
  } catch (error) {
    console.error("Error in callbackHandler:", error.message);
    bot.answerCallbackQuery(query.id, { text: "❌ Error", show_alert: true }).catch(() => {});
  }
}

async function handleThemeSelection(bot, chatId, userId, themeId, queryId) {
  try {
    await updateStreakOnce(userId);
    await incrementFactsViewed(userId);

    const fact = getRandomFactFromTheme(themeId);

    if (!fact) {
      bot.sendMessage(chatId, "❌ No facts available for this theme!");
      return;
    }

    const message = formatFactMessage(fact);
    const factHash = Buffer.from(fact.drop).toString("base64").slice(0, 20);

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔁 Next Fact", callback_data: `theme:${themeId}` },
            { text: "💾 Save", callback_data: `save:${themeId}:${factHash}` },
          ],
          [
            { text: "📤 Share", switch_inline_query: fact.share_text },
            { text: "🏠 Home", callback_data: "action:home" },
          ],
        ],
      },
    });

    console.log(`✅ Fact shown to user ${userId} from ${themeId}`);
  } catch (error) {
    console.error("Error in handleThemeSelection:", error.message);
  }
}

async function handleSaveFact(bot, chatId, userId, themeId, factHash, queryId) {
  try {
    const { saveFact } = await import("../services/userService.js");
    const result = await saveFact(userId, themeId, factHash);

    await bot
      .answerCallbackQuery(queryId, { text: result.message, show_alert: false })
      .catch(() => {});

    console.log(`💾 Fact saved for user ${userId}`);
  } catch (error) {
    console.error("Error in handleSaveFact:", error.message);
  }
}

async function handleViewSaved(bot, chatId, userId) {
  try {
    const { getSavedFacts } = await import("../services/userService.js");

    const savedFacts = await getSavedFacts(userId);

    if (savedFacts.length === 0) {
      await bot.sendMessage(
        chatId,
        "📚 You haven't saved any facts yet! Start exploring.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔍 Find Facts", callback_data: "action:home" }],
            ],
          },
        }
      );
      return;
    }

    const savedList = savedFacts
      .map(
        (f, i) =>
          `${i + 1}. *${f.themeId}* - ${new Date(f.savedAt).toLocaleDateString()}`
      )
      .join("\n");

    await bot.sendMessage(
      chatId,
      `⭐ *Your Saved Facts (${savedFacts.length})*\n\n${savedList}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏠 Home", callback_data: "action:home" }],
          ],
        },
      }
    );

    console.log(`⭐ Showed ${savedFacts.length} saved facts to user ${userId}`);
  } catch (error) {
    console.error("Error in handleViewSaved:", error.message);
  }
}