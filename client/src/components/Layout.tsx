import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, FileBarChart } from 'lucide-react';
import { format } from 'date-fns';

const navItems = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Attendance', Icon: ClipboardList, end: false },
  { to: '/children', label: 'Children', Icon: Users, end: false },
  { to: '/reports', label: 'Reports', Icon: FileBarChart, end: false },
];

export const Layout: React.FC = () => {
  const today = format(new Date(), 'EEEE, d MMMM yyyy');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm select-none">
              C
            </div>
            <div>
              <h1 className="font-semibold text-slate-800 leading-tight">Crèche Attendance</h1>
              <p className="text-xs text-slate-400 leading-tight hidden sm:block">{today}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 sm:hidden">{format(new Date(), 'd MMM yyyy')}</p>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        Crèche Attendance Registry
      </footer>
    </div>
  );
};
