export function formatFactMessage(fact) {
  return `
💡 *${fact.drop}*

${fact.expand}

👉 ${fact.cta}
  `.trim();
}

export function formatUserStats(stats) {
  return `
📊 *Your Stats*

📚 Facts Viewed: ${stats.factsViewed || 0}
💾 Facts Saved: ${stats.factsSaved || 0}
🔥 Current Streak: ${stats.currentStreak || 0} days

Keep learning! 🚀
  `.trim();
}