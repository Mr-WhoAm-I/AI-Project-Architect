import React, { useState, useEffect } from 'react';
import { ProjectData, AIRequestState, AnalysisResult, ChatMessage, ProjectHistoryItem } from './types';
import { analyzeIdea, generateArchitecture, generatePlan, generateDocumentation, generateAppVisual, sendAgentMessage } from './services/geminiService';
import { saveProject, loadProjectsHistory, loadProjectById } from './services/storageService';
import { StartView } from './views/StartView';
import { AnalysisView } from './views/AnalysisView';
import { ArchitectureView } from './views/ArchitectureView';
import { PlanningView } from './views/PlanningView';
import { DocsView } from './views/DocsView';
import { ChatPanel } from './components/ChatPanel';
import { ImageViewer } from './components/ImageViewer';
import { ProjectSidebar } from './components/ProjectSidebar';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';

const initialData: ProjectData = {
  originalIdea: '',
  analysis: null,
  architecture: null,
  plan: null,
  documentation: null,
  messages: []
};

export default function App() {
  const [projectData, setProjectData] = useState<ProjectData>(initialData);
  const [requestState, setRequestState] = useState<AIRequestState>({ loading: false, error: null });
  // We keep a local messages state for UI, but we sync it to projectData
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // History & Sidebar State
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);

  // Calculate active agents based on progress
  const getActiveAgentsCount = () => {
    let count = 1; // Project Manager always active
    if (projectData.analysis) count++; // Analyst
    if (projectData.architecture) count++; // Architect
    if (projectData.plan) count++; // Planner
    return Math.min(count, 4);
  };

  // Load History on Mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Refresh history whenever project ID changes (save occurred)
  useEffect(() => {
      if (projectData.id) {
          loadHistory();
      }
  }, [projectData.id, projectData.timestamp]);

  const loadHistory = async () => {
      try {
          const items = await loadProjectsHistory();
          setHistory(items);
      } catch (e) {
          console.error("Failed to load history", e);
      }
  };

  // Apply dynamic theme (Full Palette)
  useEffect(() => {
    const palette = projectData.analysis?.palette;
    if (palette) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', palette.primary);
      root.style.setProperty('--theme-secondary', palette.secondary);
      root.style.setProperty('--bg-main', palette.background);
      root.style.setProperty('--bg-surface', palette.surface);
      root.style.setProperty('--text-main', palette.text);
      
      // Calculate derived colors
      root.style.setProperty('--border-color', `${palette.text}20`); // 20% opacity of text
      root.style.setProperty('--text-muted', `${palette.text}90`);   // 90% opacity of text (adjusted for better read)
    } else {
        // Reset to default if no project loaded
        const root = document.documentElement;
        root.style.setProperty('--theme-primary', '#6366f1');
        root.style.setProperty('--theme-secondary', '#a855f7');
        root.style.setProperty('--bg-main', '#0f172a');
        root.style.setProperty('--bg-surface', '#1e293b');
        root.style.setProperty('--text-main', '#f8fafc');
        root.style.setProperty('--border-color', 'rgba(248, 250, 252, 0.1)');
        root.style.setProperty('--text-muted', 'rgba(248, 250, 252, 0.6)');
    }
  }, [projectData.analysis]);

  // Helper to save asynchronously
  const persistProject = async (data: ProjectData) => {
      if (!data.originalIdea) return;
      try {
          const saved = await saveProject(data);
          // If it was a new project (no ID), update state with the ID assigned by saveProject
          if (!data.id && saved.id) {
              setProjectData(prev => ({ ...prev, id: saved.id }));
          }
      } catch (e) {
          console.error("Auto-save failed", e);
      }
  };

  // Helpers to add messages and SAVE persistence
  const addMsg = (text: string, sender: 'user' | 'ai', agentName?: string) => {
    const newMsg: ChatMessage = { 
        id: Date.now().toString() + Math.random(), 
        sender, 
        text, 
        agentName, 
        timestamp: new Date() 
    };

    setMessages(prev => {
        const updatedMessages = [...prev, newMsg];
        
        // Sync with Project Data immediately
        setProjectData(currentProject => {
            const updatedProject = { ...currentProject, messages: updatedMessages };
            persistProject(updatedProject);
            return updatedProject;
        });
        
        return updatedMessages;
    });
  };

  const handleError = (e: any) => {
    console.error(e);
    setRequestState({ 
        loading: false, 
        error: e.message || "An error occurred." 
    });
    addMsg("Произошла ошибка при обработке запроса. Попробуйте еще раз.", 'ai', 'System');
  };

  const handleNewProject = () => {
      setProjectData(initialData);
      setMessages([]);
      setSidebarOpen(false);
  };

  const handleLoadProject = async (id: string) => {
      try {
        const loaded = await loadProjectById(id);
        if (loaded) {
            setProjectData(loaded);
            
            if (loaded.messages && loaded.messages.length > 0) {
                setMessages(loaded.messages);
            } else {
                setMessages([{
                    id: 'restored', 
                    sender: 'ai', 
                    agentName: 'System', 
                    text: `Проект "${loaded.analysis?.title}" загружен.`, 
                    timestamp: new Date()
                }]);
            }
        }
      } catch (e) {
          console.error("Failed to load project", e);
      }
      setSidebarOpen(false);
  };

  // 1. Initial Analysis
  const handleIdeaSubmit = async (idea: string) => {
    // Set initial data but allow addMsg to handle the save trigger
    setProjectData({ ...initialData, originalIdea: idea });
    
    // Add message adds to state AND triggers save inside setProjectData logic
    addMsg(idea, 'user');
    
    setRequestState({ loading: true, stepName: 'Анализ идеи...', error: null });
    
    try {
      const result = await analyzeIdea(idea);
      
      // We need to merge with current messages state because addMsg ran async
      setProjectData(prev => {
          const newData = { ...prev, originalIdea: idea, analysis: result };
          persistProject(newData);
          return newData;
      });

      addMsg("Я проанализировал вашу идею и подобрал уникальный визуальный стиль. Пожалуйста, проверьте требования.", 'ai', 'Analyst');
      
      // Kick off image generation
      generateAppVisual(result.summary, result.themeMode, result.palette.primary, result.palette).then(img => {
          setProjectData(prev => {
              const withImg = { ...prev, appImage: img };
              persistProject(withImg);
              return withImg;
          });
      }).catch(err => {
          console.error("Image gen failed", err);
      });

      setRequestState({ loading: false, error: null });
    } catch (e) {
      handleError(e);
    }
  };

  // 2. Automated Chain - Triggered by user Action
  const handleAnalysisConfirm = async (updatedAnalysis: AnalysisResult) => {
    addMsg("Все отлично, продолжаем!", 'user');
    
    // We use functional update to ensure we keep latest messages
    let currentData = { ...projectData };

    setProjectData(prev => {
        const dataAfterConfirm = { ...prev, analysis: updatedAnalysis };
        persistProject(dataAfterConfirm);
        currentData = dataAfterConfirm;
        return dataAfterConfirm;
    });
    
    addMsg("Принято. Передаю данные Архитектору для проектирования системы.", 'ai', 'Analyst');
    
    setRequestState({ loading: true, stepName: 'Архитектура...', error: null });

    try {
      // Arch
      const arch = await generateArchitecture(updatedAnalysis);
      
      setProjectData(prev => {
          const dataWithArch = { ...prev, architecture: arch };
          persistProject(dataWithArch);
          currentData = dataWithArch;
          return dataWithArch;
      });

      addMsg("Архитектура готова. Перехожу к планированию этапов разработки.", 'ai', 'Architect');

      // Plan
      setRequestState({ loading: true, stepName: 'Планирование...', error: null });
      const plan = await generatePlan(updatedAnalysis, arch);
      
      setProjectData(prev => {
         const dataWithPlan = { ...prev, plan: plan };
         persistProject(dataWithPlan);
         currentData = dataWithPlan;
         return dataWithPlan;
      });

      addMsg("План составлен. Генерирую финальную документацию и презентацию.", 'ai', 'Planner');

      // Docs
      setRequestState({ loading: true, stepName: 'Документация...', error: null });
      
      // Need current state for Docs generation (merge locally to be safe)
      const dataForDocs = { ...currentData, plan: plan }; 
      const docs = await generateDocumentation(dataForDocs);
      
      setProjectData(prev => {
          const finalData = { ...prev, documentation: docs };
          persistProject(finalData);
          return finalData;
      });
      
      addMsg("Готово! Вы можете скачать ТЗ и презентацию на панели справа.", 'ai', 'Project Manager');
      setRequestState({ loading: false, error: null });

    } catch (e) {
        handleError(e);
    }
  };

  // 3. Free Form Chat Logic
  const handleChatMessage = async (text: string) => {
    addMsg(text, 'user');
    setRequestState({ loading: true, stepName: 'Думаю...', error: null });

    try {
       // If we are in the very early stage, treat it as idea submission if idea is empty
       if (!projectData.originalIdea) {
           handleIdeaSubmit(text);
           return;
       }

       const response = await sendAgentMessage(text, projectData);
       addMsg(response.text, 'ai', response.agentName);
       setRequestState({ loading: false, error: null });
    } catch (e) {
       handleError(e);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark text-textMain font-sans transition-colors duration-1000 relative">
        
        <ProjectSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            history={history}
            onSelectProject={handleLoadProject}
            onNewProject={handleNewProject}
        />
        
        {/* LEFT PANEL: Chat */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col h-full border-r border-borderCol relative z-20 bg-dark transition-colors duration-1000 pt-0">
            {messages.length === 0 ? (
               <div className="h-full p-4 pt-10 md:pt-4">
                  <StartView 
                    onNext={handleIdeaSubmit} 
                    isLoading={requestState.loading}
                    onToggleSidebar={() => setSidebarOpen(true)}
                  />
               </div>
            ) : (
               <ChatPanel 
                  messages={messages} 
                  isLoading={requestState.loading} 
                  typingStep={requestState.stepName}
                  onSendMessage={handleChatMessage}
                  activeAgentsCount={getActiveAgentsCount()}
                  onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
               />
            )}
        </div>

        {/* RIGHT PANEL: Dashboard */}
        <div className="flex-grow h-full overflow-y-auto relative bg-dark transition-colors duration-1000 scrollbar-thin scrollbar-thumb-borderCol scrollbar-track-transparent">
            {/* Background Effects - subtler, using theme vars */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000"></div>
            <div className="fixed bottom-0 right-[20%] w-[300px] h-[300px] bg-secondary rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-1000"></div>

            <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20 pt-16 md:pt-6">
                
                {/* Header for Dashboard */}
                <header className="flex items-center justify-between mb-8">
                   <h1 className="text-2xl font-bold text-textMain tracking-tight transition-colors">Project Dashboard</h1>
                   <div className="text-xs text-textMuted font-mono bg-surface px-2 py-1 rounded border border-borderCol">
                      {projectData.originalIdea ? "ACTIVE SESSION" : "IDLE"}
                   </div>
                </header>

                {/* VISUAL MOCKUP CARD (If generated) */}
                {projectData.appImage && (
                    <div className="animate-slide-in relative group rounded-2xl overflow-hidden border border-borderCol shadow-2xl aspect-video md:aspect-[21/9]">
                        <img src={projectData.appImage} alt="App Concept" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
                            <div className="flex items-center gap-2 text-white mb-1">
                                <ImageIcon size={18} className="text-secondary" />
                                <span className="font-bold">AI Concept Visual</span>
                            </div>
                        </div>

                        {/* Fullscreen Trigger */}
                        <button 
                            onClick={() => setIsImageModalOpen(true)}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 cursor-pointer"
                        >
                            <Maximize2 size={20} />
                        </button>
                    </div>
                )}

                {/* GRID LAYOUT FOR CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Col 1 */}
                    <div className="space-y-6">
                        {projectData.analysis && (
                            <AnalysisView 
                                data={projectData.analysis} 
                                onNext={handleAnalysisConfirm} 
                                isLoading={requestState.loading}
                                isReadOnly={!!projectData.architecture}
                            />
                        )}
                         {projectData.plan && <PlanningView data={projectData.plan} />}
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-6">
                        {projectData.architecture && <ArchitectureView data={projectData.architecture} />}
                        {projectData.documentation && (
                            <DocsView 
                                data={projectData.documentation} 
                                palette={projectData.analysis?.palette} 
                            />
                        )}
                    </div>
                </div>

                {/* Empty State */}
                {!projectData.analysis && !requestState.loading && (
                    <div className="h-64 flex flex-col items-center justify-center text-textMuted border-2 border-dashed border-borderCol rounded-2xl">
                        <p>Ожидание данных проекта...</p>
                    </div>
                )}
            </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isImageModalOpen && projectData.appImage && (
            <ImageViewer 
                imageUrl={projectData.appImage} 
                onClose={() => setIsImageModalOpen(false)} 
            />
        )}
    </div>
  );
}