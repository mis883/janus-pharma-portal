import React, { useState } from 'react';
import { Product, CartItem, UserRole, User, CompanySettings, Banner, Order, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_DIVISIONS, INITIAL_BANNERS, INITIAL_NEWS_TICKER, INITIAL_SETTINGS, INITIAL_USERS, INITIAL_ORDERS } from './constants';
import { Header, NewsTicker } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { AdminPanel } from './pages/Admin';
import { Wishlist } from './pages/Wishlist';
import { Compare } from './pages/Compare';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { PresentationModal } from './components/PresentationModal';
import { Trash2, Send, X, ShoppingCart, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Global Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [divisions, setDivisions] = useState<string[]>(INITIAL_DIVISIONS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [newsTicker, setNewsTicker] = useState<string[]>(INITIAL_NEWS_TICKER);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_SETTINGS);
  
  // Orders State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // User Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // App Functional State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [presentationList, setPresentationList] = useState<string[]>([]);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [catalogDivision, setCatalogDivision] = useState<string>('All');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Auth Actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // If admin, default to dashboard but they have access to admin panel
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setCart([]);
  };

  // Logic: Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id) 
        : [...prev, product.id]
    );
  };

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 products at a time.");
        return prev;
      }
      return [...prev, product.id];
    });
  };

  const togglePresentation = (product: Product) => {
    setPresentationList(prev => 
      prev.includes(product.id) 
        ? prev.filter(id => id !== product.id) 
        : [...prev, product.id]
    );
  };

  const handleCheckout = () => {
    if (!currentUser) return;

    // Create new Order Object
    const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        date: new Date().toISOString(),
        status: OrderStatus.PENDING,
        items: [...cart],
        totalInquiryValue: cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0),
    };

    // Save Order
    setOrders(prev => [newOrder, ...prev]);

    // Generate WhatsApp Notification (Optional but good UX)
    let message = `*NEW ORDER INQUIRY*\n*Order ID:* ${newOrder.id}\n*Customer:* ${currentUser.name}\n------------------\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.brandName} (${item.packing}) x ${item.quantity}\n`;
    });
    message += `\nTotal Items: ${cart.reduce((a, b) => a + b.quantity, 0)}\n`;
    message += `Order placed via App. Please process immediately.`;

    const url = `https://wa.me/${companySettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Reset Flow
    setCart([]);
    setIsCartOpen(false);
    setCurrentPage('orders'); // Redirect to Orders page to see pending status
    alert("Order Inquiry Sent Successfully! You can track status in 'My Orders'.");
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddUser = (user: User) => {
      setUsers([...users, user]);
  }

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  const handleUpdateOrder = (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const navigateToCatalog = (division: string = 'All') => {
    setCatalogDivision(division);
    setCurrentPage('catalog');
  };

  const handleEditProduct = (product: Product) => {
      setProductToEdit(product);
      setCurrentPage('admin');
  };

  // Render Page Logic
  if (!currentUser) {
      return (
          <Login 
            users={users} 
            onLogin={handleLogin}
            companySettings={companySettings}
          />
      );
  }

  const renderPage = () => {
    switch(currentPage) {
        case 'dashboard':
            return <Dashboard 
                products={products} 
                banners={banners}
                userRole={currentUser.role} 
                onAddToCart={addToCart} 
                onViewAll={() => navigateToCatalog('All')}
                wishlistIds={wishlist}
                compareListIds={compareList}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
                onNavigateToCriticalCare={() => navigateToCatalog('Critical Care')}
                onNavigateToNewLaunches={() => navigateToCatalog('All')}
                onNavigateToAdmin={() => setCurrentPage('admin')}
            />;
        case 'catalog':
        case 'Input Shop': // Handle Input Shop routing by showing Catalog with "Marketing Inputs" pre-selected
             // Note: If navigating to Input Shop, the initialDivision prop below handles it.
             // But if we are already mounted, we might need a useEffect in Catalog or force re-mount.
             // However, passing initialDivision usually works if key changes or logic inside Catalog handles prop updates.
             // Here, let's rely on Catalog's useEffect on initialDivision.
            return <Catalog 
                products={products} 
                divisions={divisions}
                userRole={currentUser.role} 
                onAddToCart={addToCart}
                wishlistIds={wishlist}
                compareListIds={compareList}
                presentationListIds={presentationList}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
                onTogglePresentation={togglePresentation}
                initialDivision={currentPage === 'Input Shop' ? 'Marketing Inputs' : catalogDivision}
                onEditProduct={handleEditProduct}
            />;
        case 'orders':
            return <Orders 
                orders={orders}
                userRole={currentUser.role}
                user={currentUser}
                onUpdateOrder={handleUpdateOrder}
            />;
        case 'wishlist':
            return <Wishlist 
                products={products}
                wishlistIds={wishlist}
                userRole={currentUser.role}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
                compareList={compareList}
            />;
        case 'compare':
            return <Compare 
                products={products}
                compareListIds={compareList}
                onRemoveFromCompare={(id) => setCompareList(prev => prev.filter(i => i !== id))}
                onAddToCart={addToCart}
                onClearCompare={() => setCompareList([])}
            />;
        case 'admin':
            if (currentUser.role !== UserRole.ADMIN) return <div>Access Denied</div>;
            return <AdminPanel 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                productToEdit={productToEdit}
                onClearEdit={() => setProductToEdit(null)}
                // New Props
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                divisions={divisions}
                onAddDivision={(d) => setDivisions([...divisions, d])}
                banners={banners}
                onUpdateBanners={setBanners}
                companySettings={companySettings}
                onUpdateSettings={setCompanySettings}
                newsTicker={newsTicker}
                onUpdateNews={setNewsTicker}
            />;
        default:
            return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <NewsTicker items={newsTicker} />
      <Header 
        userRole={currentUser.role}
        user={currentUser}
        companySettings={companySettings}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        wishlistCount={wishlist.length}
        compareCount={compareList.length}
        presentationCount={presentationList.length}
        onLogout={handleLogout}
        onCartClick={() => setIsCartOpen(true)}
        onPresentationClick={() => setIsPresentationOpen(true)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
          <p>&copy; 2024 {companySettings.name}. All rights reserved.</p>
          <p className="text-xs text-slate-600 mt-2">{companySettings.address}</p>
      </footer>

      <PresentationModal 
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          selectedProductIds={presentationList}
          allProducts={products}
          onRemoveProduct={(id) => setPresentationList(prev => prev.filter(pid => pid !== id))}
      />

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                      <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={20} /> Review Order</h2>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {cart.length === 0 ? (
                          <div className="text-center py-10 text-slate-400">
                              <p>Your list is empty.</p>
                              <button onClick={() => {setIsCartOpen(false); setCurrentPage('catalog')}} className="mt-4 text-blue-600 font-medium">Browse Products</button>
                          </div>
                      ) : (
                          cart.map(item => (
                              <div key={item.id} className="flex gap-4 p-3 border rounded-lg hover:border-blue-200 transition">
                                  <img src={item.imageUrl} alt={item.brandName} className="w-16 h-16 object-cover rounded bg-slate-100" />
                                  <div className="flex-1">
                                      <h4 className="font-bold text-slate-800">{item.brandName}</h4>
                                      <p className="text-xs text-slate-500">{item.packing}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-bold">-</button>
                                          <span className="text-sm font-medium">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-bold">+</button>
                                      </div>
                                  </div>
                                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 self-start"><Trash2 size={18} /></button>
                              </div>
                          ))
                      )}
                  </div>

                  <div className="p-4 border-t bg-slate-50">
                      <div className="flex justify-between mb-4 text-slate-600 font-medium">
                          <span>Total Items:</span>
                          <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                      </div>
                       <div className="flex justify-between mb-4 text-slate-800 font-bold text-lg">
                          <span>Approx Value:</span>
                          <span>₹{cart.reduce((a, b) => a + (b.mrp * b.quantity), 0).toLocaleString()}</span>
                      </div>
                      <button 
                          onClick={handleCheckout}
                          disabled={cart.length === 0}
                          className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${cart.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'}`}
                      >
                          <CheckCircle size={18} /> Send Order Inquiry
                      </button>
                      <p className="text-xs text-center text-slate-400 mt-2">Sends inquiry to staff. Status will appear in 'My Orders'.</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};