const express = require('express');
const TaskLog = require('../models/TaskLog');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Summary: completion % per task for a month
router.get('/monthly', auth, async (req, res) => {
  const { month, year } = req.query;
  const tasks = await Task.find({ user: req.user.id, month: Number(month), year: Number(year) });
  const daysInMonth = new Date(year, month, 0).getDate();

  const result = await Promise.all(tasks.map(async (task) => {
    const logs = await TaskLog.find({ task: task._id, completed: true });
    const completedDays = logs.length;
    return {
      taskId: task._id,
      title: task.title,
      color: task.color,
      completedDays,
      totalDays: daysInMonth,
      percentage: Math.round((completedDays / daysInMonth) * 100),
    };
  }));
  res.json(result);
});

// Daily completion count for a date range (for bar/line chart)
router.get('/daily', auth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const logs = await TaskLog.find({
    user: req.user.id,
    date: { $gte: startDate, $lte: endDate },
  });

  const map = {};
  logs.forEach(log => {
    if (!map[log.date]) map[log.date] = { date: log.date, completed: 0, total: 0 };
    map[log.date].total++;
    if (log.completed) map[log.date].completed++;
  });

  const data = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  res.json(data);
});

// Heatmap: completed days count per date
router.get('/heatmap', auth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const logs = await TaskLog.find({
    user: req.user.id,
    completed: true,
    date: { $gte: startDate, $lte: endDate },
  });

  const map = {};
  logs.forEach(log => {
    map[log.date] = (map[log.date] || 0) + 1;
  });

  res.json(Object.entries(map).map(([date, count]) => ({ date, count })));
});

// Per-task daily breakdown for individual graphs
router.get('/task/:taskId', auth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const logs = await TaskLog.find({
    task: req.params.taskId,
    user: req.user.id,
    date: { $gte: startDate, $lte: endDate },
  });
  const map = {};
  logs.forEach(log => { map[log.date] = log.completed ? 1 : 0; });
  res.json(map); // { 'YYYY-MM-DD': 0|1 }
});

// Streak calculation
router.get('/streak', auth, async (req, res) => {
  const logs = await TaskLog.find({ user: req.user.id, completed: true }).distinct('date');
  const sorted = logs.sort();

  let currentStreak = 0, longestStreak = 0, streak = 0;
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { streak = 1; continue; }
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > longestStreak) longestStreak = streak;
  }

  const lastDate = sorted[sorted.length - 1];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  currentStreak = (lastDate === today || lastDate === yesterdayStr) ? streak : 0;
  longestStreak = Math.max(longestStreak, streak);

  res.json({ currentStreak, longestStreak });
});

module.exports = router;
