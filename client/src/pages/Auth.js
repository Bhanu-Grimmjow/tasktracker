import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, signup as signupApi } from '../api';
import { useAuth } from '../context/AuthContext';
import FlameLogo from '../components/FlameLogo';
import toast from 'react-hot-toast';
import { getDailyQuote } from '../utils/quotes';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const q = getDailyQuote();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = isLogin
        ? await loginApi({ email: form.email, password: form.password })
        : await signupApi(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (name) =>
    `w-full input-field rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 transition-all duration-200
    ${focused === name ? 'border-red-600/60 bg-white/6 shadow-[0_0_0_3px_rgba(185,28,28,0.12)]' : ''}`;

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0a0a]">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative p-14 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f0303 0%, #0a0a0a 100%)' }} />
        <div className="absolute inset-0 orb" style={{ background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(185,28,28,0.18), transparent)' }} />
        <div className="absolute inset-0 orb-2" style={{ background: 'radial-gradient(ellipse 50% 40% at 80% 80%, rgba(127,29,29,0.1), transparent)' }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />
        {/* Right edge fade */}
        <div className="absolute top-0 right-0 w-32 h-full" style={{ background: 'linear-gradient(90deg, transparent, #0a0a0a)' }} />

        {/* Top */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-red-600/70 text-xs font-semibold tracking-[0.2em] uppercase">Obsession · Daily Tracker</span>
        </div>

        {/* Center */}
        <div className="relative z-10">
          <div className="float mb-10">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(185,28,28,0.2), rgba(127,29,29,0.1))', border: '1px solid rgba(220,38,38,0.35)', boxShadow: '0 0 60px rgba(185,28,28,0.25), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              <FlameLogo className="w-11 h-11" />
            </div>
          </div>
          <h1 className="font-display text-7xl font-bold text-white leading-none tracking-wide mb-3">
            OBSES<br />SION
          </h1>
          <div className="red-divider w-24 mb-6" />
          <blockquote className="max-w-xs">
            <p className="text-gray-400 text-sm leading-relaxed italic">"{q.text}"</p>
            <p className="text-red-700 text-xs mt-2 font-semibold tracking-wider">— {q.author}</p>
          </blockquote>
        </div>

        {/* Bottom features */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '⚡', text: 'Track every single day' },
            { icon: '🔥', text: 'Build unbreakable streaks' },
            { icon: '📊', text: 'Visualize your progress' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm">{f.icon}</span>
              <span className="text-gray-500 text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute top-0 left-0 right-0 h-px red-divider" />

        <div className="relative w-full max-w-sm fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 float"
              style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(220,38,38,0.4)', boxShadow: '0 0 40px rgba(185,28,28,0.3)' }}>
              <FlameLogo className="w-8 h-8" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-wide">OBSESSION</h1>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isLogin ? 'Welcome back' : 'Start your journey'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Your discipline awaits.' : 'Build the habit. Become unstoppable.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white/4 rounded-xl p-1 mb-8 border border-white/6">
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button key={tab} onClick={() => setIsLogin(i === 0)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-250
                  ${(i === 0) === isLogin
                    ? 'btn-primary text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="fade-in-up">
                <label className="text-xs text-gray-500 mb-2 block font-medium tracking-wide">Full Name</label>
                <input className={inputCls('name')} placeholder="Your name"
                  value={form.name} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium tracking-wide">Email</label>
              <input className={inputCls('email')} type="email" placeholder="you@example.com"
                value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block font-medium tracking-wide">Password</label>
              <input className={inputCls('password')} type="password" placeholder="••••••••"
                value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary text-white font-bold py-3.5 rounded-xl mt-2 disabled:opacity-50 flex items-center justify-center gap-2 text-sm tracking-wide">
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Loading...</>
                : isLogin ? 'Enter the Arena →' : 'Begin the Journey →'
              }
            </button>
          </form>

          <p className="text-center text-gray-700 text-xs mt-8">
            No excuses · No shortcuts · No limits
          </p>
        </div>
      </div>
    </div>
  );
}
