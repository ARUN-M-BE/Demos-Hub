import React from 'react';
import { useStore } from '../store';
import { Menu, Sun, Moon, User, Flower, Activity, Eye, FileSearch, ShieldCheck, TrendingUp, Truck, Zap, BookOpen, LayoutDashboard } from 'lucide-react';
import { Agent } from '../types';

export const AGENTS: Agent[] = [
  { id: 'flower', title: 'Flower Market Vision', description: 'Visual identification & pricing', icon: Flower, color: 'text-pink-500', path: '#flower' },
  { id: 'disaster', title: 'Disaster Prediction', description: 'Real-time alert analysis', icon: Activity, color: 'text-red-500', path: '#disaster' },
  { id: 'asphalt', title: 'Asphalt Quality', description: 'Surface integrity inspection', icon: Truck, color: 'text-slate-600', path: '#asphalt' },
  { id: 'medical', title: 'Medical Imaging', description: 'Explainable AI diagnostics', icon: Eye, color: 'text-blue-500', path: '#medical' },
  { id: 'financial', title: 'Financial Crime', description: 'Graph fraud detection', icon: FileSearch, color: 'text-green-600', path: '#financial' },
  { id: 'logistics', title: 'Logistics Optimizer', description: 'Route & timeline planning', icon: TrendingUp, color: 'text-orange-500', path: '#logistics' },
  { id: 'energy', title: 'Energy Theft', description: 'Usage pattern anomalies', icon: Zap, color: 'text-yellow-500', path: '#energy' },
  { id: 'education', title: 'Inspirational Education', description: 'Career path scripting', icon: BookOpen, color: 'text-indigo-500', path: '#education' },
  { id: 'security', title: 'Cybersecurity Defense', description: 'Log analysis & mitigation', icon: ShieldCheck, color: 'text-emerald-500', path: '#security' },
];

export const Layout: React.FC<{ children: React.ReactNode, currentPath: string }> = ({ children, currentPath }) => {
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useStore();
  
  return (
    <div className={`min-h-screen flex ${theme}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 z-30 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Agent Hub</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <a href="#/" 
             className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPath === '' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}>
             <LayoutDashboard className="w-5 h-5" />
             Dashboard
          </a>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Domains</div>
          {AGENTS.map((agent) => (
            <a 
              key={agent.id} 
              href={agent.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentPath === agent.path.replace('#', '') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              <agent.icon className={`w-5 h-5 ${agent.color}`} />
              {agent.title}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
           <div className="flex items-center gap-4">
               <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                 <Menu className="w-6 h-6" />
               </button>
               
               <div className="hidden md:flex items-center text-sm breadcrumbs text-slate-500">
                  <span className="hover:text-slate-800 dark:hover:text-white cursor-pointer" onClick={() => window.location.hash = ''}>Home</span>
                  {currentPath && (
                      <>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-slate-900 dark:text-white">{AGENTS.find(a => a.id === currentPath)?.title}</span>
                      </>
                  )}
               </div>
           </div>

           <div className="flex items-center gap-4">
                {/* User Profile */}
               <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                   <div className="text-right hidden sm:block">
                       <p className="text-sm font-medium leading-none">Admin User</p>
                       <p className="text-xs text-slate-500 mt-1">admin@ai-hub.dev</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                       <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                   </div>
               </div>

               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
               </button>
           </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};