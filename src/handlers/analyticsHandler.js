import { getBotAnalytics, getUserAnalytics } from '../services/analyticsService.js';
import { getOrCreateUser } from '../services/userService.js';

export async function analyticsHandler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if admin (you'll need to add admin check)
    const isAdmin = process.env.ADMIN_IDS?.split(',').includes(userId.toString());

    if (!isAdmin) {
      await bot.sendMessage(chatId, '❌ Admin only!');
      return;
    }

    const analytics = await getBotAnalytics();

    const message = `
📊 *Bot Analytics Dashboard*

👥 *Users*
• Total: ${analytics.totalUsers}
• Active Today: ${analytics.activeToday}
• Active This Week: ${analytics.activeWeek}
• Engagement: ${analytics.engagementRate}

📈 *Engagement*
• Total Facts Viewed: ${analytics.stats.totalFactsViewed || 0}
• Total Facts Saved: ${analytics.stats.totalFactsSaved || 0}
• Avg Facts/User: ${Math.round(analytics.stats.avgFactsPerUser || 0)}
• Avg Saved/User: ${Math.round(analytics.stats.avgSavedPerUser || 0)}

🏆 *Top Themes*
${analytics.topThemes
  .slice(0, 5)
  .map((t, i) => `${i + 1}. ${t.theme}: ${t.saves} saves`)
  .join('\n')}

⏰ Updated: ${analytics.timestamp.toLocaleTimeString()}
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔄 Refresh', callback_data: 'admin:analytics' },
            { text: '📅 Report', callback_data: 'admin:report' }
          ],
          [
            { text: '👤 User Deep Dive', callback_data: 'admin:user_search' }
          ]
        ]
      }
    });

    console.log(`📊 Analytics shown to admin ${userId}`);
  } catch (error) {
    console.error('Error in analyticsHandler:', error);
    await bot.sendMessage(chatId, '❌ Error loading analytics');
  }
}

export async function userDeepDiveHandler(bot, msg, targetUserId) {
  try {
    const chatId = msg.chat.id;
    const analytics = await getUserAnalytics(targetUserId);

    if (!analytics) {
      await bot.sendMessage(chatId, '❌ User not found');
      return;
    }

    const message = `
👤 *User Deep Dive: ${analytics.username}*

📊 *Stats*
• Facts Viewed: ${analytics.stats.factsViewed}
• Facts Saved: ${analytics.stats.factsSaved}
• Current Streak: ${analytics.stats.currentStreak} 🔥
• Longest Streak: ${analytics.stats.longestStreak}

🎯 *Theme Preferences*
${Object.entries(analytics.themePreferences)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([theme, count]) => `• ${theme}: ${count}`)
  .join('\n')}

🧠 *Quiz Performance*
• Total Quizzes: ${analytics.quizStats.totalQuizzes}
• Average Score: ${analytics.quizStats.averageScore}%
• Best Score: ${analytics.quizStats.bestScore}

🏆 *Badges*
${analytics.badges.length > 0 ? analytics.badges.join(', ') : 'None yet'}

⏰ *Joined*: ${new Date(analytics.createdAt).toLocaleDateString()}
🔔 *Notifications*: ${analytics.notificationsPref.enabled ? 'Enabled' : 'Disabled'}
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Back to Analytics', callback_data: 'admin:analytics' }]
        ]
      }
    });
  } catch (error) {
    console.error('Error in userDeepDiveHandler:', error);
  }
}
