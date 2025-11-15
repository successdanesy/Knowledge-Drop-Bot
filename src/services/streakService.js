import { User } from "../database/userSchema.js";

export async function updateStreak(telegramId) {
  try {
    const user = await User.findOne({ telegramId });

    if (!user) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastViewed = user.stats.lastViewedDate;
    let lastViewedDate = null;

    if (lastViewed) {
      lastViewedDate = new Date(lastViewed);
      lastViewedDate.setHours(0, 0, 0, 0);
    }

    // If they viewed today, streak is already active
    if (lastViewedDate && lastViewedDate.getTime() === today.getTime()) {
      return user; // Same day, no change
    }

    // Check if streak should continue or break
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastViewedDate && lastViewedDate.getTime() === yesterday.getTime()) {
      // They viewed yesterday, continue streak
      user.stats.currentStreak += 1;
    } else {
      // Break in streak, start new one
      user.stats.currentStreak = 1;
    }

    // Update longest streak
    if (user.stats.currentStreak > user.stats.longestStreak) {
      user.stats.longestStreak = user.stats.currentStreak;
    }

    user.stats.lastViewedDate = Date.now();
    user.updatedAt = Date.now();

    await user.save();

    // Check for badges
    await checkAndAwardBadges(telegramId, user);

    return user;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
}

export async function checkAndAwardBadges(telegramId, user) {
  try {
    const newBadges = [];

    // 🔥 Streak Leader - 7 days in a row
    if (user.stats.currentStreak === 7 && !user.badges?.includes("streak_leader")) {
      newBadges.push("streak_leader");
    }

    // 🏆 Knowledge Seeker - 50 facts viewed
    if (user.stats.factsViewed >= 50 && !user.badges?.includes("knowledge_seeker")) {
      newBadges.push("knowledge_seeker");
    }

    // ⭐ Collector - 20 facts saved
    if (user.stats.factsSaved >= 20 && !user.badges?.includes("collector")) {
      newBadges.push("collector");
    }

    // 📚 Historian - 100 facts viewed
    if (user.stats.factsViewed >= 100 && !user.badges?.includes("historian")) {
      newBadges.push("historian");
    }

    // 🎯 Perfect Week - 7 days streak
    if (user.stats.currentStreak === 7 && !user.badges?.includes("perfect_week")) {
      newBadges.push("perfect_week");
    }

    if (newBadges.length > 0) {
      const updatedUser = await User.findOneAndUpdate(
        { telegramId },
        { $addToSet: { badges: { $each: newBadges } } },
        { new: true }
      );

      console.log(`🏆 New badges earned for ${telegramId}:`, newBadges);
      return newBadges;
    }

    return [];
  } catch (error) {
    console.error("Error checking badges:", error);
    throw error;
  }
}

export async function getUserStreak(telegramId) {
  try {
    const user = await User.findOne({ telegramId });
    return {
      currentStreak: user?.stats?.currentStreak || 0,
      longestStreak: user?.stats?.longestStreak || 0,
      lastViewedDate: user?.stats?.lastViewedDate,
    };
  } catch (error) {
    console.error("Error getting streak:", error);
    throw error;
  }
}

export function formatBadgeName(badgeId) {
  const badges = {
    streak_leader: "🔥 Streak Leader (7 days)",
    knowledge_seeker: "🏆 Knowledge Seeker (50 facts)",
    collector: "⭐ Collector (20 facts saved)",
    historian: "📚 Historian (100 facts)",
    perfect_week: "🎯 Perfect Week (7-day streak)",
  };
  return badges[badgeId] || badgeId;
}