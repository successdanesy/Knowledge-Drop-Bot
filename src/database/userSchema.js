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
    dailyNotificationTime: String,
    timezone: { type: String, default: "Africa/Lagos" },
  },
  stats: {
    factsViewed: { type: Number, default: 0 },
    factsSaved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastViewedDate: Date,
    lastNotificationSent: Date,
  },
  badges: [{ type: String }],
  quizStats: {
    totalQuizzes: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    recentScores: [
      {
        score: Number,
        totalQuestions: Number,
        percentage: Number,
        theme: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);