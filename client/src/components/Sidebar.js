import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlameLogo from './FlameLogo';
import { getQuotes } from '../utils/quotes';

const navItems = [
  { to: '/', label: 'Dashboard', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>)},
  { to: '/tasks', label: 'Tasks', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>)},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>)},
  { to: '/weekly', label: 'Weekly', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>)},
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarQuote = getQuotes(1, 7)[0];
  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(180deg, #0d0404 0%, #0a0a0a 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Top red line */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #dc2626, rgba(220,38,38,0.3), transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, rgba(185,28,28,0.2), rgba(127,29,29,0.1))', border: '1px solid rgba(220,38,38,0.3)', boxShadow: '0 0 20px rgba(185,28,28,0.2)' }}>
            <FlameLogo className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white tracking-widest">OBSESSION</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <p className="text-[9px] text-gray-600 tracking-widest uppercase font-medium">Daily Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-[9px] text-gray-700 uppercase tracking-[0.25em] px-3 mb-3 font-semibold">Navigation</p>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive ? 'nav-active text-white' : 'text-gray-500 hover:text-white hover:bg-white/4'}`
              }>
              {({ isActive }) => (<>
                <span className={`transition-colors ${isActive ? 'text-red-400' : 'text-gray-600 group-hover:text-gray-300'}`}>{icon}</span>
                <span className="flex-1">{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-lg shadow-red-500/60 animate-pulse" />}
              </>)}
            </NavLink>
          ))}

          {/* Quote */}
          <div className="mt-6 mx-1 p-4 rounded-xl" style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(220,38,38,0.1)' }}>
            <p className="text-[10px] text-red-800/80 leading-relaxed italic">
              "{sidebarQuote.text}"
            </p>
            <p className="text-[9px] text-red-900/60 mt-1.5 font-semibold">— {sidebarQuote.author}</p>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{ background: 'rgba(185,28,28,0.07)', border: '1px solid rgba(220,38,38,0.12)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', boxShadow: '0 0 12px rgba(185,28,28,0.4)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
