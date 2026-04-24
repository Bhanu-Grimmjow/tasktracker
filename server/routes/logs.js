const express = require('express');
const TaskLog = require('../models/TaskLog');
const auth = require('../middleware/auth');
const router = express.Router();

// Get logs for a task or by date range
router.get('/', auth, async (req, res) => {
  const { taskId, startDate, endDate } = req.query;
  const filter = { user: req.user.id };
  if (taskId) filter.task = taskId;
  if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate };
  const logs = await TaskLog.find(filter).populate('task', 'title color');
  res.json(logs);
});

// Toggle or set log for a task on a date
router.post('/toggle', auth, async (req, res) => {
  try {
    const { taskId, date, completed } = req.body;
    const log = await TaskLog.findOneAndUpdate(
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
