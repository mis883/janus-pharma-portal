import React from 'react';
import { Product, UserRole } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react';

interface WishlistProps {
  products: Product[];
  wishlistIds: string[];
  userRole: UserRole;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  compareList: string[];
}

export const Wishlist: React.FC<WishlistProps> = ({ 
  products, 
  wishlistIds, 
  userRole, 
  onAddToCart, 
  onToggleWishlist,
  onToggleCompare,
  compareList
}) => {
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
          <Heart size={32} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Wishlist</h1>
          <p className="text-slate-500">Saved items for future orders</p>
        </div>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              userRole={userRole} 
              onAddToCart={onAddToCart}
              isWishlisted={true}
              onToggleWishlist={onToggleWishlist}
              isCompared={compareList.includes(product.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <Heart size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">Your wishlist is empty</h3>
          <p className="text-slate-500 mb-6">Start browsing to add products you love.</p>
        </div>
      )}
    </div>
  );
};