import cron from "node-cron";
import { getUsersForNotification, recordNotificationSent } from "../services/notificationService.js";
import { getRandomFactFromTheme } from "../services/factService.js";
import { formatFactMessage } from "../utils/formatters.js";
import { updateStreak } from "../services/streakService.js";

let scheduledJobs = [];

export function startNotificationScheduler(bot) {
  console.log("📅 Starting notification scheduler...");

  // Run every minute to check if we need to send notifications
  // In production, you'd optimize this
  const job = cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Get users who should receive notification at this time
      const usersToNotify = await getUsersForNotification(hour, minute);

      if (usersToNotify.length > 0) {
        console.log(`📤 Sending notifications to ${usersToNotify.length} users...`);

        for (const user of usersToNotify) {
          try {
            // Update streak
            await updateStreak(user.telegramId);

            // Get random fact
            const fact = getRandomFactFromTheme("random_mix");

            if (!fact) continue;

            const message = formatFactMessage(fact);
            const factHash = Buffer.from(fact.drop).toString("base64").slice(0, 20);

            // Send notification
            await bot.sendMessage(user.telegramId, message, {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "🔁 Next", callback_data: "theme:random_mix" },
                    { text: "💾 Save", callback_data: `save:random_mix:${factHash}` },
                  ],
                  [
                    { text: "📊 Stats", callback_data: "action:stats" },
                    { text: "🏠 Menu", callback_data: "action:home" },
                  ],
                ],
              },
            });

            // Record that notification was sent
            await recordNotificationSent(user.telegramId);

            console.log(`✅ Notification sent to ${user.username || user.telegramId}`);
          } catch (error) {
            console.error(`Error sending notification to ${user.telegramId}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error("Error in notification scheduler:", error);
    }
  });

  scheduledJobs.push(job);
  console.log("✅ Notification scheduler started!");
}

export function stopNotificationScheduler() {
  scheduledJobs.forEach((job) => job.stop());
  scheduledJobs = [];
  console.log("🛑 Notification scheduler stopped");
}
