import React, { useState } from 'react';
import { PlanResult, Phase, Task } from '../types';
import { Calendar, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';

interface Props {
  data: PlanResult;
}

export const PlanningView: React.FC<Props> = ({ data }) => {
  return (
    <DashboardCard title="Roadmap" subtitle="Timeline & MVP" icon={Calendar}>
      <div className="p-4 space-y-6">
         {/* MVP */}
         <div className="bg-primary/5 border-l-2 border-primary pl-4 py-2">
             <div className="flex items-center gap-2 mb-1 text-primary">
                 <Flag size={14} />
                 <span className="text-xs font-bold tracking-wider">MVP GOAL</span>
             </div>
             <p className="text-sm text-textMain font-light leading-relaxed">{data.mvpDefinition}</p>
         </div>

         {/* Phases Timeline */}
         <div className="relative space-y-8 pl-2">
             {/* Main vertical timeline line */}
             <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-borderCol"></div>

             {data.phases.map((p, i) => (
                 <PhaseItem key={i} phase={p} />
             ))}
         </div>
      </div>
    </DashboardCard>
  );
};

const PhaseItem = ({ phase }: { phase: Phase }) => {
    const [isExpanded, setExpanded] = useState(false);
    const visibleTasks = isExpanded ? phase.tasks : phase.tasks.slice(0, 3);
    const remainingCount = phase.tasks.length - 3;

    return (
        <div className="relative pl-8 group">
            {/* Phase Node */}
            <span className="absolute left-[15px] top-1.5 w-[9px] h-[9px] rounded-full bg-surface border-2 border-secondary z-10 group-hover:scale-125 transition-transform"></span>
            
            <div className="flex justify-between items-baseline mb-3">
                <h3 className="text-sm font-bold text-textMain">{phase.name}</h3>
                <span className="text-[10px] font-mono text-textMuted bg-surface px-2 py-0.5 rounded border border-borderCol">
                    {phase.duration}
                </span>
            </div>

            <div className="space-y-3">
                {visibleTasks.map((t, idx) => (
                    <TaskRow key={idx} task={t} />
                ))}
                
                {remainingCount > 0 && !isExpanded && (
                    <button 
                        onClick={() => setExpanded(true)}
                        className="text-xs text-textMuted hover:text-secondary flex items-center gap-1 mt-2 pl-2 transition-colors"
                    >
                        <span>Показать еще {remainingCount} задач...</span>
                        <ChevronDown size={12} />
                    </button>
                )}
                 {isExpanded && phase.tasks.length > 3 && (
                     <button 
                        onClick={() => setExpanded(false)}
                        className="text-xs text-textMuted hover:text-textMain flex items-center gap-1 mt-2 pl-2 transition-colors"
                    >
                        <span>Свернуть</span>
                        <ChevronUp size={12} />
                    </button>
                )}
            </div>
        </div>
    )
}

const TaskRow = ({ task }: { task: Task }) => {
    // Determine color based on complexity
    let dotColor = "bg-green-500"; // Low
    if (task.complexity === 'Medium') dotColor = "bg-yellow-500";
    if (task.complexity === 'High') dotColor = "bg-red-500";

    return (
        <div className="flex items-start gap-3 group/task">
             {/* Complexity Dot */}
             <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${dotColor} opacity-70 group-hover/task:opacity-100 transition-opacity flex-shrink-0`} title={`Complexity: ${task.complexity}`}></div>
             
             <div>
                 <div className="text-xs text-textMain/90 font-medium">{task.name}</div>
                 {/* Optional description on hover or always visible but faint */}
                 <div className="text-[10px] text-textMuted/60 mt-0.5 font-light">{task.description}</div>
             </div>
        </div>
    );
}
