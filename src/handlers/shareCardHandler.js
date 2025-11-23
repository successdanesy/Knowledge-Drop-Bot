// Comment out the entire file
export async function shareFactAsCard(bot, chatId, userId, themeId = 'random_mix') {
    await bot.sendMessage(chatId, '🚧 Share cards temporarily disabled. Use the share button instead!', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🏠 Home', callback_data: 'action:home' }]
            ]
        }
    });
}