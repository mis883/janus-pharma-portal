import React, { useState } from 'react';
import { X, Play, ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid } from 'lucide-react';
import { Product } from '../types';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  allProducts: Product[];
  onRemoveProduct: (id: string) => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds,
  allProducts,
  onRemoveProduct
}) => {
  const [mode, setMode] = useState<'selection' | 'presenting'>('selection');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVisualAid, setShowVisualAid] = useState(true); // Toggle between Product Image and Visual Aid

  if (!isOpen) return null;

  const presentationProducts = allProducts.filter(p => selectedProductIds.includes(p.id));

  const handleStart = () => {
    if (presentationProducts.length > 0) {
      setMode('presenting');
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === presentationProducts.length - 1 ? 0 : prev + 1));
    setShowVisualAid(true); // Reset to visual aid on slide change
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? presentationProducts.length - 1 : prev - 1));
    setShowVisualAid(true);
  };

  const currentProduct = presentationProducts[currentIndex];

  if (mode === 'selection') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
          <div className="p-6 border-b flex justify-between items-center bg-blue-900 text-white">
            <h2 className="text-xl font-bold font-nexa">Prepare Presentation</h2>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X size={20} /></button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {presentationProducts.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Grid size={48} className="mx-auto mb-4 opacity-50" />
                <p>No products selected for presentation.</p>
                <p className="text-sm">Go back and click the 'Projection' icon on products.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-4">Select the sequence for the doctor visit:</p>
                {presentationProducts.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 border rounded-lg hover:border-blue-300 transition bg-slate-50">
                    <span className="font-bold text-slate-400 w-6">{idx + 1}.</span>
                    <img src={p.imageUrl} className="w-12 h-12 object-cover rounded bg-white" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{p.brandName}</h4>
                      <p className="text-xs text-slate-500">{p.composition}</p>
                    </div>
                    <button onClick={() => onRemoveProduct(p.id)} className="text-red-400 hover:text-red-600 p-2"><X size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition">Cancel</button>
            <button 
              onClick={handleStart}
              disabled={presentationProducts.length === 0}
              className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 ${presentationProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:scale-105 transition'}`}
            >
              <Play size={20} /> Start Presentation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PRESENTATION MODE
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col h-screen w-screen overflow-hidden">
      {/* Top Controls (Hidden/Subtle) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
        <h2 className="font-bold text-lg">{currentProduct.brandName}</h2>
        <div className="flex gap-4">
             <button onClick={() => setMode('selection')} className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md hover:bg-black/60"><Grid size={16}/> List</button>
             <button onClick={onClose} className="flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full backdrop-blur-md hover:bg-red-600"><X size={16}/> Exit</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-50">
        
        {/* Toggle View Button */}
        <div className="absolute top-20 right-8 z-40 flex flex-col gap-2">
            <button 
                onClick={() => setShowVisualAid(!showVisualAid)}
                className="bg-white/90 backdrop-blur border border-slate-200 shadow-lg p-3 rounded-full text-blue-600 font-bold text-xs"
                title="Toggle Visual Aid / Pack Shot"
            >
                {showVisualAid ? "Show Pack" : "Show VA"}
            </button>
        </div>

        {/* Image Display */}
        <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
            <img 
                src={showVisualAid && currentProduct.visualAidUrl ? currentProduct.visualAidUrl : currentProduct.imageUrl} 
                alt="Presentation" 
                className="max-h-full max-w-full object-contain drop-shadow-2xl animate-in fade-in zoom-in duration-500"
            />
            {showVisualAid && !currentProduct.visualAidUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
                    <p className="bg-white px-6 py-3 rounded-xl shadow-xl font-bold text-slate-500">No Visual Aid Available</p>
                </div>
            )}
        </div>

        {/* Info Overlay (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 pb-8 px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 font-nexa">{currentProduct.brandName}</h1>
                <p className="text-xl md:text-2xl text-slate-600 font-medium">{currentProduct.composition}</p>
                <div className="mt-4 flex justify-center gap-4">
                    <span className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wider">{currentProduct.division}</span>
                    <span className="px-4 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">{currentProduct.packing}</span>
                </div>
            </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/50 hover:bg-white text-slate-800 shadow-lg backdrop-blur-sm transition hover:scale-110">
            <ChevronLeft size={32} />
        </button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/50 hover:bg-white text-slate-800 shadow-lg backdrop-blur-sm transition hover:scale-110">
            <ChevronRight size={32} />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-slate-200 w-full">
        <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / presentationProducts.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
