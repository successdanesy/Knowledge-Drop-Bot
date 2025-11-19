# 🌍 Knowledge Drop Bot

> **Bridging curiosity and confidence — one fact at a time.**

A Telegram bot that transforms learning into daily habit. Born from a simple realization: *people don't lack intelligence, they just lack access to everyday learning.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 The Story Behind Knowledge Drop

During a casual hangout game, a friend admitted she couldn't answer basic general knowledge questions. She felt embarrassed, not because she wasn't intelligent, but because she'd never had *consistent access* to learning.

That moment sparked an idea: **What if learning could be as easy as checking your phone?**

Knowledge Drop is the answer — a friendly Telegram bot that delivers fascinating facts across themes like history, nature, countries, and African heritage. No pressure, no tests, just pure discovery.

---

## ✨ Features

### 📚 **Rich Fact Library**
- **5 curated themes**: Countries, Nature, History, Africa Focus, Origins
- **300+ hand-crafted facts** with emoji-rich formatting
- **Random Mix mode** for daily surprises

### 🔥 **Gamification & Engagement**
- **Daily streaks** — track your learning consistency
- **Achievement badges** — earn rewards for milestones
- **Leaderboards** — compete with friends (facts viewed, streaks, saves)
- **Save favorites** — bookmark facts for later

### 🧠 **Quiz Mode** *(Coming Soon)*
- Test your knowledge with multiple-choice questions
- Track quiz performance over time
- Compete on quiz leaderboards

### 🔔 **Smart Notifications**
- Daily fact reminders at your preferred time
- Timezone-aware scheduling (24 timezones supported)
- Opt-in/opt-out anytime

### 📊 **Analytics Dashboard** *(Admin Only)*
- User engagement metrics
- Theme popularity insights
- Active user tracking
- Deep-dive into individual user stats

