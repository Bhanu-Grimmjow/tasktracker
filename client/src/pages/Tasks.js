import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getLogs, toggleLog } from '../api';
import { getDaysInMonth, toDateStr } from '../utils/date';
import toast from 'react-hot-toast';

const RED_PALETTE = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#7f1d1d','#fca5a5','#450a0a'];
const NON_RED = ['6366','818c','a78b','38bd','3b82','60a5','2563','1d4e','06b6','14b8','10b9','22c5','16a3','f59e','d976','ec48','8b5c','0ea5'];
const safeColor = (color, i = 0) => color && NON_RED.some(x => color.includes(x)) ? RED_PALETTE[i % RED_PALETTE.length] : (color || '#dc2626');

const COLORS = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#fca5a5','#7f1d1d','#450a0a'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function TaskModal({ task, onSave, onClose, month, year }) {
  const [form, setForm] = useState(task || { title: '', description: '', color: COLORS[0], month, year });
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
          <h2 className="text-lg font-black text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 mb-1.5 block uppercase tracking-wider">Task Title</label>
            <input
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm input-glow placeholder-gray-700 text-white"
              placeholder="e.g. Morning workout"
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
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {saving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
          <div className="w-32 h-4 shimmer rounded-lg" />
          <div className="flex gap-1 flex-1">
            {Array.from({length: 15}, (_, j) => <div key={j} className="w-6 h-6 shimmer rounded-md" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Tasks() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState({});
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState({});

  const daysInMonth = getDaysInMonth(year, month);
  const today = now.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = toDateStr(year, month, 1);
    const endDate = toDateStr(year, month, daysInMonth);
    const [t, l] = await Promise.all([getTasks(month, year), getLogs({ startDate, endDate })]);
    setTasks(t.data);
    const logMap = {};
    l.data.forEach(log => { logMap[`${log.task._id || log.task}-${log.date}`] = log.completed; });
    setLogs(logMap);
    setLoading(false);
  }, [month, year, daysInMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (form) => {
    try {
      if (form._id) { await updateTask(form._id, form); toast.success('Task updated'); }
      else { await createTask({ ...form, month, year }); toast.success('Task created 🔥'); }
      setModal(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task and all its logs?')) return;
    await deleteTask(id);
    toast.success('Task deleted');
    fetchData();
  };

  const handleToggle = async (taskId, day) => {
    const date = toDateStr(year, month, day);
    if (date !== today) return;
    const key = `${taskId}-${date}`;
    const current = logs[key] || false;
    setLogs(prev => ({ ...prev, [key]: !current }));
    setAnimating(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAnimating(prev => ({ ...prev, [key]: false })), 300);
    try {
      await toggleLog({ taskId, date, completed: !current });
    } catch {
      setLogs(prev => ({ ...prev, [key]: current }));
      toast.error('Failed to update');
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {modal && <TaskModal task={modal === 'new' ? null : modal} month={month} year={year} onSave={handleSave} onClose={() => setModal(null)} />}

      <div className="flex flex-col gap-3 fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Tasks</h1>
            <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest">Plan and track daily</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none input-glow text-white">
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none input-glow text-white">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => setModal('new')}
              className="btn-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {loading ? <LoadingSkeleton /> : tasks.length === 0 ? (
        <div className="glass rounded-2xl flex flex-col items-center justify-center py-24 text-center fade-in-up">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 float"
            style={{ background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)' }}>
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-white font-bold text-lg">No tasks for {MONTHS[month - 1]} {year}</p>
          <p className="text-gray-600 text-sm mt-1 mb-5">Start building your discipline</p>
          <button onClick={() => setModal('new')} className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            + Add your first task
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
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const d = toDateStr(year, month, i + 1);
                    const isToday = d === today;
                    const isPast = d < today;
                    return (
                      <th key={i} className={`px-1 py-4 text-center font-medium min-w-[32px] text-xs
                        ${isToday ? 'text-red-400' : isPast ? 'text-gray-700' : 'text-gray-800'}`}>
                        {isToday ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                            {i + 1}
                          </span>
                        ) : i + 1}
                      </th>
                    );
                  })}
                  <th className="px-4 py-4 text-gray-500 font-medium text-right min-w-[50px]">Done</th>
                  <th className="px-4 py-4 min-w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, taskIdx) => {
                  const tColor = safeColor(task.color, taskIdx);
                  const completed = Array.from({ length: daysInMonth }, (_, i) =>
                    logs[`${task._id}-${toDateStr(year, month, i + 1)}`] || false
                  );
                  const pct = Math.round((completed.filter(Boolean).length / daysInMonth) * 100);
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
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const date = toDateStr(year, month, day);
                        const done = completed[i];
                        const key = `${task._id}-${date}`;
                        const isAnim = animating[key];
                        const isToday = date === today;
                        const isPast = date < today;
                        const isFuture = date > today;
                        return (
                          <td key={i} className="px-1 py-3 text-center">
                            {isFuture ? (
                              <div className="w-6 h-6 flex items-center justify-center mx-auto">
                                <div className="w-3 h-px bg-white/10 rounded-full" />
                              </div>
                            ) : isPast ? (
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto text-xs opacity-35
                                  ${done ? 'text-white' : 'border border-white/10 text-transparent'}`}
                                style={done ? { backgroundColor: tColor } : {}}>
                                ✓
                              </div>
                            ) : (
                              <button onClick={() => handleToggle(task._id, day)}
                                className={`w-6 h-6 rounded-md transition-all duration-200 text-xs flex items-center justify-center mx-auto
                                  ring-1 ring-red-500/40
                                  ${done ? 'text-white' : 'border border-red-900/40 hover:border-red-500 text-transparent hover:text-white/30'}
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
