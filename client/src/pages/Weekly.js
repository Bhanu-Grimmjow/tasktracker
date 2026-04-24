import { useState, useEffect, useCallback } from 'react';
import { getWeeklyTasks, createWeeklyTask, updateWeeklyTask, deleteWeeklyTask, getWeeklyLogs, toggleWeeklyLog } from '../api';
import toast from 'react-hot-toast';

const COLORS = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#fca5a5','#7f1d1d','#450a0a'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// Get Monday of the week containing `date`
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Get week number (1-5) within a month for a given Monday
function getWeekNumber(weekStart) {
  // Use the Thursday of the week to determine which month the week belongs to
  const thursday = new Date(weekStart);
  thursday.setDate(thursday.getDate() + 3);
  const month = thursday.getMonth();
  const year = thursday.getFullYear();
  // Find the first day of that month
  const firstOfMonth = new Date(year, month, 1);
  // Find the Monday of the week containing the 1st
  const firstWeekMonday = getWeekStart(firstOfMonth);
  const diff = Math.round((weekStart - firstWeekMonday) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

function TaskModal({ task, onSave, onClose, weekNumber, month, year }) {
  const [form, setForm] = useState(task || { title: '', description: '', color: COLORS[0], weekNumber, month, year });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-7 w-full max-w-md shadow-2xl fade-in-up"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(185,28,28,0.25)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white">{task ? 'Edit Task' : 'New Weekly Task'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 mb-1.5 block uppercase tracking-wider">Task Title</label>
            <input
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm input-glow placeholder-gray-700 text-white"
              placeholder="e.g. Weekly review"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-1.5 block uppercase tracking-wider">Description <span className="text-gray-700">(optional)</span></label>
            <textarea
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm input-glow placeholder-gray-700 text-white resize-none"
              placeholder="Add details..."
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-2 block uppercase tracking-wider">Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: c,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: form.color === c ? `0 0 12px ${c}` : 'none',
                    outline: form.color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-500 hover:bg-white/5 hover:text-white transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl btn-primary text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Weekly() {
  const today = toDateStr(new Date());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState({});

  const weekDays = getWeekDays(weekStart);
  const startDate = toDateStr(weekDays[0]);
  const endDate = toDateStr(weekDays[6]);
  const weekNumber = getWeekNumber(weekStart);
  // Use Thursday to determine the canonical month/year for this week
  const thursday = new Date(weekStart);
  thursday.setDate(thursday.getDate() + 3);
  const month = thursday.getMonth() + 1;
  const year = thursday.getFullYear();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, l] = await Promise.all([
        getWeeklyTasks(weekNumber, month, year),
        getWeeklyLogs(startDate, endDate),
      ]);
      setTasks(t.data);
      const logMap = {};
      l.data.forEach(log => { logMap[`${log.task._id || log.task}-${log.date}`] = log.completed; });
      setLogs(logMap);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
    setLoading(false);
  }, [weekNumber, month, year, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => {
    try {
      if (form._id) { await updateWeeklyTask(form._id, form); toast.success('Task updated'); }
      else { await createWeeklyTask({ ...form, weekNumber, month, year }); toast.success('Task created 🔥'); }
      setModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task and all its logs?')) return;
    await deleteWeeklyTask(id);
    toast.success('Task deleted');
    fetchData();
  };

  const handleToggle = async (taskId, date) => {
    if (date > today) return; // can't toggle future days
    const key = `${taskId}-${date}`;
    const current = logs[key] || false;
    setLogs(prev => ({ ...prev, [key]: !current }));
    setAnimating(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAnimating(prev => ({ ...prev, [key]: false })), 300);
    try {
      await toggleWeeklyLog({ taskId, date, completed: !current });
    } catch {
      setLogs(prev => ({ ...prev, [key]: current }));
      toast.error('Failed to update');
    }
  };

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  const weekLabel = `${weekDays[0].getDate()} ${MONTHS[weekDays[0].getMonth()].slice(0,3)} – ${weekDays[6].getDate()} ${MONTHS[weekDays[6].getMonth()].slice(0,3)} ${year}`;

  return (
    <div className="space-y-6">
      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          weekNumber={weekNumber} month={month} year={year}
          onSave={handleSave} onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Weekly Tasks</h1>
          <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest">Week {weekNumber} · {MONTHS[month - 1]} {year}</p>
        </div>
        <button onClick={() => setModal('new')}
          className="btn-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Week navigator */}
      <div className="flex flex-wrap items-center gap-2 fade-in-up-1">
        <button onClick={prevWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span className="text-xs sm:text-sm font-semibold text-white px-1 sm:px-3">{weekLabel}</span>
        <button onClick={nextWeek}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white transition"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
        <button onClick={goToday}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          Today
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="glass rounded-2xl overflow-hidden">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
              <div className="w-32 h-4 shimmer rounded-lg" />
              <div className="flex gap-2 flex-1">
                {Array.from({length: 7}, (_, j) => <div key={j} className="w-10 h-10 shimmer rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center fade-in-up">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 float"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)' }}>
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">No tasks for Week {weekNumber}</p>
          <p className="text-gray-600 text-sm mt-1 mb-5">Plan your week ahead</p>
          <button onClick={() => setModal('new')} className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            + Add your first weekly task
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden fade-in-up">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-5 py-4 text-gray-500 font-medium sticky left-0 min-w-[180px]"
                    style={{ background: 'rgba(5,2,2,0.9)', backdropFilter: 'blur(10px)' }}>
                    Task
                  </th>
                  {weekDays.map((day, i) => {
                    const dateStr = toDateStr(day);
                    const isToday = dateStr === today;
                    const isPast = dateStr < today;
                    return (
                      <th key={i} className={`px-2 py-4 text-center font-medium min-w-[52px]`}>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-[10px] font-semibold ${isToday ? 'text-red-400' : isPast ? 'text-gray-600' : 'text-gray-700'}`}>
                            {DAY_LABELS[i]}
                          </span>
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
                            ${isToday ? 'bg-red-500/20 text-red-400' : isPast ? 'text-gray-600' : 'text-gray-800'}`}>
                            {day.getDate()}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-4 py-4 text-gray-500 font-medium text-right min-w-[50px]">Done</th>
                  <th className="px-4 py-4 min-w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, taskIdx) => {
                  const tColor = task.color || '#dc2626';
                  const completed = weekDays.map(day => logs[`${task._id}-${toDateStr(day)}`] || false);
                  const pct = Math.round((completed.filter(Boolean).length / 7) * 100);
                  return (
                    <tr key={task._id} className="transition-colors duration-200"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-3 sticky left-0"
                        style={{ background: 'rgba(5,2,2,0.9)', backdropFilter: 'blur(10px)' }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tColor, boxShadow: `0 0 8px ${tColor}` }} />
                          <span className="font-medium text-white truncate max-w-[140px]" title={task.title}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      {weekDays.map((day, i) => {
                        const dateStr = toDateStr(day);
                        const done = completed[i];
                        const key = `${task._id}-${dateStr}`;
                        const isAnim = animating[key];
                        const isFuture = dateStr > today;
                        const isPast = dateStr < today;
                        const isToday = dateStr === today;
                        return (
                          <td key={i} className="px-2 py-3 text-center">
                            {isFuture ? (
                              <div className="w-8 h-8 flex items-center justify-center mx-auto">
                                <div className="w-3 h-px bg-white/10 rounded-full" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleToggle(task._id, dateStr)}
                                className={`w-8 h-8 rounded-xl transition-all duration-200 text-xs flex items-center justify-center mx-auto
                                  ${isToday ? 'ring-1 ring-red-500/40' : ''}
                                  ${done
                                    ? 'text-white'
                                    : isPast
                                      ? 'border border-white/10 text-transparent hover:border-white/20'
                                      : 'border border-red-900/40 hover:border-red-500 text-transparent hover:text-white/30'
                                  }
                                  ${isAnim ? 'check-pop' : ''}`}
                                style={done ? { backgroundColor: tColor, boxShadow: `0 0 10px ${tColor}` } : {}}>
                                ✓
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-red-400">{pct}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setModal(task)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-500/15 text-gray-500 hover:text-white transition text-xs">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(task._id)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition text-xs">
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
