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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={onNavigateHome}
            >
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <MonitorPlay className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 tracking-tight">
                EduStream<span className="text-indigo-600">AI</span>
              </span>
            </div>

            {/* User Nav */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <UserCircle className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="hidden sm:block">{user.username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <span className="text-sm text-gray-500">Guest Access</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EduStream AI. Powered by Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};
