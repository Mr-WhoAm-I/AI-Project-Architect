import React from 'react';

// A very simple markdown formatter to avoid heavy dependencies
// Handles headers, lists, and bold text roughly.
export const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="space-y-4 text-slate-300 leading-relaxed font-light">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-primary mt-6 mb-2">{line.replace('### ', '')}</h3>;
        if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4 border-b border-slate-700 pb-2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-4 mb-6">{line.replace('# ', '')}</h1>;
        
        // List items
        if (line.trim().startsWith('- ')) {
            return (
                <div key={idx} className="flex items-start ml-4 mb-1">
                    <span className="text-secondary mr-2">•</span>
                    <span>{parseBold(line.replace('- ', ''))}</span>
                </div>
            )
        }
         if (line.trim().match(/^\d+\./)) {
             return (
                 <div key={idx} className="flex items-start ml-4 mb-1">
                     <span className="text-primary mr-2 font-mono text-sm pt-1">{line.split('.')[0]}.</span>
                     <span>{parseBold(line.replace(/^\d+\.\s*/, ''))}</span>
                 </div>
             )
         }

        // Empty lines
        if (line.trim() === '') return <div key={idx} className="h-2"></div>;

        // Paragraphs
        return <p key={idx}>{parseBold(line)}</p>;
      })}
    </div>
  );
};

// Helper to handle **bold** text
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};
