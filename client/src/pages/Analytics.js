import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  getDailyAnalytics, getHeatmap, getMonthlyAnalytics,
  getStreak, getTasks, getTaskDailyLogs
} from '../api';
import { toDateStr, getDaysInMonth } from '../utils/date';

const RED_PALETTE = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#7f1d1d','#fca5a5','#450a0a'];
const NON_RED = ['6366','818c','a78b','38bd','3b82','60a5','2563','1d4e','06b6','14b8','10b9','22c5','16a3','f59e','d976','ec48','8b5c','0ea5'];
const safeColor = (color, i = 0) => color && NON_RED.some(x => color.includes(x)) ? RED_PALETTE[i % RED_PALETTE.length] : (color || '#dc2626');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── Tooltip ─── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs shadow-2xl" style={{ border: '1px solid rgba(185,28,28,0.4)' }}>
      <p className="text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-bold text-white">{p.value}{p.name?.includes('%') ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Empty ─── */
const Empty = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <p className="text-gray-600 text-sm">No data for this period</p>
  </div>
);

/* ─── Section header ─── */
const SectionHeader = ({ title, sub, dot }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="font-semibold text-gray-200">{title}</h2>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
    {dot && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#dc2626', boxShadow: '0 0 8px rgba(220,38,38,0.8)' }} />}
  </div>
);

/* ─── Heatmap ─── */
function Heatmap({ data, year, month }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, [data]);
  const daysInMonth = getDaysInMonth(year, month);
  const map = {};
  data.forEach(d => { map[d.date] = d.count; });
  const max = Math.max(...data.map(d => d.count), 1);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getStyle = (count) => {
    if (!count) return { background: 'rgba(255,255,255,0.04)' };
    const intensity = count / max;
    const alpha = 0.15 + intensity * 0.85;
    return {
      background: `rgba(220,38,38,${alpha})`,
      boxShadow: intensity > 0.5 ? `0 0 8px rgba(220,38,38,${intensity * 0.6})` : 'none',
    };
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gray-700 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const date = toDateStr(year, month, day);
          const count = map[date] || 0;
          return (
            <div key={date} data-tip={`${date}: ${count} task${count !== 1 ? 's' : ''}`}
              className="tooltip aspect-square rounded-md cursor-default transition-all duration-500"
              style={{ ...getStyle(count), opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.5)', transitionDelay: `${i * 8}ms` }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-gray-600">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <div key={i} className="w-3 h-3 rounded-sm"
            style={{ background: intensity === 0 ? 'rgba(255,255,255,0.04)' : `rgba(220,38,38,${0.15 + intensity * 0.85})` }} />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  );
}

/* ─── Per-task graph card ─── */
function TaskGraph({ task, startDate, endDate, daysInMonth, year, month, index }) {
  const [data, setData] = useState([]);
  const [pct, setPct] = useState(0);
  const color = safeColor(task.color, index);

  useEffect(() => {
    if (!task._id || !startDate || !endDate) return;
    getTaskDailyLogs(task._id, startDate, endDate)
      .then(res => {
        const logMap = res.data;
        const points = Array.from({ length: daysInMonth }, (_, i) => {
          const date = toDateStr(year, month, i + 1);
          return { day: i + 1, done: logMap[date] || 0 };
        });
        setData(points);
        setPct(Math.round((points.filter(p => p.done).length / daysInMonth) * 100));
      })
      .catch(() => setData(Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, done: 0 }))));
  }, [task._id, startDate, endDate, daysInMonth, year, month]);

  const completedCount = data.filter(d => d.done).length;

  return (
    <div className="glass rounded-2xl p-5 glass-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}88` }} />
          <span className="font-semibold text-white text-sm">{task.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{completedCount}/{daysInMonth}d</span>
          <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle cx="24" cy="24" r="18" fill="none"
              stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color}88)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{pct}%</span>
          </div>
        </div>
        <div className="flex-1 h-14">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={4} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="done" radius={[2, 2, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.done ? color : 'rgba(255,255,255,0.06)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex gap-0.5 flex-wrap">
        {data.map((d, i) => (
          <div key={i} data-tip={`Day ${d.day}`} className="tooltip w-4 h-4 rounded-sm transition-all duration-300"
            style={{ backgroundColor: d.done ? color : 'rgba(255,255,255,0.05)', boxShadow: d.done ? `0 0 4px ${color}66` : 'none', transitionDelay: `${i * 20}ms` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function Analytics() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [daily, setDaily] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const daysInMonth = getDaysInMonth(year, month);
  const startDate = toDateStr(year, month, 1);
  const endDate = toDateStr(year, month, daysInMonth);

  useEffect(() => {
    const start = toDateStr(year, month, 1);
    const end = toDateStr(year, month, getDaysInMonth(year, month));
    Promise.all([
      getDailyAnalytics(start, end),
      getHeatmap(start, end),
      getMonthlyAnalytics(month, year),
      getStreak(),
      getTasks(month, year),
    ]).then(([d, h, m, s, t]) => {
      setDaily(d.data.map(item => ({
        ...item,
        date: item.date.slice(5),
        pct: item.total ? Math.round((item.completed / item.total) * 100) : 0,
      })));
      setHeatmap(h.data);
      setMonthly(m.data);
      setStreak(s.data);
      setTasks(t.data);
    }).catch(err => console.error('Analytics fetch error:', err.message));
  }, [month, year]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
  const selectClass = "bg-black/60 border border-white/8 rounded-xl px-3 py-2 text-sm focus:outline-none input-glow text-gray-300";

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'daily',    label: 'Daily' },
    { id: 'monthly',  label: 'Monthly' },
    { id: 'tasks',    label: 'Per Task' },
  ];

  const fullDailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const dateKey = `${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
    return daily.find(d => d.date === dateKey) || { date: dateKey, completed: 0, total: 0, pct: 0 };
  });

  // Red-only palette — override any stored blue/green colors
  const RED_PALETTE = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#fca5a5','#7f1d1d','#450a0a'];
  const safeColor = (color, index) => {
    const blues = ['#6366f1','#4f46e5','#818cf8','#a78bfa','#3b82f6','#60a5fa','#2563eb','#1d4ed8','#38bdf8','#0ea5e9','#06b6d4','#14b8a6','#10b981','#22c55e','#16a34a','#f59e0b','#d97706','#ec4899','#8b5cf6'];
    const isBlue = blues.some(b => color?.toLowerCase().includes(b.toLowerCase().slice(1)));
    return isBlue ? RED_PALETTE[index % RED_PALETTE.length] : color;
  };

  const radialData = monthly.map((t, i) => ({ name: t.title, value: t.percentage, fill: safeColor(t.color, i) }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Analytics</h1>
          <p className="text-gray-600 text-sm mt-1">Visualize your productivity patterns</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClass}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClass}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 fade-in-up-1">
        {[
          { label: 'Current Streak', value: streak.currentStreak, color: '#dc2626', sub: 'days on fire' },
          { label: 'Longest Streak', value: streak.longestStreak, color: '#ef4444', sub: 'personal best' },
        ].map(s => (
          <div key={s.label} className="glass glass-hover rounded-2xl p-4 md:p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20"
              style={{ backgroundColor: s.color }} />
            <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl md:text-5xl font-black mt-1 text-white">{s.value}</p>
            <p className="text-xs mt-0.5" style={{ color: s.color }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-black/50 border border-white/5 rounded-2xl p-1 gap-1 fade-in-up-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300
              ${activeTab === t.id ? 'btn-primary text-white' : 'text-gray-600 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 fade-in-up">
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Overall Completion Rate" sub="Daily % across all tasks" dot />
            {daily.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={fullDailyData}>
                  <defs>
                    <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7f1d1d" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fill: '#4b5563', fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="pct" name="Completion %" stroke="#dc2626" strokeWidth={2.5}
                    fill="url(#ag1)" dot={false} activeDot={{ r: 5, fill: '#dc2626', stroke: '#fca5a5', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Consistency Heatmap" sub="Activity grid — red intensity" />
            <Heatmap data={heatmap} year={year} month={month} />
          </div>
        </div>
      )}

      {/* ── DAILY ── */}
      {activeTab === 'daily' && (
        <div className="space-y-6 fade-in-up">
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Daily Task Completion" sub="Completed vs total tasks per day" />
            {daily.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={fullDailyData} barGap={2} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280', paddingTop: 12 }} />
                  <Bar dataKey="total" name="Total Tasks" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed" fill="url(#bg1)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Daily Completion % Trend" sub="Line view of your daily performance" dot />
            {daily.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={fullDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fill: '#4b5563', fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Line type="monotone" dataKey="pct" name="Completion %" stroke="#f87171" strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f87171', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#f87171', stroke: '#991b1b', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ── MONTHLY ── */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 fade-in-up">
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Monthly Completion by Task" sub="Radial view — each ring is one task" />
            {monthly.length === 0 ? <Empty /> : (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <RadialBarChart innerRadius="20%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.04)' }}
                      label={{ position: 'insideStart', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
                      {radialData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} style={{ filter: `drop-shadow(0 0 6px ${entry.fill}66)` }} />
                      ))}
                    </RadialBar>
                    <Tooltip content={<Tip />} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 min-w-[160px]">
                  {monthly.map((t, i) => {
                    const color = safeColor(t.color, i);
                    return (
                    <div key={t.taskId} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{t.title}</p>
                        <p className="text-[10px] text-gray-600">{t.completedDays}/{t.totalDays} days</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color }}>{t.percentage}%</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Task Completion Breakdown" sub="Progress bars for each task" />
            {monthly.length === 0 ? <Empty /> : (
              <div className="space-y-5">
                {monthly.map((t, i) => {
                  const color = safeColor(t.color, i);
                  return (
                  <div key={t.taskId}>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}88` }} />
                        <span className="text-white font-medium">{t.title}</span>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {t.completedDays}/{t.totalDays}d · <span className="font-bold" style={{ color }}>{t.percentage}%</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full relative overflow-hidden"
                        style={{ width: `${t.percentage}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}44`, transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 120}ms` }}>
                        <div className="absolute inset-0 opacity-40"
                          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)', animation: 'shimmer 2s infinite' }} />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {monthly.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <SectionHeader title="All Tasks — Completed vs Total Days" sub="Side-by-side comparison" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthly.map(t => ({ name: t.title.length > 10 ? t.title.slice(0,10)+'…' : t.title, completed: t.completedDays, total: t.totalDays, color: t.color }))}
                  barGap={4} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280', paddingTop: 12 }} />
                  <Bar dataKey="total" name="Total Days" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]} />
                  <Bar dataKey="completed" name="Completed" radius={[4,4,0,0]}>
                    {monthly.map((t, i) => (
                      <Cell key={i} fill={safeColor(t.color, i)} style={{ filter: `drop-shadow(0 0 4px ${safeColor(t.color, i)}66)` }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── PER TASK ── */}
      {activeTab === 'tasks' && (
        <div className="fade-in-up">
          {tasks.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-500">No tasks found for {MONTHS[month - 1]} {year}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-xs mb-4">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {MONTHS[month - 1]} {year}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task, i) => (
                  <TaskGraph key={task._id} task={task} startDate={startDate} endDate={endDate}
                    daysInMonth={daysInMonth} year={year} month={month} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