### 🎨 **Beautiful Share Cards** *(Coming Soon)*
- Generate Instagram-ready fact cards
- Customizable themes and colors
- One-tap social sharing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
- **Telegram Bot Token** from [@BotFather](https://t.me/botfather)

### Installation

```bash
# Clone the repository
git clone https://github.com/successdanesy/knowledge-drop-bot.git
cd knowledge-drop-bot

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configuration

Edit `.env` with your credentials:

```env
# Telegram Bot Token from @BotFather
BOT_TOKEN=your_telegram_bot_token

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/knowledge-drop

# Admin Telegram User IDs (comma-separated, no spaces)
ADMIN_IDS=123456789,987654321

# Optional: Port for health checks (default: 8080)
PORT=8080

# Optional: Environment
NODE_ENV=production
```

### Running Locally

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

Visit your bot on Telegram and send `/start` to begin! 🎉

---

## 🌐 Deployment

### Fly.io (Recommended - Free Tier)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Launch (follow prompts)
fly launch

# Set secrets
fly secrets set BOT_TOKEN="your_token"
fly secrets set MONGODB_URI="your_mongo_uri"
fly secrets set ADMIN_IDS="your_telegram_id"

# Deploy
fly deploy
```

**Health Check URL**: `https://your-app.fly.dev/health`

### Alternative: Render.com

1. Connect your GitHub repository
2. Select **Worker** service type
3. Add environment variables in dashboard
4. Deploy automatically on push

### Alternative: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add environment variables
railway variables set BOT_TOKEN="your_token"
railway variables set MONGODB_URI="your_mongo_uri"
railway variables set ADMIN_IDS="your_telegram_id"

# Deploy
railway up
```

---

## 📖 Usage Guide

### Basic Commands

| Command | Description |
|---------|-------------|
| `/start` | Launch bot and see theme menu |
| `/saved` | View your saved facts |
| `/stats` | See your personal statistics |
| `/leaderboard` | Global and themed leaderboards |
| `/share` | Generate shareable fact cards |
| `/analytics` | Admin-only dashboard |

### Exploring Facts

1. Choose a theme from the menu
2. Read the fact (drop → expand → CTA)
3. **Save** favorites, **Share** with friends, or **Next** for more
4. Build your streak by returning daily!

### Managing Notifications

1. Tap **🔔 Notifications** in the main menu
2. Select your preferred time (00:00 - 23:00)
3. Receive a daily fact at your chosen time
4. Disable anytime with **🔕 Disable Notifications**

---

## 🏗️ Project Structure

```
knowledge-drop-bot/
├── data/                     # Fact JSON files
│   ├── africa_focus.json
│   ├── countries.json
│   ├── history.json
│   ├── nature.json
│   └── origins.json
├── src/
│   ├── bot.js               # Main entry point
│   ├── database/
│   │   ├── connection.js    # MongoDB setup
│   │   └── userSchema.js    # User data model
│   ├── handlers/            # Command handlers
│   │   ├── analyticsHandler.js
│   │   ├── callbackHandler.js
│   │   ├── factHandler.js
│   │   ├── leaderboardHandler.js
│   │   ├── notificationHandler.js
│   │   ├── quizHandler.js
│   │   ├── shareCardHandler.js
│   │   └── startHandler.js
│   ├── services/            # Business logic
│   │   ├── analyticsService.js
│   │   ├── factService.js
│   │   ├── leaderboardService.js
│   │   ├── notificationScheduler.js
│   │   ├── notificationService.js
│   │   ├── quizService.js
│   │   ├── shareCardService.js
│   │   ├── streakService.js
│   │   └── userService.js
│   └── utils/               # Helpers
│       ├── constants.js
│       └── formatters.js
├── .env                     # Environment variables
├── .gitignore
├── dockerfile               # Docker config
├── fly.toml                 # Fly.io config
├── package.json
└── README.md
```

---

## 🔧 Advanced Configuration

### Custom Fact Themes

Add new themes by creating JSON files in `data/`:

```json
[
  {
    "drop": "Short teaser fact here 🌟",
    "hook": "Tap to see more...",
    "expand": "Full explanation with context and details...",
    "cta": "Would you explore this? →",
    "share_text": "Quick shareable version. 📚\nTap to see..."
  }
]
```

Update `src/services/factService.js` to load your theme:

```javascript
const themes = {
  // ... existing themes
  your_theme: JSON.parse(fs.readFileSync("./data/your_theme.json"))
};
```

### Scheduler Configuration

Edit cron timing in `src/services/notificationScheduler.js`:

```javascript
// Check every minute (default)
cron.schedule("*/1 * * * *", async () => { ... });

// Alternative: Check every 5 minutes
cron.schedule("*/5 * * * *", async () => { ... });
```

### Badge Customization

Add new achievements in `src/services/streakService.js`:

```javascript
// Example: "Power User" badge for 200 facts viewed
if (user.stats.factsViewed >= 200 && !user.badges?.includes("power_user")) {
  newBadges.push("power_user");
}
```

---

## 📊 Database Schema

### User Document

```javascript
{
  telegramId: Number,           // Unique Telegram ID
  username: String,             // Telegram username
  firstName: String,            // Display name
  savedFacts: [{
    themeId: String,
    factText: String,
    savedAt: Date
  }],
  preferences: {
    favoriteTheme: String,      // Default theme
    notificationsEnabled: Boolean,
    dailyNotificationTime: String, // "HH:MM" format
    timezone: String            // e.g., "Africa/Lagos"
  },
  stats: {
    factsViewed: Number,
    factsSaved: Number,
    currentStreak: Number,      // Consecutive days
    longestStreak: Number,
    lastViewedDate: Date,
    lastNotificationSent: Date
  },
  badges: [String],             // Achievement IDs
  quizStats: {
    totalQuizzes: Number,
    totalScore: Number,
    bestScore: Number,
    averageScore: Number,
    recentScores: [{ score, totalQuestions, percentage, theme, date }]
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style (ES6 modules, async/await)
- Add JSDoc comments for new functions
- Test thoroughly before submitting
- Update README if adding new features

---

## 🐛 Troubleshooting

### Bot not responding?

```bash
# Check if bot is running
curl https://your-app.fly.dev/health

# View logs
fly logs --app your-app-name

# Restart bot
fly restart --app your-app-name
```

### MongoDB connection issues?

- Verify your IP is whitelisted in MongoDB Atlas
- Check connection string format: `mongodb+srv://...`
- Ensure credentials are URL-encoded

### Polling errors?

Add to `src/bot.js`:

```javascript
bot.on("polling_error", (error) => {
  if (error.code === "ETELEGRAM") return; // Ignore timeout errors
  console.error("Polling error:", error);
});
```

---

## 🌟 Acknowledgments

- Inspired by a friend's curiosity and courage to learn
- Built with ❤️ for anyone who believes learning should be accessible
- Special thanks to the open-source community for tools that made this possible

---

## 📞 Support

- **Questions**: Open a discussion on GitHub
- **Email**: successdanesy@gmail.com

---

## 🚧 Roadmap

- [x] Core fact delivery system
- [x] User stats and streaks
- [x] Leaderboards (facts, streaks, saves)
- [x] Daily notifications
- [x] Admin analytics dashboard
- [ ] Quiz mode with scoring
- [ ] Beautiful share cards
- [ ] Web dashboard for fact management
- [ ] Multi-language support
- [ ] Audio fact narration
- [ ] Community-contributed facts

---

**Made with ❤️ by [Success]** — *Because everyone deserves to feel smart.*
