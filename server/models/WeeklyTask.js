const mongoose = require('mongoose');

const weeklyTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#dc2626' },
  weekNumber: { type: Number, required: true }, // 1-5
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('WeeklyTask', weeklyTaskSchema);
