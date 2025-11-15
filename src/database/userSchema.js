import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: String,
  firstName: String,
  savedFacts: [
    {
      themeId: String,
      factText: String,
      savedAt: { type: Date, default: Date.now },
    },
  ],
  preferences: {
    favoriteTheme: {
      type: String,
      default: "random_mix",
      enum: ["countries", "nature", "history", "africa_focus", "origins", "random_mix"],
    },
    notificationsEnabled: { type: Boolean, default: false },
    dailyNotificationTime: String, // e.g., "09:00"
    timezone: { type: String, default: "Africa/Lagos" }, // NEW
  },
  stats: {
    factsViewed: { type: Number, default: 0 },
    factsSaved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 }, // NEW
    longestStreak: { type: Number, default: 0 }, // NEW
    lastViewedDate: Date,
    lastNotificationSent: Date, // NEW - Track last notification
  },
  badges: [{ type: String }], // NEW - Array of badge IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);