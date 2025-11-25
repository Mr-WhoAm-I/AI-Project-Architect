import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { Bot, User, Loader2, Send, Menu } from 'lucide-react';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  typingStep?: string;
  onSendMessage: (text: string) => void;
  activeAgentsCount: number; // 1, 2, or 3
  onToggleSidebar?: () => void;
}

const agents = [
    { id: 1, name: 'Project Manager', role: 'Координатор', desc: 'Управляет процессом и распределяет задачи.' },
    { id: 2, name: 'Analyst', role: 'Аналитик', desc: 'Формулирует требования и анализирует рынок.' },
    { id: 3, name: 'Architect', role: 'Архитектор', desc: 'Проектирует технический стек и базы данных.' },
    { id: 4, name: 'Planner', role: 'Планнер', desc: 'Строит Roadmap и оценивает риски.' },
];

export const ChatPanel: React.FC<Props> = ({ messages, isLoading, typingStep, onSendMessage, activeAgentsCount, onToggleSidebar }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getAgentDescription = (name?: string) => {
      if (!name) return 'AI Assistant';
      // Try to match exact or partial name
      const agent = agents.find(a => name.includes(a.name) || name.includes(a.role));
      return agent ? agent.desc : 'AI Team Member';
  };

  return (
    <div className="flex flex-col h-full bg-dark border-r border-borderCol transition-colors duration-500">
      {/* Header */}
      <div className="p-4 border-b border-borderCol bg-dark/95 backdrop-blur z-30 sticky top-0 shadow-sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-textMain text-sm">AI Team</h2>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] text-textMuted uppercase font-medium tracking-wide">
                            {activeAgentsCount} Online
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Menu Button Integrated */}
            {onToggleSidebar && (
                <button 
                    onClick={onToggleSidebar}
                    className="p-2 hover:bg-surface border border-transparent hover:border-borderCol rounded-lg text-textMuted hover:text-textMain transition-all"
                >
                    <Menu size={20} />
                </button>
            )}
        </div>

        {/* Active Agents Icons Row - WRAPPED to prevent clipping tooltips */}
        <div className="flex flex-wrap gap-2 mt-4 relative">
            {agents.slice(0, activeAgentsCount).map((agent, i) => (
                <div 
                    key={agent.id} 
                    className="group relative flex items-center gap-2 bg-surface/50 border border-borderCol hover:border-primary/50 rounded-full px-2 py-1 pr-3 transition-all cursor-help animate-slide-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                        {agent.name[0]}
                    </div>
                    <span className="text-[10px] text-textMain font-medium">{agent.role}</span>

                    {/* Tooltip (Fixed z-index and positioning) */}
                    <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-borderCol rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        <div className="text-xs font-bold text-primary mb-1">{agent.name}</div>
                        <div className="text-[10px] text-textMuted leading-tight">{agent.desc}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar with Tooltip */}
            <div className="group relative">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 border shadow-sm cursor-help
                ${msg.sender === 'ai' ? 'bg-surface border-borderCol text-primary' : 'bg-primary border-transparent text-white'}
                `}>
                {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                
                {/* Avatar Tooltip for AI */}
                {msg.sender === 'ai' && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-surface border border-borderCol rounded-lg p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                         <div className="text-xs font-bold text-primary mb-1">{msg.agentName || 'AI Agent'}</div>
                         <div className="text-[10px] text-textMuted leading-tight">{getAgentDescription(msg.agentName)}</div>
                    </div>
                )}
            </div>

            {/* Bubble Container */}
            <div className="flex flex-col max-w-[85%]">
                {/* Agent Name Label */}
                {msg.sender === 'ai' && msg.agentName && (
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                            {msg.agentName}
                        </span>
                    </div>
                )}
                
                {/* Bubble */}
                <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.sender === 'ai' 
                    ? 'bg-chat border border-borderCol text-textMain rounded-2xl rounded-tl-none' 
                    : 'bg-gradient-to-r from-primary to-secondary text-white rounded-2xl rounded-tr-none'}
                `}>
                  {msg.text}
                </div>
            </div>
          </div>
        ))}

        {isLoading && (
           <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface border border-borderCol text-primary flex items-center justify-center mt-1">
                  <Bot size={16} />
              </div>
              <div className="bg-chat border border-borderCol rounded-2xl rounded-tl-none px-4 py-3 text-sm text-textMuted flex items-center gap-3">
                 <Loader2 size={16} className="animate-spin text-primary" />
                 <span>{typingStep || "Думаю..."}</span>
              </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark border-t border-borderCol">
          <form onSubmit={handleSubmit} className="relative">
              <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Сообщение команде..."
                  className="w-full bg-surface border border-borderCol rounded-xl py-3 pl-4 pr-12 text-sm text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                  disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                  <Send size={16} />
              </button>
          </form>
      </div>
    </div>
  );
};