import React from 'react';
import { DocsResult, ColorPalette } from '../types';
import { Download, FileText, MonitorPlay, FolderOpen } from 'lucide-react';
import { exportToDocx, exportToPptx } from '../services/exportService';
import { DashboardCard } from '../components/DashboardCard';

interface Props {
  data: DocsResult;
  palette?: ColorPalette;
}

export const DocsView: React.FC<Props> = ({ data, palette }) => {
  return (
    <DashboardCard title="Результаты" subtitle="Download Assets" icon={FolderOpen}>
      <div className="p-4 grid grid-cols-1 gap-3">
         <button 
            onClick={() => exportToDocx(data)}
            className="flex items-center justify-between bg-surface/40 hover:bg-surface/60 border border-borderCol p-3 rounded-xl transition-all group"
         >
             <div className="flex items-center gap-3">
                 <div className="bg-blue-600/20 text-blue-400 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <FileText size={20} />
                 </div>
                 <div className="text-left">
                     <div className="text-sm font-bold text-textMain">Документация</div>
                     <div className="text-xs text-textMuted">Техническое задание .doc</div>
                 </div>
             </div>
             <Download size={16} className="text-textMuted group-hover:text-textMain" />
         </button>

         <button 
            onClick={() => exportToPptx(data, palette)}
            className="flex items-center justify-between bg-surface/40 hover:bg-surface/60 border border-borderCol p-3 rounded-xl transition-all group"
         >
             <div className="flex items-center gap-3">
                 <div className="bg-orange-600/20 text-orange-400 p-2 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                     <MonitorPlay size={20} />
                 </div>
                 <div className="text-left">
                     <div className="text-sm font-bold text-textMain">Презентация</div>
                     <div className="text-xs text-textMuted">Pitch Deck .pptx</div>
                 </div>
             </div>
             <Download size={16} className="text-textMuted group-hover:text-textMain" />
         </button>
      </div>
    </DashboardCard>
  );
};