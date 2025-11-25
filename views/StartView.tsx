import React, { useState } from 'react';
import { Send, Sparkles, Menu } from 'lucide-react';

interface Props {
  onNext: (idea: string) => void;
  isLoading: boolean;
  onToggleSidebar?: () => void;
}

export const StartView: React.FC<Props> = ({ onNext, isLoading, onToggleSidebar }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onNext(idea);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Menu Button - Absolute Top Left */}
      {onToggleSidebar && (
        <button 
            onClick={onToggleSidebar}
            className="absolute top-0 left-0 p-2 hover:bg-surface border border-transparent hover:border-borderCol rounded-lg text-textMuted hover:text-textMain transition-all z-20"
        >
            <Menu size={24} />
        </button>
      )}

      <div className="flex flex-col h-full justify-end pb-8">
        {/* Welcome Message */}
        <div className="flex flex-col items-center justify-center flex-grow opacity-60">
            <div className="bg-surface p-6 rounded-2xl mb-6 flex flex-col items-center border border-borderCol shadow-lg">
                <Sparkles className="text-secondary w-10 h-10 mb-3" />
                <p className="text-center text-textMuted max-w-sm">
                    Привет! Я ваш AI-архитектор. Опишите идею вашего приложения, и я создам для него структуру, дизайн и план разработки.
                </p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
            <input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Опишите вашу идею..."
            className="w-full bg-surface border border-borderCol rounded-full py-4 pl-6 pr-14 text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xl transition-all"
            disabled={isLoading}
            autoFocus
            />
            <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/80 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50"
            >
            <Send size={18} />
            </button>
        </form>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button type="button" onClick={() => setIdea('Расслабляющий тайкун. Управляй горячими источниками для капибар, выращивай юзу и строй бассейны.')} className="text-xs bg-surface border border-borderCol px-3 py-1 rounded-full text-textMuted hover:text-textMain hover:border-primary transition-colors">
            🛁 Capybara Spa Tycoon
            </button>
            <button type="button" onClick={() => setIdea('Airbnb для рабочих мест. Сдай свой пустующий стол дома удаленщику на пару часов в день.')} className="text-xs bg-surface border border-borderCol px-3 py-1 rounded-full text-textMuted hover:text-textMain hover:border-primary transition-colors">
            🪑 Rent-a-Desk
            </button>
            <button type="button" onClick={() => setIdea('Симулятор автомеханика в российской глубинке')} className="text-xs bg-surface border border-borderCol px-3 py-1 rounded-full text-textMuted hover:text-textMain hover:border-primary transition-colors">
            🏎️ Гараж: Батя
            </button>
        </div>
      </div>
    </div>
  );
};