import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Load your main theme data
const themes = {
  countries: JSON.parse(fs.readFileSync("./data/countries.json")),
  nature: JSON.parse(fs.readFileSync("./data/nature.json")),
  history: JSON.parse(fs.readFileSync("./data/history.json")),
  africa_focus: JSON.parse(fs.readFileSync("./data/africa_focus.json")),
  origins: JSON.parse(fs.readFileSync("./data/origins.json")),
};

// Function to combine all facts into one pool
function getRandomMix() {
  return Object.values(themes).flat();
}

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🌍 Welcome to **Knowledge Drop Bot**!\n\nChoose a theme or try the random mix:",
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🌎 Countries", callback_data: "countries" },
            { text: "🌿 Nature", callback_data: "nature" },
          ],
          [
            { text: "🏺 History", callback_data: "history" },
            { text: "🌍 Africa Focus", callback_data: "africa_focus" },
          ],
          [
            { text: "🔍 Origins", callback_data: "origins" },
            { text: "🎲 Random Mix", callback_data: "random_mix" },
          ],
        ],
      },
    }
  );
});

// Handle theme selection
bot.on("callback_query", (query) => {
  const theme = query.data;
  const chatId = query.message.chat.id;

  let factPool = [];

  if (theme === "random_mix") {
    factPool = getRandomMix();
  } else {
    factPool = themes[theme] || [];
  }

  if (factPool.length === 0) {
    bot.sendMessage(chatId, "⚠️ No facts available for this theme yet!");
    return;
  }

  // Pick a random fact
  const fact = factPool[Math.floor(Math.random() * factPool.length)];

  const message = `
💡 *${fact.drop}*
_${fact.hook}_

${fact.expand}

👉 ${fact.cta}
  `;

  // Send fact + inline buttons
  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔁 Next Fact", callback_data: theme },
          { text: "📤 Share", switch_inline_query: fact.share_text },
        ],
      ],
    },
  });
});
