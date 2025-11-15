import { getOrCreateUser } from "../services/userService.js";
import { getQuizQuestions, saveQuizResult, getUserQuizStats } from "../services/quizService.js";

// Store active quiz sessions in memory
const activeQuizzes = new Map();

export async function quizMenuHandler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await getOrCreateUser(userId, msg.from);

    const message = `
🧠 *Quiz Mode*

Test your knowledge with multiple choice questions!

Choose difficulty:
- 📘 Easy (5 questions) - Random mix
- 📗 Medium (10 questions) - Pick a theme
- 📕 Hard (15 questions) - Challenge mode
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📘 Easy (5)", callback_data: "quiz:start:5:random_mix" },
            { text: "📗 Medium (10)", callback_data: "quiz:theme" },
          ],
          [
            { text: "📕 Hard (15)", callback_data: "quiz:start:15:random_mix" },
          ],
          [
            { text: "📊 My Stats", callback_data: "quiz:stats" },
            { text: "🏆 Leaderboard", callback_data: "quiz:leaderboard" },
          ],
          [{ text: "🏠 Home", callback_data: "action:home" }],
        ],
      },
    });

    console.log(`🧠 Quiz menu shown to user ${userId}`);
  } catch (error) {
    console.error("Error in quizMenuHandler:", error.message);
  }
}

export async function handleQuizThemeSelection(bot, chatId, userId) {
  try {
    const message = `🎯 *Choose a Theme*

Select which theme to quiz on:
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🌎 Countries", callback_data: "quiz:start:10:countries" },
            { text: "🌿 Nature", callback_data: "quiz:start:10:nature" },
          ],
          [
            { text: "🏺 History", callback_data: "quiz:start:10:history" },
            { text: "🌍 Africa", callback_data: "quiz:start:10:africa_focus" },
          ],
          [
            { text: "🔍 Origins", callback_data: "quiz:start:10:origins" },
            { text: "🎲 Random", callback_data: "quiz:start:10:random_mix" },
          ],
          [{ text: "↩️ Back", callback_data: "action:quiz" }],
        ],
      },
    });
  } catch (error) {
    console.error("Error in handleQuizThemeSelection:", error.message);
  }
}

export async function startQuiz(bot, chatId, userId, questionCount, themeId) {
  try {
    const questions = getQuizQuestions(themeId, questionCount);

    if (questions.length === 0) {
      await bot.sendMessage(chatId, "❌ No questions available for this theme!");
      return;
    }

    // Store quiz session
    activeQuizzes.set(userId, {
      questions,
      currentQuestion: 0,
      score: 0,
      answers: [],
      themeId,
      startTime: Date.now(),
    });

    // Send first question
    await sendQuestion(bot, chatId, userId);

    console.log(`🧠 Quiz started for user ${userId}: ${questionCount} questions on ${themeId}`);
  } catch (error) {
    console.error("Error in startQuiz:", error.message);
  }
}

export async function sendQuestion(bot, chatId, userId) {
  try {
    const quiz = activeQuizzes.get(userId);

    if (!quiz) {
      await bot.sendMessage(chatId, "❌ Quiz session not found!");
      return;
    }

    const { questions, currentQuestion } = quiz;

    if (currentQuestion >= questions.length) {
      await finishQuiz(bot, chatId, userId);
      return;
    }

    const question = questions[currentQuestion];
    const progressBar = `[${currentQuestion + 1}/${questions.length}]`;

    const message = `
${progressBar}

❓ *${question.question}*

Select your answer:
    `;

    const keyboard = question.options.map((option, index) => [
      {
        text: `${String.fromCharCode(65 + index)}. ${option}`,
        // Use index only - keep callback data short
        callback_data: `quiz:answer:${userId}:${currentQuestion}:${index}`,
      },
    ]);

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error in sendQuestion:", error.message);
  }
}

