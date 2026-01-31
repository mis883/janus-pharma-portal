import React, { useState } from 'react';
import { Share2, ShoppingBag, Eye, FileText, Video, Heart, Scale, MonitorPlay, RefreshCw, Flame, Sparkles, Wand2, Copy, Check, Edit2, Gift } from 'lucide-react';
import { Product, UserRole, StockStatus } from '../types';
import { generateMarketingCaption } from '../services/geminiService';

interface ProductCardProps {
  product: Product;
  userRole: UserRole;
  isWishlisted?: boolean;
  isCompared?: boolean;
  isPresented?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  onTogglePresentation?: (product: Product) => void;
  onFindSubstitutes?: (composition: string) => void;
  onEditProduct?: (product: Product) => void;
}

const getStockBadgeColor = (status: StockStatus) => {
  switch (status) {
    case StockStatus.AVAILABLE: return 'bg-green-100 text-green-700 border-green-200';
    case StockStatus.LOW_STOCK: return 'bg-amber-100 text-amber-700 border-amber-200';
    case StockStatus.COMING_SOON: return 'bg-blue-100 text-blue-700 border-blue-200';
    case StockStatus.OUT_OF_STOCK: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const isNewLaunch = (dateString?: string) => {
    if (!dateString) return false;
    const launch = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - launch.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  userRole, 
  onAddToCart,
  isWishlisted = false,
  isCompared = false,
  isPresented = false,
  onToggleWishlist,
  onToggleCompare,
  onTogglePresentation,
  onFindSubstitutes,
  onEditProduct
}) => {
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleShare = () => {
    const text = `Check out this product:\n*${product.brandName}*\n${product.composition ? `Composition: ${product.composition}\n` : ''}MRP: ${product.mrp === 0 ? 'Free/Complimentary' : product.mrp}\nPacking: ${product.packing}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleGenerateCaption = async () => {
      setShowCaptionModal(true);
      if (!generatedCaption) {
          setIsGenerating(true);
          const caption = await generateMarketingCaption(product);
          setGeneratedCaption(caption);
          setIsGenerating(false);
      }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const isNew = isNewLaunch(product.launchDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-md transition duration-200 relative group">
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.brandName} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-10">
           <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStockBadgeColor(product.stockStatus)}`}>
            {product.stockStatus}
          </span>
        </div>
        
        {/* Customer Actions Overlay & Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
            {isNew && (
                <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles size={10} /> NEW
                </div>
            )}
            {product.isTrending && (
                <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame size={10} /> HOT
                </div>
            )}
            {product.isPromotional && (
                 <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Gift size={10} /> PROMO
                 </div>
            )}
        </div>

        {/* Admin Edit Overlay Button (visible on hover) */}
        {userRole === UserRole.ADMIN && onEditProduct && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-20">
                <button 
                    onClick={() => onEditProduct(product)}
                    className="bg-white text-slate-800 font-bold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-blue-50 transition transform hover:scale-105"
                >
                    <Edit2 size={16} /> Edit Product
                </button>
            </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <div>
                 <span className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{product.division || 'Input'}</span>
                 <h3 className="font-bold text-slate-800 text-lg leading-tight">{product.brandName}</h3>
            </div>
            <div className="text-right">
                {product.mrp === 0 ? (
                    <span className="block text-sm font-bold text-green-600 whitespace-nowrap">Free / Gift</span>
                ) : (
                    <span className="block text-lg font-bold text-blue-600">₹{product.mrp}</span>
                )}
                {product.mrp > 0 && <span className="text-[10px] text-slate-400">MRP</span>}
            </div>
        </div>
        
        {product.composition ? (
            <p className="text-sm text-slate-600 mb-2">{product.composition}</p>
        ) : (
            <p className="text-sm text-slate-400 italic mb-2">Promotional Material</p>
        )}
        
        <p className="text-xs text-slate-400 mb-4 bg-slate-50 inline-block px-2 py-1 rounded">Packing: {product.packing}</p>

        {/* Tags Display (Semantic Context) */}
        {product.tags && product.tags.length > 0 && (
             <div className="flex flex-wrap gap-1 mb-3">
                 {product.tags.slice(0, 3).map(tag => (
                     <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                 ))}
             </div>
        )}

        {/* Internal Data - Only for Admin/Staff */}
        {(userRole === UserRole.ADMIN || userRole === UserRole.STAFF) && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
            <p><strong>Internal:</strong> Landing Cost: ₹{product.landingCost}</p>
            {product.launchDate && <p className="mt-1 text-[10px]">Launch: {product.launchDate}</p>}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
           <div className="flex gap-2">
                {product.visualAidUrl && (
                    <button className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                        <FileText size={14} /> Visual Aid
                    </button>
                )}
                {product.videoUrl && (
                    <button className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50">
                        <Video size={14} /> Video
                    </button>
                )}
           </div>

           <div className="flex gap-2 mt-2">
             <button 
               onClick={handleShare}
               className="bg-green-50 text-green-600 p-2 rounded-lg border border-green-200 hover:bg-green-100 transition"
               title="Share on WhatsApp"
             >
               <Share2 size={20} />
             </button>
             
             {/* AI Caption Generator Button */}
             <button 
               onClick={handleGenerateCaption}
               className="bg-purple-50 text-purple-600 p-2 rounded-lg border border-purple-200 hover:bg-purple-100 transition relative"
               title="Generate Marketing Caption"
             >
               <Wand2 size={20} />
             </button>

             {/* Caption Modal Popover */}
             {showCaptionModal && (
                 <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-purple-100 p-3 z-50 animate-in slide-in-from-bottom-2">
                     <div className="flex justify-between items-center mb-2">
                         <h5 className="text-xs font-bold text-purple-800 flex items-center gap-1"><Sparkles size={12}/> AI Marketing Copy</h5>
                         <button onClick={(e) => {e.stopPropagation(); setShowCaptionModal(false)}} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                     </div>
                     {isGenerating ? (
                         <div className="text-center py-4 text-xs text-slate-500">Thinking...</div>
                     ) : (
                         <>
                            <p className="text-xs text-slate-600 italic mb-3 leading-relaxed">"{generatedCaption}"</p>
                            <button onClick={(e) => {e.stopPropagation(); copyToClipboard()}} className="w-full py-1.5 bg-purple-600 text-white text-xs rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-purple-700">
                                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy Text'}
                            </button>
                         </>
                     )}
                 </div>
             )}
             
             {onTogglePresentation && (
                <button 
                  onClick={() => onTogglePresentation(product)}
                  className={`p-2 rounded-lg border transition ${isPresented ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-blue-50 hover:text-blue-400'}`}
                  title="Add to Presentation"
                >
                  <MonitorPlay size={20} />
                </button>
             )}

             {userRole === UserRole.CUSTOMER && onToggleWishlist && (
                 <button 
                   onClick={() => onToggleWishlist(product)}
                   className={`p-2 rounded-lg border transition ${isWishlisted ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-pink-50 hover:text-pink-400'}`}
                   title="Add to Wishlist"
                 >
                   <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                 </button>
             )}
             
             {userRole === UserRole.CUSTOMER && (
                <>
                {product.stockStatus === StockStatus.OUT_OF_STOCK ? (
                     <button 
                        onClick={() => onFindSubstitutes && onFindSubstitutes(product.composition || '')}
                        disabled={!product.composition}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
                     >
                         <RefreshCw size={18} /> Substitutes
                     </button>
                ) : (
                    <button 
                        onClick={() => onAddToCart(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                    >
                        <ShoppingBag size={18} />
                        Order
                    </button>
                )}
                </>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icon for Modal
const X = ({size}: {size:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);