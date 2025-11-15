import { User } from '../database/userSchema.js';

export async function getBotAnalytics() {
  try {
    const totalUsers = await User.countDocuments();
    
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalFactsViewed: { $sum: '$stats.factsViewed' },
          totalFactsSaved: { $sum: '$stats.factsSaved' },
          avgFactsPerUser: { $avg: '$stats.factsViewed' },
          avgSavedPerUser: { $avg: '$stats.factsSaved' },
        }
      }
    ]);

    const activeToday = await User.countDocuments({
      'stats.lastViewedDate': {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    const activeWeek = await User.countDocuments({
      'stats.lastViewedDate': {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const topThemes = await User.aggregate([
      { $unwind: '$savedFacts' },
      {
        $group: {
          _id: '$savedFacts.themeId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return {
      timestamp: new Date(),
      totalUsers,
      activeToday,
      activeWeek,
      engagementRate: ((activeToday / totalUsers) * 100).toFixed(2) + '%',
      stats: stats[0] || {},
      topThemes: topThemes.map(t => ({
        theme: t._id,
        saves: t.count
      }))
    };
  } catch (error) {
    console.error('Error getting bot analytics:', error);
    throw error;
  }
}

export async function getUserAnalytics(telegramId) {
  try {
    const user = await User.findOne({ telegramId });

    if (!user) return null;

    // Activity heatmap - group by day of week and hour
    const activityHeatmap = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize heatmap
    daysOfWeek.forEach(day => {
      activityHeatmap[day] = Array(24).fill(0);
    });

    // Calculate theme preferences
    const themeStats = {};
    user.savedFacts.forEach(fact => {
      themeStats[fact.themeId] = (themeStats[fact.themeId] || 0) + 1;
    });

    // Quiz performance if available
    const quizStats = user.quizStats || {};

    return {
      userId: telegramId,
      username: user.firstName,
      createdAt: user.createdAt,
      stats: {
        factsViewed: user.stats.factsViewed,
        factsSaved: user.stats.factsSaved,
        currentStreak: user.stats.currentStreak,
        longestStreak: user.stats.longestStreak,
        lastActive: user.stats.lastViewedDate,
      },
      themePreferences: themeStats,
      quizStats: {
        totalQuizzes: quizStats.totalQuizzes || 0,
        averageScore: quizStats.averageScore || 0,
        bestScore: quizStats.bestScore || 0,
        recentScores: quizStats.recentScores || []
      },
      activityHeatmap,
      badges: user.badges || [],
      notificationsPref: {
        enabled: user.preferences.notificationsEnabled,
        time: user.preferences.dailyNotificationTime
      }
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    throw error;
  }
}

export async function generateAnalyticsReport(period = 'weekly') {
  try {
    let startDate;
    const now = new Date();

    if (period === 'weekly') {
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'monthly') {
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0);
    }

    const report = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          newUsers: { $sum: 1 },
          totalFacts: { $sum: '$stats.factsViewed' },
          totalSaved: { $sum: '$stats.factsSaved' },
          avgEngagement: { $avg: '$stats.factsViewed' },
        }
      }
    ]);

    return {
      period,
      startDate,
      endDate: now,
      report: report[0] || {}
    };
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
}