
import React, { useState, useEffect, useRef } from 'react';
import { ArchitectureResult } from '../types';
import { Database, Server, Layout, Cog, Cpu, Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { DashboardCard } from '../components/DashboardCard';

interface Props {
  data: ArchitectureResult;
}

export const ArchitectureView: React.FC<Props> = ({ data }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Canvas State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening modal
  useEffect(() => {
    if (isFullScreen) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }
  }, [isFullScreen]);

  // --- Zoom Handlers ---
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with scroll wheel
    const scaleFactor = 0.001;
    const delta = -e.deltaY * scaleFactor;
    setZoom(prev => Math.min(Math.max(0.5, prev + delta), 3));
  };

  const handleReset = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
  };

  // --- Pan Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent text selection
      setIsDragging(true);
      // Store the offset between current mouse pos and current pan pos
      setDragStart({ 
          x: e.clientX - pan.x, 
          y: e.clientY - pan.y 
      });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  return (
    <>
        <DashboardCard title="Архитектура" subtitle="System Design & Stack" icon={Cpu}>
        <div className="p-4 space-y-4">
            {/* Diagram Preview */}
            <div className="relative bg-surface/30 rounded-lg p-2 border border-borderCol overflow-hidden group">
                <div className="overflow-x-auto">
                    <ArchitectureDiagram nodes={data.diagram.nodes} edges={data.diagram.edges} />
                </div>
                <button 
                    onClick={() => setIsFullScreen(true)}
                    className="absolute top-2 right-2 bg-dark/70 text-textMain p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark border border-borderCol shadow-sm"
                    title="На весь экран"
                >
                    <Maximize2 size={16} />
                </button>
            </div>

            {/* Stack */}
            <div className="grid grid-cols-2 gap-2">
                <StackItem icon={Layout} label="Front" items={data.frontend} color="text-pink-500" />
                <StackItem icon={Server} label="Back" items={data.backend} color="text-blue-500" />
                <StackItem icon={Database} label="Data" items={data.database} color="text-green-500" />
                <StackItem icon={Cog} label="Ops" items={data.devops} color="text-orange-500" />
            </div>
        </div>
        </DashboardCard>

        {/* Full Screen Modal */}
        {isFullScreen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-dark/95 backdrop-blur-md animate-in fade-in duration-200">
                {/* Header / Controls Toolbar */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-50 pointer-events-none">
                    
                    {/* Zoom Controls */}
                    <div className="pointer-events-auto flex items-center gap-1 bg-surface/90 backdrop-blur border border-borderCol p-1.5 rounded-xl shadow-xl">
                        <button 
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-dark/50 rounded-lg text-textMuted hover:text-textMain transition-colors"
                            title="Уменьшить"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <span className="w-12 text-center text-xs font-mono text-textMain font-bold select-none">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button 
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-dark/50 rounded-lg text-textMuted hover:text-textMain transition-colors"
                            title="Увеличить"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <div className="w-[1px] h-6 bg-borderCol mx-1"></div>
                        <button 
                            onClick={handleReset}
                            className="p-2 hover:bg-dark/50 rounded-lg text-textMuted hover:text-textMain transition-colors"
                            title="Сбросить (Центр)"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={() => setIsFullScreen(false)}
                        className="pointer-events-auto text-textMuted hover:text-white bg-surface/90 hover:bg-red-500/20 hover:border-red-500/50 p-2.5 rounded-full transition-all border border-borderCol shadow-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Viewport (Interactive Area) */}
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-hidden w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                     <div 
                        className="w-full h-full flex items-center justify-center pointer-events-none" // Centering wrapper
                     >
                         <div 
                            className="transition-transform duration-75 ease-out select-none" // Actual Zoom/Pan Target
                            style={{ 
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transformOrigin: 'center',
                                pointerEvents: 'none' // Let clicks pass through if needed, but here we just render svg
                            }}
                         >
                            <div className="bg-surface/30 rounded-2xl border border-borderCol p-8 shadow-2xl backdrop-blur-sm">
                                <ArchitectureDiagram nodes={data.diagram.nodes} edges={data.diagram.edges} isFull />
                            </div>
                         </div>
                     </div>
                </div>
                
                {/* Hints */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-50 text-[10px] text-textMuted bg-surface px-3 py-1 rounded-full border border-borderCol">
                    Scroll to Zoom • Drag to Move
                </div>
            </div>
        )}
    </>
  );
};

const StackItem = ({ icon: Icon, label, items, color }: any) => (
    <div className="bg-surface/50 p-2 rounded border border-borderCol">
        <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
            <Icon size={12} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
        <div className="flex flex-wrap gap-1">
            {items.slice(0,3).map((item: string, i: number) => (
                <span key={i} className="text-[10px] text-textMuted bg-dark/10 border border-borderCol px-1 rounded">{item}</span>
            ))}
        </div>
    </div>
);
