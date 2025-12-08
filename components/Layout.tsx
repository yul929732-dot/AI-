
import React from 'react';
import { User } from '../types';
import { LogOut, MonitorPlay, UserCircle } from 'lucide-react';
import { Button } from './Button';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigateHome }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Animated Liquid Background - Enhanced Colors for Glass Effect */}
      <div className="fixed inset-0 z-0 bg-[#f0f4f8] pointer-events-none">
        <div className="blob bg-purple-300 w-[500px] h-[500px] top-[-100px] left-[-100px] animate-delay-0 opacity-60"></div>
        <div className="blob bg-blue-300 w-[400px] h-[400px] bottom-[-50px] right-[-50px] animate-delay-2000 opacity-60"></div>
        <div className="blob bg-indigo-200 w-[300px] h-[300px] top-[30%] right-[20%] animate-delay-4000 opacity-50"></div>
        <div className="blob bg-pink-200 w-[250px] h-[250px] bottom-[20%] left-[10%] animate-delay-1000 opacity-50"></div>
      </div>

      <header className="sticky top-0 z-50 glass-panel border-b-0 rounded-b-3xl mx-2 mt-2 sm:mx-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={onNavigateHome}
            >
              <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-300/50 group-hover:scale-105 transition-all duration-300">
                <MonitorPlay className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 tracking-tight">
                HITEDU
              </span>
            </div>

            {/* User Nav */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center text-sm font-semibold text-slate-700 glass-card px-4 py-1.5 rounded-full border border-white/60 shadow-sm">
                    <UserCircle className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>{user.username}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {user.role === 'teacher' ? '教师' : '学生'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    退出
                  </Button>
                </>
              ) : (
                <span className="text-sm font-medium text-slate-500 glass-card px-4 py-1.5 rounded-full">游客访问</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 glass-panel border-t-0 rounded-t-3xl mx-2 mb-2 sm:mx-6 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
            &copy; {new Date().getFullYear()} HITEDU. <span className="w-1 h-1 rounded-full bg-slate-300"></span> Designed with Liquid Glass UI
          </p>
        </div>
      </footer>
    </div>
  );
};
