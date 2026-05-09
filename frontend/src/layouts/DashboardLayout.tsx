import { useState, useEffect } from 'react';
import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileText, ShieldAlert, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'Advocate' | 'Clerk'>('Advocate');
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const user = localStorage.getItem('current_user');
    if (user) {
      setUsername(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    // We do NOT remove 'ekavach_user' so credentials stay saved for the login page
  };
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UploadCloud, label: 'Upload', path: '/dashboard/upload' },
    { icon: ShieldAlert, label: 'Reports', path: '/dashboard/reports' },
    { icon: FileText, label: 'History', path: '/dashboard/history' },
  ];

  return (
    <div className="flex h-screen bg-government-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-government-blue text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Shield className="w-6 h-6 mr-3 text-blue-300" />
          <span className="font-bold text-lg tracking-wide">e-Kavach</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-blue-100 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/dashboard/settings"
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 rounded-md hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </NavLink>
          <NavLink
            to="/"
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 rounded-md hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-government-accent flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-government-blue" />
            <h1 className="text-lg font-bold text-government-blue">e-Kavach</h1>
            <span className="text-government-muted text-sm">— Secure Document Scanner</span>
          </div>
          <div className="flex items-center space-x-6">
            
            {/* Role Selector */}
            <div className="flex items-center space-x-2 border border-government-accent bg-government-bg px-3 py-1.5 rounded-md">
              <span className="text-xs font-medium text-government-muted uppercase tracking-wider">Role:</span>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as 'Advocate' | 'Clerk')}
                className="text-sm font-semibold text-government-blue bg-transparent focus:outline-none cursor-pointer appearance-none pr-4 relative"
              >
                <option value="Advocate">Advocate</option>
                <option value="Clerk">Clerk</option>
              </select>
              <ChevronDown className="w-4 h-4 text-government-muted -ml-4 pointer-events-none" />
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-right">
                <p className="font-medium text-government-text">Welcome, {username}</p>
                <p className="text-government-muted text-xs">ID: {role === 'Advocate' ? 'ADV-2023-8891' : 'CLK-009-122'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-government-blue/10 flex items-center justify-center text-government-blue font-bold uppercase">
                {username.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-government-bg">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
