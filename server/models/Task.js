const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  color: { type: String, default: '#dc2626' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
