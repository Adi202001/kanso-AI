
import React from 'react';
import { Compass, Map, Home, User, Wind } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.HOME, label: 'Home', icon: Home },
    { id: AppView.PLANNER, label: 'Plan', icon: Compass },
    { id: AppView.EXPLORE, label: 'Explore', icon: Map },
    { id: AppView.PROFILE, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto z-50 bg-white/80 backdrop-blur-md border-t md:border-t-0 md:border-b border-stone-200 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 no-print">
      <div 
        className="hidden md:flex items-center gap-3 cursor-pointer group" 
        onClick={() => setView(AppView.HOME)}
      >
        <div className="w-8 h-8 bg-stone-900 text-stone-50 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
           <Wind size={16} strokeWidth={1.5} />
        </div>
        <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">Kanso</span>
      </div>
      
      <div className="flex w-full md:w-auto justify-around md:gap-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all duration-200 active:scale-90 ${isActive ? 'text-stone-900 font-medium translate-y-[-2px]' : 'text-stone-400 hover:text-stone-600 hover:translate-y-[-1px]'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className="transition-all" />
              <span className={`text-[10px] md:text-xs tracking-widest uppercase ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
