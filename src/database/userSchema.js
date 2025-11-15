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
      themeId: String, // e.g., "africa_focus"
      factText: String, // Store actual fact content
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
    dailyNotificationTime: String,
  },
  stats: {
    factsViewed: { type: Number, default: 0 },
    factsSaved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastViewedDate: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);