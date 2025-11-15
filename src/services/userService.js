import { User } from "../database/userSchema.js";

export async function getOrCreateUser(telegramId, userData) {
  try {
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        username: userData.username || "anonymous",
        firstName: userData.first_name || "User",
      });
      await user.save();
      console.log(`✨ New user created: ${telegramId}`);
    }

    return user;
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}

export async function updateUserPreference(telegramId, key, value) {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { [`preferences.${key}`]: value, updatedAt: Date.now() },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
}

export async function saveFact(telegramId, themeId, factText) {
  try {
    const user = await User.findOne({ telegramId });

    // Check if already saved (compare fact text to avoid exact duplicates)
    const alreadySaved = user.savedFacts.some(
      (f) => f.factText === factText && f.themeId === themeId
    );

    if (alreadySaved) {
      return { success: false, message: "Fact already saved!" };
    }

    user.savedFacts.push({ themeId, factText });
    user.stats.factsSaved += 1;
    user.updatedAt = Date.now();

    await user.save();
    return { success: true, message: "✅ Fact saved!" };
  } catch (error) {
    console.error("Error saving fact:", error);
    throw error;
  }
}

export async function getSavedFacts(telegramId) {
  try {
    const user = await User.findOne({ telegramId });
    return user?.savedFacts || [];
  } catch (error) {
    console.error("Error getting saved facts:", error);
    throw error;
  }
}

export async function getUserStats(telegramId) {
  try {
    const user = await User.findOne({ telegramId });
    return user?.stats || {};
  } catch (error) {
    console.error("Error getting stats:", error);
    throw error;
  }
}

export async function incrementFactsViewed(telegramId) {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      {
        $inc: { "stats.factsViewed": 1 },
        "stats.lastViewedDate": Date.now(),
        updatedAt: Date.now(),
      },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error incrementing facts viewed:", error);
    throw error;
  }
}