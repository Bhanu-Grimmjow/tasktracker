import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import FlameLogo from './FlameLogo';

const pageTitles = { '/': 'Dashboard', '/tasks': 'Tasks', '/analytics': 'Analytics', '/weekly': 'Weekly' };

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
          style={{ background: 'rgba(10,4,4,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-white transition"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <FlameLogo className="w-5 h-5" />
          <span className="font-display text-base font-bold text-white tracking-widest">OBSESSION</span>
          <span className="ml-auto text-xs text-gray-600 font-medium">{pageTitles[location.pathname]}</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
