import React from 'react';
import { Product, StockStatus } from '../types';
import { Scale, X, ShoppingBag, Trash2 } from 'lucide-react';

interface CompareProps {
  products: Product[];
  compareListIds: string[];
  onRemoveFromCompare: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onClearCompare: () => void;
}

export const Compare: React.FC<CompareProps> = ({ 
  products, 
  compareListIds, 
  onRemoveFromCompare,
  onAddToCart,
  onClearCompare
}) => {
  const compareProducts = products.filter(p => compareListIds.includes(p.id));

  if (compareProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
         <div className="inline-block p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
            <Scale size={48} />
         </div>
         <h2 className="text-2xl font-bold text-slate-800 mb-2">Compare Products</h2>
         <p className="text-slate-500">Select up to 4 products from the catalog to compare them side-by-side.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Scale size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Compare Products</h1>
                <p className="text-slate-500">{compareProducts.length} items selected</p>
            </div>
        </div>
        <button 
            onClick={onClearCompare}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
            <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-4 border-b border-slate-100 w-48 bg-slate-50 text-slate-500 font-medium uppercase text-xs tracking-wider sticky left-0 z-10">
                Attributes
              </th>
              {compareProducts.map(product => (
                <th key={product.id} className="p-4 border-b border-slate-100 min-w-[200px] relative">
                  <button 
                    onClick={() => onRemoveFromCompare(product.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <img src={product.imageUrl} alt={product.brandName} className="w-24 h-24 object-cover rounded-lg mb-3 shadow-sm" />
                    <h3 className="font-bold text-slate-800 text-lg">{product.brandName}</h3>
                  </div>
                </th>
              ))}
              {/* Fill empty columns if less than 4 */}
              {[...Array(4 - compareProducts.length)].map((_, i) => (
                <th key={`empty-${i}`} className="p-4 border-b border-slate-100 min-w-[200px] bg-slate-50/50">
                    <div className="h-full flex items-center justify-center text-slate-300 text-sm font-normal italic">
                        Add product
                    </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">Composition</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 text-sm text-slate-600 align-top">{product.composition}</td>
              ))}
              {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">Division</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 text-sm text-slate-600 align-top">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{product.division}</span>
                </td>
              ))}
              {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">Packing</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 text-sm text-slate-600 align-top">{product.packing}</td>
              ))}
               {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">MRP</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 text-lg font-bold text-blue-600 align-top">₹{product.mrp}</td>
              ))}
               {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">Stock Status</td>
              {compareProducts.map(product => (
                <td key={product.id} className="p-4 align-top">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        product.stockStatus === StockStatus.AVAILABLE ? 'bg-green-100 text-green-700 border-green-200' :
                        product.stockStatus === StockStatus.LOW_STOCK ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        product.stockStatus === StockStatus.COMING_SOON ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-red-100 text-red-700 border-red-200'
                    }`}>
                        {product.stockStatus}
                    </span>
                </td>
              ))}
               {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
            <tr>
                <td className="p-4 bg-slate-50 font-medium text-slate-700 sticky left-0">Action</td>
                {compareProducts.map(product => (
                    <td key={product.id} className="p-4 align-top">
                         <button 
                            onClick={() => onAddToCart(product)}
                            disabled={product.stockStatus === StockStatus.OUT_OF_STOCK}
                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition ${
                                product.stockStatus === StockStatus.OUT_OF_STOCK 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                            }`}
                        >
                            <ShoppingBag size={16} /> Order
                        </button>
                    </td>
                ))}
                 {[...Array(4 - compareProducts.length)].map((_, i) => <td key={i} className="p-4 bg-slate-50/50"></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};