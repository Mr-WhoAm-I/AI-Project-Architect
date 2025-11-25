import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Target, HelpCircle } from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';

interface Props {
  data: AnalysisResult;
  onNext?: (updatedData: AnalysisResult) => void;
  isLoading: boolean;
  isReadOnly?: boolean;
}

export const AnalysisView: React.FC<Props> = ({ data, onNext, isLoading, isReadOnly = false }) => {
  const [localData, setLocalData] = useState<AnalysisResult>(data);

  const handleQuestionAnswerChange = (index: number, val: string) => {
    const newQuestions = [...localData.questions];
    newQuestions[index] = { ...newQuestions[index], userAnswer: val };
    setLocalData({ ...localData, questions: newQuestions });
  };

  return (
    <DashboardCard title={localData.title} subtitle={localData.summary} icon={Target}>
      <div className="p-4 space-y-4">
        {/* Features Chips */}
        <div className="flex flex-wrap gap-2">
            {localData.coreFeatures.slice(0, 8).map((f, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded font-medium">
                    {f}
                </span>
            ))}
        </div>

        {/* Questions */}
        {!isReadOnly && (
            <div className="bg-dark/5 rounded-xl p-4 border border-borderCol">
                <div className="flex items-center gap-2 mb-3 text-secondary">
                    <HelpCircle size={16} />
                    <h3 className="text-sm font-bold uppercase">Требует уточнения</h3>
                </div>
                <div className="space-y-3">
                    {localData.questions.map((q, idx) => (
                        <div key={idx}>
                            <p className="text-textMuted text-xs mb-1.5">{q.question}</p>
                            <input 
                                type="text" 
                                value={q.userAnswer || q.suggestedAnswer}
                                onChange={(e) => handleQuestionAnswerChange(idx, e.target.value)}
                                className="w-full bg-surface border border-borderCol rounded px-3 py-2 text-textMain text-sm focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                            />
                        </div>
                    ))}
                </div>
                 <div className="flex justify-end mt-4">
                    <button
                        onClick={() => onNext && onNext(localData)}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        {isLoading ? "Обработка..." : "Подтвердить и начать"}
                    </button>
                </div>
            </div>
        )}
        
        {isReadOnly && (
            <div className="text-xs text-textMuted italic text-center border-t border-borderCol pt-2">
                Требования зафиксированы
            </div>
        )}
      </div>
    </DashboardCard>
  );
};