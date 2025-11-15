import {
  getTopUsersByFacts,
  getTopUsersByStreak,
  getTopUsersBySaved,
  getUserRank,
  getTotalUsersCount,
} from "../services/leaderboardService.js";
import { getOrCreateUser } from "../services/userService.js";

export async function leaderboardHandler(bot, msg, period = "all_time") {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await getOrCreateUser(userId, msg.from);

    // Show leaderboard options
    const welcomeMessage = `
🏆 *Leaderboard*

Choose what you'd like to see:

📚 *Facts Viewed* - Who's explored the most
🔥 *Streaks* - Who has the longest streak
💾 *Saved Facts* - Who loves to save
    `;

    await bot.sendMessage(chatId, welcomeMessage.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 Facts Viewed", callback_data: `leaderboard:facts:${period}` },
            { text: "🔥 Streaks", callback_data: `leaderboard:streak:${period}` },
          ],
          [
            { text: "💾 Saved Facts", callback_data: `leaderboard:saved:${period}` },
          ],
          [
            { text: "⏰ All Time", callback_data: "leaderboard:facts:all_time" },
            { text: "📅 Monthly", callback_data: "leaderboard:facts:monthly" },
            { text: "📆 Weekly", callback_data: "leaderboard:facts:weekly" },
          ],
          [{ text: "🏠 Home", callback_data: "action:home" }],
        ],
      },
    });

    console.log(`🏆 Leaderboard menu shown to user ${userId}`);
  } catch (error) {
    console.error("Error in leaderboardHandler:", error.message);
  }
}

export async function handleLeaderboardRequest(bot, chatId, userId, metric, period) {
  try {
    let topUsers, title, emoji;

    // Get the appropriate leaderboard
    if (metric === "facts") {
      topUsers = await getTopUsersByFacts(period, 10);
      title = "📚 Facts Viewed Leaderboard";
      emoji = "📚";
    } else if (metric === "streak") {
      topUsers = await getTopUsersByStreak(period, 10);
      title = "🔥 Longest Streak Leaderboard";
      emoji = "🔥";
    } else if (metric === "saved") {
      topUsers = await getTopUsersBySaved(period, 10);
      title = "💾 Saved Facts Leaderboard";
      emoji = "💾";
    }

    // Get user's rank
    const metricKey = metric === "facts" ? "factsViewed" : metric === "streak" ? "streak" : "saved";
    const userRank = await getUserRank(userId, metricKey);

    // Format period display
    const periodDisplay = period === "all_time" ? "All Time" : period === "weekly" ? "Weekly" : "Monthly";

    // Build leaderboard message
    let message = `${emoji} *${title}*\n⏰ ${periodDisplay}\n\n`;

    if (topUsers.length === 0) {
      message += "No data yet! Start exploring! 🌍";
    } else {
      topUsers.forEach((user, index) => {
        const rank = index + 1;
        let rankEmoji = "🥇";
        if (rank === 2) rankEmoji = "🥈";
        else if (rank === 3) rankEmoji = "🥉";
        else if (rank > 3) rankEmoji = `#${rank}`;

        const value = metric === "facts" ? user.stats.factsViewed : metric === "streak" ? user.stats.longestStreak : user.stats.factsSaved;
        const unit = metric === "facts" ? "facts" : metric === "streak" ? "days" : "saved";

        message += `${rankEmoji} *${user.firstName}* - ${value} ${unit}\n`;
      });
    }

    // Add user's rank if they're not in top 10
    if (userRank && userRank.rank > 10) {
      message += `\n━━━━━━━━━━━━━━━━━━━\n`;
      message += `📍 *Your Rank:* #${userRank.rank} - ${userRank.value} ${metric === "facts" ? "facts" : metric === "streak" ? "days" : "saved"}\n`;
    }

    // Add total users context
    const totalUsers = await getTotalUsersCount();
    message += `\n👥 *Total Players:* ${totalUsers}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📚 Facts", callback_data: `leaderboard:facts:${period}` },
            { text: "🔥 Streaks", callback_data: `leaderboard:streak:${period}` },
            { text: "💾 Saved", callback_data: `leaderboard:saved:${period}` },
          ],
          [
            { text: "⏰ All Time", callback_data: "leaderboard:facts:all_time" },
            { text: "📅 Monthly", callback_data: "leaderboard:facts:monthly" },
            { text: "📆 Weekly", callback_data: "leaderboard:facts:weekly" },
          ],
          [{ text: "🏠 Home", callback_data: "action:home" }],
        ],
      },
    });

    console.log(`📊 Leaderboard shown for ${metric}/${period} to user ${userId}`);
  } catch (error) {
    console.error("Error in handleLeaderboardRequest:", error.message);
  }
}