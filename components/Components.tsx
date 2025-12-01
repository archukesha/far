
import React from 'react';
import { Home, Calendar as CalIcon, PlusCircle, BarChart2, Lightbulb } from 'lucide-react';
import { haptic } from '../utils';

// --- Layout Wrapper ---
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg ${className}`}
  >
    {children}
  </div>
);

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const baseStyle = "w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-primary to-rose-400 text-white shadow-md shadow-rose-200",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-white/30"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      onClick={(e) => {
        if (!isLoading) {
            haptic.impact('light');
            props.onClick?.(e);
        }
      }}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

// --- Floating Dock Navigation ---
interface DockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FloatingDock: React.FC<DockProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'calendar', icon: CalIcon, label: 'Календарь' },
    { id: 'log', icon: PlusCircle, label: 'Дневник', main: true },
    { id: 'insights', icon: BarChart2, label: 'Анализ' },
    { id: 'advice', icon: Lightbulb, label: 'Советы' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl px-2 py-3 flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          if (tab.main) {
             return (
                 <button
                    key={tab.id}
                    onClick={() => {
                        haptic.impact('medium');
                        onTabChange(tab.id);
                    }}
                    className={`
                        relative -top-6 bg-gradient-to-tr from-primary to-secondary
                        p-4 rounded-full shadow-xl shadow-primary/30 transform transition-transform hover:scale-110 active:scale-95
                        border-4 border-[#FDF2F8]
                    `}
                 >
                     <PlusCircle size={32} color="white" />
                 </button>
             )
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                  haptic.selection();
                  onTabChange(tab.id);
              }}
              className={`flex flex-col items-center gap-1 px-3 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <span className="w-1 h-1 bg-primary rounded-full mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Bottom Sheet Modal ---
interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-t-[2rem] w-full max-w-md p-6 relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
                {title && <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>}
                <div className="max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
                    {children}
                </div>
            </div>
        </div>
    )
}
