const express = require('express');
const WeeklyTask = require('../models/WeeklyTask');
const WeeklyLog = require('../models/WeeklyLog');
const auth = require('../middleware/auth');
const router = express.Router();

// Get weekly tasks
router.get('/tasks', auth, async (req, res) => {
  const { weekNumber, month, year } = req.query;
  const filter = { user: req.user.id };
  if (weekNumber) filter.weekNumber = Number(weekNumber);
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);
  const tasks = await WeeklyTask.find(filter).sort({ createdAt: 1 });
  res.json(tasks);
});

// Create weekly task
router.post('/tasks', auth, async (req, res) => {
  try {
    console.log('CREATE WEEKLY TASK body:', req.body);
    const task = await WeeklyTask.create({ ...req.body, user: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    console.log('CREATE WEEKLY TASK error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Update weekly task
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await WeeklyTask.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete weekly task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await WeeklyTask.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await WeeklyLog.deleteMany({ task: req.params.id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get logs for a date range
router.get('/logs', auth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { user: req.user.id };
  if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };
  const logs = await WeeklyLog.find(filter).populate('task', 'title color');
  res.json(logs);
});

// Toggle log
router.post('/logs/toggle', auth, async (req, res) => {
  try {
    const { taskId, date, completed } = req.body;
    const log = await WeeklyLog.findOneAndUpdate(
      { task: taskId, date, user: req.user.id },
      { completed },
      { upsert: true, new: true }
    );
    res.json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
