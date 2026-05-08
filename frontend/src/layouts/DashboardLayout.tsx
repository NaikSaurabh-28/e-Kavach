import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, FileText, ShieldAlert, Settings, LogOut, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: UploadCloud, label: 'e-File Document', path: '/dashboard/upload' },
    { icon: FileText, label: 'Case Status', path: '/dashboard/status' },
    { icon: ShieldAlert, label: 'Threat Analysis', path: '/dashboard/threats' },
  ];

  return (
    <div className="flex h-screen bg-government-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-government-blue text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Scale className="w-6 h-6 mr-3" />
          <span className="font-semibold text-lg tracking-wide">e-Courts Portal</span>
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
          <h1 className="text-xl font-semibold text-government-text">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-medium text-government-text">Welcome, Advocate</p>
              <p className="text-government-muted text-xs">ID: ADV-2023-8891</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-government-blue/10 flex items-center justify-center text-government-blue font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
