import React from 'react';
import { X } from 'lucide-react';

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export const ImageViewer: React.FC<Props> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
      >
        <X size={32} />
      </button>
      
      <div className="relative max-w-[95vw] max-h-[95vh]">
        <img 
          src={imageUrl} 
          alt="Full Project Visual" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
        />
        <div className="absolute bottom-[-40px] left-0 w-full text-center text-white/50 text-sm">
          AI Generated Concept
        </div>
      </div>
    </div>
  );
};