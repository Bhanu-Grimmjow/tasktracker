const mongoose = require('mongoose');

const taskLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
}, { timestamps: true });

taskLogSchema.index({ task: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TaskLog', taskLogSchema);