export async function handleQuizAnswer(bot, chatId, userId, currentQuestionIndex, selectedIndex) {
  try {
    const quiz = activeQuizzes.get(userId);

    if (!quiz) {
      await bot.sendMessage(chatId, "❌ Quiz session expired!");
      return;
    }

    const question = quiz.questions[currentQuestionIndex];
    const selectedAnswer = question.options[selectedIndex];
    const correctAnswer = question.options.findIndex(opt => opt === question.correctAnswer);
    const isCorrect = selectedIndex === correctAnswer;

    // Store answer
    quiz.answers.push({
      question: question.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    });

    if (isCorrect) {
      quiz.score += 1;
      await bot.sendMessage(chatId, "✅ Correct!");
    } else {
      await bot.sendMessage(
        chatId,
        `❌ Wrong!\n\n✓ The correct answer is: *${question.correctAnswer}*`,
        { parse_mode: "Markdown" }
      );
    }

    // Move to next question
    quiz.currentQuestion += 1;

    // Wait 2 seconds then send next question
    setTimeout(() => sendQuestion(bot, chatId, userId), 2000);
  } catch (error) {
    console.error("Error in handleQuizAnswer:", error.message);
  }
}

export async function finishQuiz(bot, chatId, userId) {
  try {
    const quiz = activeQuizzes.get(userId);

    if (!quiz) return;

    const { score, questions, themeId, answers } = quiz;
    const percentage = Math.round((score / questions.length) * 100);

    // Save result
    await saveQuizResult(userId, score, questions.length, themeId);

    let emoji = "🔥";
    if (percentage >= 90) emoji = "🏆";
    else if (percentage >= 70) emoji = "👏";
    else if (percentage >= 50) emoji = "💪";

    const message = `
${emoji} *Quiz Complete!*

📊 *Your Score:* ${score}/${questions.length}
📈 *Percentage:* ${percentage}%

${percentage >= 90 ? "🎉 Outstanding! You're a true fact master!" : ""}
${percentage >= 70 && percentage < 90 ? "👏 Great job! Keep learning!" : ""}
${percentage >= 50 && percentage < 70 ? "💪 Good effort! Try again!" : ""}
${percentage < 50 ? "📚 Keep exploring to improve!" : ""}

Theme: ${themeId}
Time: ${Math.round((Date.now() - quiz.startTime) / 1000)}s
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🧠 Another Quiz", callback_data: "action:quiz" },
            { text: "📊 My Stats", callback_data: "quiz:stats" },
          ],
          [{ text: "🏠 Home", callback_data: "action:home" }],
        ],
      },
    });

    // Clean up
    activeQuizzes.delete(userId);

    console.log(`✅ Quiz finished for user ${userId}: ${score}/${questions.length} (${percentage}%)`);
  } catch (error) {
    console.error("Error in finishQuiz:", error.message);
  }
}

export async function showQuizStats(bot, chatId, userId) {
  try {
    const stats = await getUserQuizStats(userId);

    if (!stats || stats.totalQuizzes === 0) {
      await bot.sendMessage(chatId, "📚 You haven't taken any quizzes yet!\n\nStart a quiz to build your stats!", {
        reply_markup: {
          inline_keyboard: [[{ text: "🧠 Start Quiz", callback_data: "action:quiz" }]],
        },
      });
      return;
    }

    const message = `
📊 *Your Quiz Stats*

🎯 Total Quizzes: ${stats.totalQuizzes}
🏆 Best Score: ${stats.bestScore}
📈 Average Score: ${stats.averageScore}
📚 Total Points: ${stats.totalScore}

Recent Scores:
${stats.recentScores
  .slice(-5)
  .reverse()
  .map((s) => `• ${s.score}/${s.totalQuestions} (${s.percentage}%) - ${s.theme}`)
  .join("\n")}
    `;

    await bot.sendMessage(chatId, message.trim(), {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🧠 Take Quiz", callback_data: "action:quiz" }],
          [{ text: "🏠 Home", callback_data: "action:home" }],
        ],
      },
    });

    console.log(`📊 Quiz stats shown for user ${userId}`);
  } catch (error) {
    console.error("Error in showQuizStats:", error.message);
  }
}