import { User } from "../database/userSchema.js";

export async function enableNotifications(telegramId, time, timezone = "Africa/Lagos") {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        "preferences.notificationsEnabled": true,
        "preferences.dailyNotificationTime": time,
        "preferences.timezone": timezone,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    console.log(`🔔 Notifications enabled for ${telegramId} at ${time}`);
    return user;
  } catch (error) {
    console.error("Error enabling notifications:", error);
    throw error;
  }
}

export async function disableNotifications(telegramId) {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        "preferences.notificationsEnabled": false,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    console.log(`🔕 Notifications disabled for ${telegramId}`);
    return user;
  } catch (error) {
    console.error("Error disabling notifications:", error);
    throw error;
  }
}

export async function getUsersForNotification(hour, minute) {
  try {
    // Get all users with notifications enabled
    const users = await User.find({
      "preferences.notificationsEnabled": true,
    });

    // Filter by users whose notification time matches (simple approach)
    const usersToNotify = users.filter((user) => {
      const [userHour, userMinute] = user.preferences.dailyNotificationTime.split(":");
      return parseInt(userHour) === hour && parseInt(userMinute) === minute;
    });

    return usersToNotify;
  } catch (error) {
    console.error("Error getting users for notification:", error);
    throw error;
  }
}

export async function recordNotificationSent(telegramId) {
  try {
    await User.findOneAndUpdate(
      { telegramId },
      { "stats.lastNotificationSent": Date.now() },
      { new: true }
    );
  } catch (error) {
    console.error("Error recording notification:", error);
  }
}