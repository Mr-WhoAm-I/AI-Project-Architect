import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const DashboardCard: React.FC<Props> = ({ title, subtitle, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="animate-slide-in bg-surface/60 backdrop-blur-md rounded-2xl border border-borderCol overflow-hidden shadow-sm transition-all duration-300 hover:shadow-primary/10">
      <div 
        className="p-4 border-b border-borderCol bg-surface/50 flex justify-between items-center cursor-pointer select-none hover:bg-surface/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-primary" />}
          <div>
             <h2 className="font-bold text-textMain text-lg">{title}</h2>
             {subtitle && <p className="text-xs text-textMuted">{subtitle}</p>}
          </div>
        </div>
        <button className="text-textMuted hover:text-textMain transition-colors">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
};