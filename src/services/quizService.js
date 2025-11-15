import { User } from "../database/userSchema.js";
import fs from "fs";

// Load all facts
const themes = {
  countries: JSON.parse(fs.readFileSync("./data/countries.json")),
  nature: JSON.parse(fs.readFileSync("./data/nature.json")),
  history: JSON.parse(fs.readFileSync("./data/history.json")),
  africa_focus: JSON.parse(fs.readFileSync("./data/africa_focus.json")),
  origins: JSON.parse(fs.readFileSync("./data/origins.json")),
};

/**
 * Generate a quiz question from a fact
 */
function generateQuizFromFact(fact) {
  // Extract key information from the expand section
  const expand = fact.expand;
  
  // Create multiple choice question
  const questions = [
    {
      question: `What is the main topic of this fact?\n\n"${fact.drop}"`,
      correctAnswer: fact.drop.split(" ")[0], // First word as answer
      options: [fact.drop.split(" ")[0], "Unknown", "Not Specified"],
    },
    {
      question: `Based on this fact, which statement is TRUE?\n\n${expand.substring(0, 100)}...`,
      correctAnswer: "The above statement",
      options: ["The above statement", "The opposite", "Cannot determine"],
    },
  ];

  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get random quiz questions from a theme
 * @param {string} themeId - Theme to get questions from
 * @param {number} questionCount - How many questions (default 5)
 */
export function getQuizQuestions(themeId = "random_mix", questionCount = 5) {
  try {
    let facts = [];

    if (themeId === "random_mix") {
      facts = Object.values(themes).flat();
    } else {
      facts = themes[themeId] || [];
    }

    if (facts.length === 0) return [];

    // Shuffle and pick random facts
    const shuffled = facts.sort(() => 0.5 - Math.random()).slice(0, questionCount);

    // Generate questions from facts
    const questions = shuffled.map((fact, index) => ({
      id: index + 1,
      fact: fact,
      question: `What is being described here?\n\n"${fact.drop}"`,
      // Create 4 options: 1 correct, 3 random
      options: generateMultipleChoice(fact, shuffled),
      correctAnswer: fact.drop,
    }));

    return questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}

/**
 * Generate multiple choice options
 */
function generateMultipleChoice(correctFact, allFacts) {
  const options = [correctFact.drop];

  // Add 3 random incorrect options
  const incorrectFacts = allFacts
    .filter((f) => f.drop !== correctFact.drop)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  incorrectFacts.forEach((f) => {
    options.push(f.drop);
  });

  // Shuffle options
  return options.sort(() => 0.5 - Math.random());
}

/**
 * Save quiz results for a user
 */
export async function saveQuizResult(telegramId, score, totalQuestions, themeId) {
  try {
    const user = await User.findOne({ telegramId });

    if (!user) return null;

    // Initialize quizStats if not exists
    if (!user.quizStats) {
      user.quizStats = {
        totalQuizzes: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        recentScores: [],
      };
    }

    // Update stats
    user.quizStats.totalQuizzes += 1;
    user.quizStats.totalScore += score;
    user.quizStats.recentScores.push({
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      theme: themeId,
      date: Date.now(),
    });

    // Keep only last 10 scores
    if (user.quizStats.recentScores.length > 10) {
      user.quizStats.recentScores.shift();
    }

    // Update best score
    if (score > user.quizStats.bestScore) {
      user.quizStats.bestScore = score;
    }

    // Calculate average
    user.quizStats.averageScore = Math.round(
      user.quizStats.totalScore / user.quizStats.totalQuizzes
    );

    user.updatedAt = Date.now();
    await user.save();

    return user.quizStats;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw error;
  }
}

/**
 * Get user's quiz stats
 */
export async function getUserQuizStats(telegramId) {
  try {
    const user = await User.findOne({ telegramId });
    return user?.quizStats || null;
  } catch (error) {
    console.error("Error getting quiz stats:", error);
    throw error;
  }
}

/**
 * Get top quiz performers
 */
export async function getTopQuizPlayers(limit = 10) {
  try {
    const topPlayers = await User.find({
      "quizStats.totalQuizzes": { $gt: 0 },
    })
      .sort({ "quizStats.averageScore": -1 })
      .limit(limit)
      .select(
        "firstName username quizStats.totalQuizzes quizStats.bestScore quizStats.averageScore"
      )
      .exec();

    return topPlayers;
  } catch (error) {
    console.error("Error getting top quiz players:", error);
    throw error;
  }
}