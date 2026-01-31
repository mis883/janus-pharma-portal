import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Filter, X, Mic, MicOff, Camera, Loader, Gift } from 'lucide-react';
import { Product, UserRole } from '../types';
import { ProductCard } from '../components/ProductCard';
import { analyzeProductQuery, identifyProductFromImage } from '../services/geminiService';

interface CatalogProps {
  products: Product[];
  divisions: string[];
  userRole: UserRole;
  onAddToCart: (product: Product) => void;
  wishlistIds: string[];
  compareListIds: string[];
  presentationListIds: string[];
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  onTogglePresentation: (product: Product) => void;
  initialDivision?: string;
  onEditProduct?: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ 
  products, 
  divisions,
  userRole, 
  onAddToCart,
  wishlistIds,
  compareListIds,
  presentationListIds,
  onToggleWishlist,
  onToggleCompare,
  onTogglePresentation,
  initialDivision,
  onEditProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(initialDivision || 'All');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialDivision) {
        setSelectedDivision(initialDivision);
    }
  }, [initialDivision]);

  // Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support voice search.");
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.start();
  };

  const handleVisualSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsVisualSearching(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              const match = await identifyProductFromImage(base64, products);
              if (match) {
                  setSearchQuery(match);
              } else {
                  alert("Could not identify product in image.");
              }
              setIsVisualSearching(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleFindSubstitutes = (composition: string) => {
    setSearchQuery(composition);
    setSelectedDivision('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter logic including Semantic Tags
  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      product.brandName.toLowerCase().includes(q) || 
      (product.composition && product.composition.toLowerCase().includes(q)) ||
      product.tags?.some(tag => tag.toLowerCase().includes(q));
    
    const matchesDivision = selectedDivision === 'All' || product.division === selectedDivision;

    return matchesSearch && matchesDivision;
  });

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    
    const result = await analyzeProductQuery(searchQuery, products);
    setAiResponse(result);
    setIsAiLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      
      {/* Search & AI Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-10 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Product Library</h2>
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Search Brand, Composition, Symptoms (e.g. 'Acidity') or ask AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-40 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-400/30 shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg transition text-slate-400 hover:text-slate-600 ${isVisualSearching ? 'animate-pulse text-blue-500' : ''}`}
                title="Visual Search (Camera)"
                disabled={isVisualSearching}
            >
                {isVisualSearching ? <Loader size={20} className="animate-spin" /> : <Camera size={20} />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleVisualSearch} />

            <button 
                onClick={startListening}
                className={`p-2 rounded-lg transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-slate-600'}`}
                title="Voice Search"
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
                onClick={handleAiSearch}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ml-2"
            >
                <Sparkles size={16} />
                {isAiLoading ? 'Thinking...' : 'AI Help'}
            </button>
          </div>
        </div>

        {/* AI Response Area */}
        {aiResponse && (
          <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-start">
               <div className="flex gap-2">
                   <Sparkles className="text-yellow-300 mt-1 shrink-0" size={16} />
                   <p className="text-sm md:text-base leading-relaxed">{aiResponse}</p>
               </div>
               <button onClick={() => setAiResponse(null)} className="text-white/70 hover:text-white"><X size={16}/></button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
              <Filter size={18} />
              <h3>Filters</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Divisions</p>
              {divisions.map(div => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                    selectedDivision === div 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {div}
                  {div === "Marketing Inputs" && <Gift size={14} className="text-purple-500" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
             <p className="text-slate-500 text-sm">Showing <strong>{filteredProducts.length}</strong> products</p>
             {searchQuery && (
                 <button onClick={() => setSearchQuery('')} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                     <X size={12} /> Clear Search
                 </button>
             )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  userRole={userRole}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                  isCompared={compareListIds.includes(product.id)}
                  onToggleCompare={onToggleCompare}
                  isPresented={presentationListIds.includes(product.id)}
                  onTogglePresentation={onTogglePresentation}
                  onFindSubstitutes={handleFindSubstitutes}
                  onEditProduct={onEditProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-100 border-dashed">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">No products found</h3>
                <p className="text-slate-500">Try adjusting your search or filters.</p>
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-600 font-bold">Clear Search</button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};