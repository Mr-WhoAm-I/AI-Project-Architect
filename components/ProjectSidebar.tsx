import React from 'react';
import { ProjectHistoryItem } from '../types';
import { Plus, Clock, LayoutGrid, X, FolderOpen } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    history: ProjectHistoryItem[];
    onSelectProject: (id: string) => void;
    onNewProject: () => void;
}

export const ProjectSidebar: React.FC<Props> = ({ isOpen, onClose, history, onSelectProject, onNewProject }) => {
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[300px] bg-surface border-r border-borderCol z-50 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-textMain font-bold">
                            <LayoutGrid className="text-primary" />
                            <span>Мои Проекты</span>
                        </div>
                        <button onClick={onClose} className="text-textMuted hover:text-textMain">
                            <X size={20} />
                        </button>
                    </div>

                    {/* New Project Button */}
                    <button 
                        onClick={() => { onNewProject(); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl transition-all shadow-lg shadow-primary/20 mb-6 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        <span>Новый Проект</span>
                    </button>

                    {/* History List */}
                    <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                        {history.length === 0 && (
                            <div className="text-center text-textMuted text-sm py-10">
                                <Clock className="mx-auto mb-2 opacity-50" />
                                История пуста
                            </div>
                        )}
                        
                        {history.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => { onSelectProject(item.id); onClose(); }}
                                className="p-3 rounded-xl border border-borderCol bg-dark/20 hover:bg-dark/40 cursor-pointer transition-all hover:border-primary/50 group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-textMain text-sm truncate pr-2">{item.title}</h3>
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.themeColor }}></span>
                                </div>
                                <p className="text-xs text-textMuted line-clamp-2 mb-2">{item.idea}</p>
                                <div className="flex items-center gap-1 text-[10px] text-textMuted/70">
                                    <Clock size={10} />
                                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-borderCol text-center text-[10px] text-textMuted">
                        AI Project Architect v1.2
                    </div>
                </div>
            </div>
        </>
    );
};
