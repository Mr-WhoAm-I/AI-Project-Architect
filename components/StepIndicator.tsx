import React from 'react';
import { Step } from '../types';
import { Check, Circle, Activity, Cpu, Calendar, FileText } from 'lucide-react';

interface Props {
  currentStep: Step;
}

const steps = [
  { id: Step.INPUT, label: 'Идея', icon: Circle },
  { id: Step.ANALYSIS, label: 'Анализ', icon: Activity },
  { id: Step.ARCHITECTURE, label: 'Стек', icon: Cpu },
  { id: Step.PLANNING, label: 'План', icon: Calendar },
  { id: Step.DOCS, label: 'Итог', icon: FileText },
];

export const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-surface -z-10 rounded-full"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500 -z-10 rounded-full"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-dark
                  ${isActive ? 'border-secondary text-secondary scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : ''}
                  ${isCompleted ? 'border-primary text-primary bg-primary/10' : ''}
                  ${!isActive && !isCompleted ? 'border-slate-600 text-slate-600' : ''}
                `}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors duration-300
                ${isActive ? 'text-secondary' : 'text-slate-500'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};