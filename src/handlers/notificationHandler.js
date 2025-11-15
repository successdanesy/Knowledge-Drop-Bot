import {
  enableNotifications,
  disableNotifications,
} from "../services/notificationService.js";

export async function handleNotificationPreferences(bot, chatId, userId) {
  try {
    const message = `
🔔 *Notification Preferences*

Would you like to receive a daily fact at a specific time?

Choose your preferred time:
    `;

    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      hours.push({ text: `${hour}:00`, callback_data: `notif:${hour}:00` });
    }

    // Create 4 columns of 6 rows each
    const keyboard = [];
    for (let i = 0; i < hours.length; i += 4) {
      keyboard.push(hours.slice(i, i + 4));
    }

    keyboard.push([{ text: "🔕 Disable Notifications", callback_data: "notif:disable" }]);

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error in handleNotificationPreferences:", error);
  }
}

export async function handleNotificationTime(bot, chatId, userId, time) {
  try {
    if (time === "disable") {
      await disableNotifications(userId);
      await bot.sendMessage(chatId, "🔕 Notifications disabled.", {
        reply_markup: {
          inline_keyboard: [[{ text: "🏠 Home", callback_data: "action:home" }]],
        },
      });
      return;
    }

    await enableNotifications(userId, time);
    await bot.sendMessage(
      chatId,
      `✅ *Notifications Enabled!*\n\nYou'll receive a daily fact at *${time}*\n\n🔔 See you tomorrow! 🌍`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🏠 Home", callback_data: "action:home" }]],
        },
      }
    );
  } catch (error) {
    console.error("Error handling notification time:", error);
  }
}