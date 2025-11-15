import { formatBadgeName } from "../services/streakService.js";

export function formatFactMessage(fact) {
  return `
💡 *${fact.drop}*

${fact.expand}

👉 ${fact.cta}
  `.trim();
}

export function formatUserStats(stats) {
  const streakEmoji = stats.currentStreak > 0 ? "🔥" : "❄️";
  return `
📊 *Your Stats*

📚 Facts Viewed: ${stats.factsViewed || 0}
💾 Facts Saved: ${stats.factsSaved || 0}
${streakEmoji} Current Streak: ${stats.currentStreak || 0} days
🏆 Longest Streak: ${stats.longestStreak || 0} days

Keep learning! 🚀
  `.trim();
}

export function formatBadges(badges) {
  if (!badges || badges.length === 0) return "";

  const badgesList = badges.map((b) => formatBadgeName(b)).join("\n");
  return `
🏆 *Your Badges*

${badgesList}
  `.trim();
}