import { getSavedFacts, getOrCreateUser } from "../services/userService.js";

export async function viewSavedHandler(bot, msg) {
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await getOrCreateUser(userId, msg.from);

    const savedFacts = await getSavedFacts(userId);

    if (savedFacts.length === 0) {
      await bot.sendMessage(
        chatId,
        "📚 You haven't saved any facts yet!\n\nUse /start to explore and save facts.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📚 Explore", callback_data: "theme:random_mix" }],
            ],
          },
        }
      );
      console.log(`ℹ️ No saved facts for user ${userId}`);
      return;
    }

    let message = `⭐ *Your Saved Facts* (${savedFacts.length} total)\n\n`;
    message += savedFacts
      .map(
        (f, i) =>
          `${i + 1}. *${f.themeId}* - ${new Date(f.savedAt).toLocaleDateString()}`
      )
      .join("\n");

    await bot.sendMessage(chatId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "🏠 Home", callback_data: "action:home" }]],
      },
    });

    console.log(`⭐ Showed saved facts for user ${userId}`);
  } catch (error) {
    console.error("Error in viewSavedHandler:", error.message);
  }
}