import { User } from "../database/userSchema.js";

/**
 * Get top users by facts viewed
 * @param {string} period - "weekly", "monthly", or "all_time"
 * @param {number} limit - how many users to return (default 10)
 */
export async function getTopUsersByFacts(period = "all_time", limit = 10) {
  try {
    let query = {};

    // Filter by date if not all_time
    if (period === "weekly") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: weekAgo };
    } else if (period === "monthly") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: monthAgo };
    }

    const topUsers = await User.find(query)
      .sort({ "stats.factsViewed": -1 })
      .limit(limit)
      .select("firstName username stats.factsViewed stats.currentStreak stats.longestStreak")
      .exec();

    return topUsers;
  } catch (error) {
    console.error("Error getting top users:", error);
    throw error;
  }
}

/**
 * Get top users by streak
 */
export async function getTopUsersByStreak(period = "all_time", limit = 10) {
  try {
    let query = {};

    if (period === "weekly") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: weekAgo };
    } else if (period === "monthly") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: monthAgo };
    }

    const topUsers = await User.find(query)
      .sort({ "stats.longestStreak": -1 })
      .limit(limit)
      .select("firstName username stats.factsViewed stats.currentStreak stats.longestStreak")
      .exec();

    return topUsers;
  } catch (error) {
    console.error("Error getting top users by streak:", error);
    throw error;
  }
}

/**
 * Get top users by facts saved
 */
export async function getTopUsersBySaved(period = "all_time", limit = 10) {
  try {
    let query = {};

    if (period === "weekly") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: weekAgo };
    } else if (period === "monthly") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.updatedAt = { $gte: monthAgo };
    }

    const topUsers = await User.find(query)
      .sort({ "stats.factsSaved": -1 })
      .limit(limit)
      .select("firstName username stats.factsViewed stats.currentStreak stats.factsSaved")
      .exec();

    return topUsers;
  } catch (error) {
    console.error("Error getting top users by saved:", error);
    throw error;
  }
}

/**
 * Get user's rank in the leaderboard
 */
export async function getUserRank(telegramId, metric = "factsViewed") {
  try {
    const user = await User.findOne({ telegramId });

    if (!user) return null;

    const userValue =
      metric === "factsViewed"
        ? user.stats.factsViewed
        : metric === "streak"
        ? user.stats.longestStreak
        : user.stats.factsSaved;

    let query = {};

    // Count users with higher value
    if (metric === "factsViewed") {
      query = { "stats.factsViewed": { $gt: userValue } };
    } else if (metric === "streak") {
      query = { "stats.longestStreak": { $gt: userValue } };
    } else {
      query = { "stats.factsSaved": { $gt: userValue } };
    }

    const rank = (await User.countDocuments(query)) + 1;

    return {
      rank,
      username: user.firstName || user.username,
      value: userValue,
      metric,
    };
  } catch (error) {
    console.error("Error getting user rank:", error);
    throw error;
  }
}

/**
 * Get total users count (for context)
 */
export async function getTotalUsersCount() {
  try {
    const count = await User.countDocuments();
    return count;
  } catch (error) {
    console.error("Error getting total users count:", error);
    throw error;
  }
}