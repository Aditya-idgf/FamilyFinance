import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarRange,
  LogOut,
  Wallet,
  Users,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/budget-setup', icon: CalendarRange, label: 'Budget Setup' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Layout() {
  const { userProfile, logout } = useAuth();
  const { family, members } = useFamily();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate a consistent color for member avatars based on name
  const getAvatarColor = (name) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-red-500',
      'from-violet-500 to-indigo-500',
      'from-lime-500 to-green-500',
      'from-fuchsia-500 to-purple-500',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64
        bg-[#0e0e16]/95 backdrop-blur-xl border-r border-white/5
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo — Objective 3: Bigger logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">FamilyFinance</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Objective 6: Family member list (WhatsApp/Discord style) */}
        {family && (
          <div className="mx-4 mb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-semibold truncate">{family.name}</span>
              </div>
              {/* Member list */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(member.name)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-gray-300 text-xs font-medium truncate">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/5">
          <div
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 -m-1.5 transition-colors"
            onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {userProfile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userProfile?.name || 'User'}</p>
              <p className="text-gray-500 text-xs truncate">{userProfile?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 justify-start cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) — Objective 3: Bigger logo on mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-base">FamilyFinance</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
