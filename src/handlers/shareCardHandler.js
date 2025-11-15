import { generateShareCard } from '../services/shareCardService.js';
import { getRandomFactFromTheme } from '../services/factService.js';
import { incrementFactsViewed } from '../services/userService.js';

export async function shareFactAsCard(bot, chatId, userId, themeId = 'random_mix') {
  try {
    const fact = getRandomFactFromTheme(themeId);

    if (!fact) {
      await bot.sendMessage(chatId, '❌ No facts available to share!');
      return;
    }

    // Show "generating" message
    const genMsg = await bot.sendMessage(
      chatId,
      '🎨 Generating beautiful share card...'
    );

    // Generate card
    const cardBuffer = await generateShareCard(fact, themeId, 'Knowledge Drop Bot');

    // Send as photo
    await bot.sendPhoto(chatId, cardBuffer, {
      caption: `✨ *Share this fact!*\n\n${fact.share_text}`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📥 Use as Avatar', callback_data: 'share:avatar' },
            { text: '🎨 Customize', callback_data: 'share:customize' },
          ],
          [
            { text: '🔗 Copy Link', callback_data: 'share:copy' },
            { text: '🏠 Home', callback_data: 'action:home' }
          ]
        ]
      }
    });

    // Delete "generating" message
    await bot.deleteMessage(chatId, genMsg.message_id).catch(() => {});

    await incrementFactsViewed(userId);
  } catch (error) {
    console.error('Error sharing card:', error);
    await bot.sendMessage(chatId, '❌ Error generating share card');
  }
}