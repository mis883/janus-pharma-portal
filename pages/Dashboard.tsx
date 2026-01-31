import React, { useMemo } from 'react';
import { ArrowRight, TrendingUp, Zap, PlusCircle, Edit, MessageSquare, Clock } from 'lucide-react';
import { Product, UserRole, OrderHistoryItem, Banner } from '../types';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';

// Mock Order History for Logic Demo
const MOCK_ORDER_HISTORY: OrderHistoryItem[] = [
    { orderDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), productId: '1', quantity: 10 }, 
    { orderDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(), productId: '1', quantity: 10 }, 
];

interface DashboardProps {
  products: Product[];
  banners: Banner[];
  userRole: UserRole;
  onAddToCart: (product: Product) => void;
  onViewAll: () => void;
  wishlistIds: string[];
  compareListIds: string[];
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  onNavigateToCriticalCare: () => void;
  onNavigateToNewLaunches: () => void;
  onNavigateToAdmin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  products, 
  banners,
  userRole, 
  onAddToCart, 
  onViewAll,
  wishlistIds,
  compareListIds,
  onToggleWishlist,
  onToggleCompare,
  onNavigateToCriticalCare,
  onNavigateToNewLaunches,
  onNavigateToAdmin
}) => {
  const isNew = (dateString?: string) => {
    if (!dateString) return false;
    const launch = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - launch.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  };

  const newLaunches = products.filter(p => isNew(p.launchDate)).sort((a,b) => (b.launchDate || '').localeCompare(a.launchDate || ''));
  const trending = products.filter(p => p.isTrending);

  // Predictive Restock Logic
  const restockSuggestions = useMemo(() => {
    if (userRole !== UserRole.CUSTOMER) return [];
    const productOrders: Record<string, number[]> = {};
    MOCK_ORDER_HISTORY.forEach(item => {
        if (!productOrders[item.productId]) productOrders[item.productId] = [];
        productOrders[item.productId].push(new Date(item.orderDate).getTime());
    });
    const suggestions: Product[] = [];
    Object.keys(productOrders).forEach(pid => {
        const dates = productOrders[pid].sort((a,b) => b - a);
        if (dates.length < 2) return; 
        let totalGap = 0;
        for(let i = 0; i < dates.length - 1; i++) {
            totalGap += (dates[i] - dates[i+1]);
        }
        const avgGap = totalGap / (dates.length - 1);
        const lastOrderTime = dates[0];
        const timeSinceLastOrder = Date.now() - lastOrderTime;
        if (timeSinceLastOrder > avgGap) {
            const product = products.find(p => p.id === pid);
            if (product) suggestions.push(product);
        }
    });
    return suggestions;
  }, [products, userRole]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      
      {/* Hero Banner Carousel */}
      <HeroCarousel 
        banners={banners}
        onNavigateToCriticalCare={onNavigateToCriticalCare}
        onNavigateToNewLaunches={onNavigateToNewLaunches}
      />

      {/* Admin Quick Actions */}
      {userRole === UserRole.ADMIN && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Admin Quick Actions</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={onNavigateToAdmin} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-4 transition group">
                 <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-200 group-hover:scale-110 transition">
                    <PlusCircle size={24} />
                 </div>
                 <div className="text-left">
                    <h4 className="font-bold text-slate-800">Add Product</h4>
                    <p className="text-xs text-slate-500">Launch new item</p>
                 </div>
              </button>
              <button onClick={onNavigateToAdmin} className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl flex items-center gap-4 transition group">
                 <div className="bg-amber-500 text-white p-3 rounded-full shadow-lg shadow-amber-200 group-hover:scale-110 transition">
                    <Edit size={24} />
                 </div>
                 <div className="text-left">
                    <h4 className="font-bold text-slate-800">Update Details</h4>
                    <p className="text-xs text-slate-500">Edit price, stock</p>
                 </div>
              </button>
              <button onClick={onNavigateToAdmin} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl flex items-center gap-4 transition group">
                 <div className="bg-purple-500 text-white p-3 rounded-full shadow-lg shadow-purple-200 group-hover:scale-110 transition">
                    <MessageSquare size={24} />
                 </div>
                 <div className="text-left">
                    <h4 className="font-bold text-slate-800">Admin AI</h4>
                    <p className="text-xs text-slate-500">Ask assistant</p>
                 </div>
              </button>
           </div>
        </section>
      )}

      {/* Intelligent Restock Nudge */}
      {restockSuggestions.length > 0 && userRole === UserRole.CUSTOMER && (
          <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
             <div className="flex items-center gap-2 mb-4">
                <Clock className="text-indigo-600" />
                <div>
                    <h2 className="text-xl font-bold text-indigo-900">Smart Restock Suggestions</h2>
                    <p className="text-xs text-indigo-600">Based on your ordering history, you might be running low on these.</p>
                </div>
             </div>
             <div className="flex overflow-x-auto gap-4 pb-2">
                 {restockSuggestions.map(product => (
                     <div key={product.id} className="min-w-[280px] bg-white p-3 rounded-xl border shadow-sm flex gap-3 items-center">
                         <img src={product.imageUrl} className="w-16 h-16 rounded object-cover" alt="" />
                         <div className="flex-1">
                             <h4 className="font-bold text-sm text-slate-800">{product.brandName}</h4>
                             <p className="text-xs text-slate-500 mb-2">{product.packing}</p>
                             <button onClick={() => onAddToCart(product)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold w-full">Restock Now</button>
                         </div>
                     </div>
                 ))}
             </div>
          </section>
      )}

      {/* New Launches */}
      {newLaunches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Zap size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">New Arrivals</h2>
            </div>
            <button onClick={onViewAll} className="text-blue-600 font-medium text-sm hover:underline">View All</button>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x snap-mandatory">
            {newLaunches.map(product => (
              <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                  <ProductCard 
                    product={product} 
                    userRole={userRole} 
                    onAddToCart={onAddToCart}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    isCompared={compareListIds.includes(product.id)}
                    onToggleCompare={onToggleCompare}
                  />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <TrendingUp size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Trending Now</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x snap-mandatory">
            {trending.map(product => (
              <div key={product.id} className="min-w-[280px] md:min-w-[300px] snap-start">
                  <ProductCard 
                    product={product} 
                    userRole={userRole} 
                    onAddToCart={onAddToCart}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    isCompared={compareListIds.includes(product.id)}
                    onToggleCompare={onToggleCompare}
                  />
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Full Catalog Teaser */}
       <section className="text-center py-8">
            <button onClick={onViewAll} className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-900 transition shadow-lg flex items-center gap-2 mx-auto">
                Browse Full Library <ArrowRight size={18} />
            </button>
       </section>

    </div>
  );
};