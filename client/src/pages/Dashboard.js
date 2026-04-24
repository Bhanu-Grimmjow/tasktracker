import { useEffect, useState } from 'react';
import { getTasks, getLogs, getStreak, getMonthlyAnalytics } from '../api';
import { format } from '../utils/date';
import { getDailyQuote } from '../utils/quotes';

const RED_PALETTE = ['#dc2626','#ef4444','#b91c1c','#f87171','#991b1b','#7f1d1d','#fca5a5','#450a0a'];
const NON_RED = ['6366','818c','a78b','38bd','3b82','60a5','2563','1d4e','06b6','14b8','10b9','22c5','16a3','f59e','d976','ec48','8b5c','0ea5'];
const safeColor = (color, i = 0) => color && NON_RED.some(x => color.includes(x)) ? RED_PALETTE[i % RED_PALETTE.length] : (color || '#dc2626');


function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, sub, icon, delay }) {
  const numericVal = parseInt(value) || 0;
  const animated = useCountUp(numericVal);
  const display = typeof value === 'string' && value.includes('%') ? `${animated}%`
    : typeof value === 'string' && value.includes('d') ? `${animated}d` : animated;

  return (
    <div className={`card rounded-2xl p-4 md:p-5 fade-in-up-${delay}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400"
          style={{ background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(220,38,38,0.18)' }}>
          {icon}
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-red-700 mt-1" />
      </div>
      <p className="text-2xl md:text-3xl font-black text-white num-glow count-up tracking-tight">{display}</p>
      <p className="text-xs text-gray-400 mt-1.5 font-medium">{label}</p>
      <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
    </div>
  );
}

function ProgressBar({ percentage, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 200 + delay);
    return () => clearTimeout(t);
  }, [percentage, delay]);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${width}%`, background: color, boxShadow: `0 0 10px ${color}66` }} />
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [monthly, setMonthly] = useState([]);
  const today = now.toISOString().split('T')[0];
  const q = getDailyQuote();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const todayStr = new Date().toISOString().split('T')[0];
    Promise.all([
      getTasks(month, year),
      getLogs({ startDate: todayStr, endDate: todayStr }),
      getStreak(),
      getMonthlyAnalytics(month, year),
    ]).then(([t, l, s, m]) => {
      setTasks(t.data); setLogs(l.data); setStreak(s.data); setMonthly(m.data);
    });
  }, []);

  const completedToday = logs.filter(l => l.completed).length;
  const totalToday = tasks.length;
  const todayPct = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;

  const stats = [
    { label: "Today's Progress", value: `${todayPct}%`, sub: `${completedToday} of ${totalToday} tasks`, delay: 1,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
    { label: 'Current Streak', value: `${streak.currentStreak}d`, sub: 'consecutive days', delay: 2,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> },
    { label: 'Longest Streak', value: `${streak.longestStreak}d`, sub: 'personal best', delay: 3,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg> },
    { label: 'Tasks This Month', value: tasks.length, sub: format(now, 'MMMM yyyy'), delay: 4,
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in-up">
        <h1 className="text-3xl font-bold text-white">{greeting} 🔥</h1>
        <p className="text-gray-500 text-sm mt-1">{format(now, 'EEEE, MMMM d, yyyy')}</p>
        {/* Quote */}
        <div className="quote-bar mt-4 px-4 py-3 rounded-r-xl">
          <p className="text-sm text-gray-400 italic break-words">"{q.text}"</p>
          <p className="text-xs text-red-800 mt-1.5 font-semibold">— {q.author}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Ring + Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ring */}
        <div className="card rounded-2xl p-6 flex flex-col items-center justify-center fade-in-up-2 md:col-span-1">
          <p className="text-xs text-gray-500 mb-5 font-semibold tracking-wider uppercase">Today's Completion</p>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r="50" fill="none"
                stroke="#dc2626" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - todayPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: 'drop-shadow(0 0 12px rgba(220,38,38,0.7))' }}
              />
              <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(220,38,38,0.06)" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white num-glow">{todayPct}</span>
              <span className="text-xs text-red-600 font-bold tracking-widest">%</span>
              <span className="text-xs text-gray-600 mt-1">{completedToday}/{totalToday}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-5 text-center font-medium">
            {todayPct === 100 ? '🔥 All done today!' : todayPct > 50 ? '⚡ More than halfway!' : '💪 Keep going!'}
          </p>
        </div>

        {/* Monthly progress */}
        <div className="card rounded-2xl p-6 md:col-span-2 fade-in-up-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-white">Monthly Progress</h2>
            <span className="text-xs text-gray-600 px-3 py-1 rounded-lg font-medium"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {format(now, 'MMMM yyyy')}
            </span>
          </div>
          {monthly.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}>
                <svg className="w-6 h-6 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No tasks yet</p>
              <p className="text-gray-700 text-xs mt-1">Add tasks to track your progress</p>
            </div>
          ) : (
            <div className="space-y-5">
              {monthly.map((t, i) => {
                const color = safeColor(t.color, i);
                return (
                  <div key={t.taskId}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                        <span className="text-sm text-white font-medium">{t.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {t.completedDays}/{t.totalDays}d · <span className="font-semibold" style={{ color }}>{t.percentage}%</span>
                      </span>
                    </div>
                    <ProgressBar percentage={t.percentage} color={color} delay={i * 150} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
