import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  dark?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, dark, className = '', ...props }) => {
  const baseClasses = "w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 ease-in-out";
  
  // Conditionally apply dark mode styles
  const themeClasses = dark 
    ? "bg-slate-900 text-white border-slate-700 placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-600" 
    : "bg-white text-gray-900 border-gray-200 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300";

  // Error border overrides other borders
  const borderColor = error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : '';

  return (
    <div className="w-full group">
      {/* Label is always dark (gray-900) to ensure visibility on the white card background */}
      <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-indigo-600 transition-colors">
        {label}
      </label>
      <input
        className={`${baseClasses} ${themeClasses} ${borderColor} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500 animate-pulse">{error}</p>}
    </div>
  );
};