import React, { useState } from 'react';
import { ShoppingCart, Menu, Phone, Package, Heart, Search, Settings, PlusCircle, Edit, MessageSquare, MonitorPlay, LogOut, User as UserIcon, ClipboardList, Gift } from 'lucide-react';
import { UserRole, User, CompanySettings } from '../types';

interface LayoutProps {
  children?: React.ReactNode;
  userRole: UserRole;
  user: User | null;
  companySettings: CompanySettings;
  cartCount: number;
  wishlistCount: number;
  compareCount: number;
  presentationCount: number;
  onLogout: () => void;
  onCartClick: () => void;
  onPresentationClick: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const NewsTicker: React.FC<{items: string[]}> = ({ items }) => {
  return (
    <div className="bg-blue-900 text-white text-sm py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap">
        {items.map((item, index) => (
          <span key={index} className="mx-8 inline-block">• {item}</span>
        ))}
      </div>
    </div>
  );
};

export const Header: React.FC<LayoutProps> = ({ 
  userRole, 
  user,
  companySettings,
  cartCount,
  wishlistCount,
  compareCount,
  presentationCount,
  onLogout, 
  onCartClick,
  onPresentationClick,
  onNavigate,
  currentPage 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Utility Bar */}
      <div className="bg-slate-100 px-4 py-1 flex justify-between items-center text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Phone size={12} /> Support: {companySettings.phone}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline">Logged in as:</span>
          <span className="font-bold text-blue-800">{user?.name} ({userRole})</span>
          <button onClick={onLogout} className="ml-2 text-red-500 hover:underline flex items-center gap-1">
             <LogOut size={10} /> Logout
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 mr-2" onClick={() => onNavigate('dashboard')}>
          {companySettings.logoUrl ? (
             <img src={companySettings.logoUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <div className="bg-blue-600 text-white p-1.5 md:p-2 rounded-lg flex-shrink-0">
                <Package size={20} className="md:w-6 md:h-6" />
            </div>
          )}
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-base md:text-xl font-bold text-blue-900 leading-none font-nexa tracking-tight truncate">{companySettings.name}</h1>
            <span className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">Franchise Portal</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 mr-6">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className={`font-medium ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate('catalog')} 
            className={`font-medium ${currentPage === 'catalog' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Product Library
          </button>
           <button 
            onClick={() => onNavigate('Input Shop')} 
            className={`font-medium flex items-center gap-1 ${currentPage === 'Input Shop' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
             <Gift size={16} /> Input Shop
          </button>
          <button 
            onClick={() => onNavigate('orders')} 
            className={`font-medium flex items-center gap-1 ${currentPage === 'orders' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
          >
            {userRole === UserRole.CUSTOMER ? 'My Orders' : 'Manage Orders'}
          </button>
          
          <button 
            onClick={onPresentationClick} 
            className="font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1"
            title="Presentation Mode"
          >
            Presentation 
            {presentationCount > 0 && <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 rounded-full">{presentationCount}</span>}
          </button>

          {userRole === UserRole.CUSTOMER && (
            <>
              <button 
                onClick={() => onNavigate('wishlist')} 
                className={`font-medium flex items-center gap-1 ${currentPage === 'wishlist' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Wishlist 
                {wishlistCount > 0 && <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-1.5 rounded-full">{wishlistCount}</span>}
              </button>
              <button 
                onClick={() => onNavigate('compare')} 
                className={`font-medium flex items-center gap-1 ${currentPage === 'compare' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                Compare
                {compareCount > 0 && <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-1.5 rounded-full">{compareCount}</span>}
              </button>
            </>
          )}
          {userRole === UserRole.ADMIN && (
            <div className="relative">
                <button 
                  onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                  className={`font-medium flex items-center gap-1 ${currentPage === 'admin' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  Admin Panel <Settings size={16} />
                </button>
                {isAdminDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50">
                        <button onClick={() => {onNavigate('admin'); setIsAdminDropdownOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2">
                            <PlusCircle size={16} /> Add Product
                        </button>
                        <button onClick={() => {onNavigate('admin'); setIsAdminDropdownOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Edit size={16} /> Manage Content
                        </button>
                        <button onClick={() => {onNavigate('admin'); setIsAdminDropdownOpen(false)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2">
                            <UserIcon size={16} /> Manage Users
                        </button>
                    </div>
                )}
            </div>
          )}
        </nav>

        {/* Actions Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={() => onNavigate('catalog')}
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-700"
            title="Search Products"
          >
            <Search size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Mobile Only Nav Icons */}
          {userRole === UserRole.CUSTOMER && (
             <div className="flex lg:hidden gap-1">
                <button onClick={() => onNavigate('wishlist')} className="relative p-2">
                  <Heart size={20} className={currentPage === 'wishlist' ? 'text-blue-600 fill-current' : 'text-slate-700'} />
                </button>
             </div>
          )}

          <button className="relative p-2 hover:bg-slate-100 rounded-full transition" onClick={onCartClick}>
            <ShoppingCart size={20} className="md:w-6 md:h-6 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
          
          <button className="lg:hidden p-2 ml-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} className="text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg absolute w-full z-40 animate-in slide-in-from-top-5">
           <button 
            onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} 
            className="text-left font-medium text-slate-700"
          >
            Dashboard
          </button>
          <button 
            onClick={() => { onNavigate('catalog'); setIsMenuOpen(false); }} 
            className="text-left font-medium text-slate-700"
          >
            Product Library
          </button>
           <button 
            onClick={() => { onNavigate('Input Shop'); setIsMenuOpen(false); }} 
            className="text-left font-medium text-slate-700 flex items-center gap-2"
          >
            Input Shop <Gift size={16} />
          </button>
          <button 
            onClick={() => { onNavigate('orders'); setIsMenuOpen(false); }} 
            className="text-left font-medium text-slate-700 flex items-center gap-2"
          >
            {userRole === UserRole.CUSTOMER ? 'My Orders' : 'Manage Orders'} <ClipboardList size={16} />
          </button>
          
          <button 
            onClick={() => { onPresentationClick(); setIsMenuOpen(false); }} 
            className="text-left font-medium text-slate-700 flex justify-between items-center"
          >
             Presentation Mode <MonitorPlay size={16} />
          </button>

          {userRole === UserRole.CUSTOMER && (
            <>
              <button 
                onClick={() => { onNavigate('wishlist'); setIsMenuOpen(false); }} 
                className="text-left font-medium text-slate-700 flex justify-between"
              >
                My Wishlist <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{wishlistCount}</span>
              </button>
              <button 
                onClick={() => { onNavigate('compare'); setIsMenuOpen(false); }} 
                className="text-left font-medium text-slate-700 flex justify-between"
              >
                Compare Products <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{compareCount}</span>
              </button>
            </>
          )}
          {userRole === UserRole.ADMIN && (
             <button 
              onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} 
              className="text-left font-medium text-slate-700"
            >
              Admin Panel
            </button>
          )}
          <button onClick={onLogout} className="text-left font-medium text-red-500 flex items-center gap-2 pt-2 border-t">
              <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>
  );
};