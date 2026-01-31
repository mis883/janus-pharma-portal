import React, { useState, useEffect } from 'react';
import { Upload, Plus, FileSpreadsheet, Save, CheckCircle, Heart, User, Edit2, Search, Sparkles, Send, Image, FileText, Video, Star, Calendar, Tag, Trash2, Shield, Settings, Layout, Users, Gift } from 'lucide-react';
import { Product, StockStatus, User as UserType, UserRole, Banner, CompanySettings } from '../types';
import { askAdminAssistant, generateProductTags } from '../services/geminiService';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  productToEdit?: Product | null;
  onClearEdit?: () => void;
  // New Props
  users: UserType[];
  onAddUser: (user: UserType) => void;
  onUpdateUser: (user: UserType) => void;
  divisions: string[];
  onAddDivision: (division: string) => void;
  banners: Banner[];
  onUpdateBanners: (banners: Banner[]) => void;
  companySettings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => void;
  newsTicker: string[];
  onUpdateNews: (news: string[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  productToEdit, 
  onClearEdit,
  users,
  onAddUser,
  onUpdateUser,
  divisions,
  onAddDivision,
  banners,
  onUpdateBanners,
  companySettings,
  onUpdateSettings,
  newsTicker,
  onUpdateNews
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'content' | 'settings' | 'ai'>('products');
  const [subTab, setSubTab] = useState<'single' | 'bulk' | 'manage'>('single');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');
  
  // AI State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSearch, setEditSearch] = useState('');

  // Form State (Product)
  const [formData, setFormData] = useState<Partial<Product>>({
    brandName: '',
    composition: '',
    division: 'General',
    mrp: 0,
    packing: '',
    stockStatus: StockStatus.AVAILABLE,
    imageUrl: '',
    visualAidUrl: '',
    videoUrl: '',
    launchDate: new Date().toISOString().split('T')[0],
    isTrending: false,
    tags: [],
    isPromotional: false
  });

  // Handle external edit request from Product Card
  useEffect(() => {
    if (productToEdit) {
        setEditingId(productToEdit.id);
        setFormData({...productToEdit});
        setActiveTab('products');
        setSubTab('single');
    }
  }, [productToEdit]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'visualAidUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (product: Product) => {
      setEditingId(product.id);
      setFormData({...product});
      setSubTab('single');
  };

  const handleToggleTrending = (product: Product) => {
      onUpdateProduct({...product, isTrending: !product.isTrending});
  };

  const generateTags = async () => {
      if (formData.brandName) {
          setIsGeneratingTags(true);
          const tags = await generateProductTags(formData.brandName, formData.composition || '');
          setFormData(prev => ({...prev, tags}));
          setIsGeneratingTags(false);
      }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalTags = formData.tags || [];
    if (finalTags.length === 0 && formData.brandName) {
         setIsGeneratingTags(true);
         finalTags = await generateProductTags(formData.brandName, formData.composition || '');
         setIsGeneratingTags(false);
    }
    
    // Auto set division for promotional
    if(formData.isPromotional) {
        formData.division = 'Marketing Inputs';
    }

    if (editingId) {
        if (formData.brandName && formData.id) {
            onUpdateProduct({ ...formData, tags: finalTags } as Product);
            setEditingId(null);
            setUploadStatus('success');
            if (onClearEdit) onClearEdit();
        }
    } else {
        const newProduct: Product = {
            id: Math.random().toString(36).substr(2, 9),
            brandName: formData.brandName || 'New Product',
            composition: formData.composition || '',
            division: formData.division || 'General',
            packing: formData.packing || '',
            mrp: formData.mrp || 0,
            stockStatus: formData.stockStatus || StockStatus.AVAILABLE,
            imageUrl: formData.imageUrl || 'https://picsum.photos/400/400', 
            visualAidUrl: formData.visualAidUrl,
            videoUrl: formData.videoUrl,
            landingCost: formData.landingCost || 0,
            launchDate: formData.launchDate || new Date().toISOString().split('T')[0],
            isTrending: formData.isTrending || false,
            tags: finalTags,
            isPromotional: formData.isPromotional || false
        };
        onAddProduct(newProduct);
        setUploadStatus('success');
    }

    setTimeout(() => setUploadStatus('idle'), 3000);
    if (!editingId) setFormData({ 
        brandName: '', composition: '', division: 'General', mrp: 0, packing: '',
        imageUrl: '', visualAidUrl: '', videoUrl: '',
        launchDate: new Date().toISOString().split('T')[0], isTrending: false, tags: [], isPromotional: false
    });
  };

  // --- Render Functions ---

  const renderProductTab = () => (
    <div className="space-y-6">
        <div className="flex border-b border-slate-200">
             <button onClick={() => setSubTab('single')} className={`px-4 py-2 text-sm font-medium ${subTab === 'single' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600'}`}>Add/Edit Product</button>
             <button onClick={() => setSubTab('manage')} className={`px-4 py-2 text-sm font-medium ${subTab === 'manage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600'}`}>Manage Inventory</button>
             <button onClick={() => setSubTab('bulk')} className={`px-4 py-2 text-sm font-medium ${subTab === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600'}`}>Bulk Import</button>
        </div>

        {subTab === 'single' && (
            <form onSubmit={handleSubmitProduct} className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-700">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                    {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({}); if(onClearEdit) onClearEdit();}} className="text-sm text-red-500">Cancel</button>}
                </div>

                <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-2 mb-4">
                     <input type="checkbox" id="isPromo" className="w-5 h-5 text-blue-600 rounded" checked={formData.isPromotional} onChange={e => setFormData({...formData, isPromotional: e.target.checked, division: e.target.checked ? 'Marketing Inputs' : 'General'})} />
                     <label htmlFor="isPromo" className="font-bold text-slate-700 flex items-center gap-2"><Gift size={18} className="text-purple-500"/> Is Promotional Material (Input Shop)</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Product Name / Brand" className="border p-2 rounded col-span-2" value={formData.brandName} onChange={e => setFormData({...formData, brandName: e.target.value})} />
                    
                    {!formData.isPromotional && (
                         <input required placeholder="Salt Composition" className="border p-2 rounded" value={formData.composition || ''} onChange={e => setFormData({...formData, composition: e.target.value})} />
                    )}
                    
                    <select className="border p-2 rounded" value={formData.division} disabled={formData.isPromotional} onChange={e => setFormData({...formData, division: e.target.value})}>
                        {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400">₹</span>
                        <input required type="number" placeholder="MRP" className="border p-2 pl-6 rounded w-full" value={formData.mrp} onChange={e => setFormData({...formData, mrp: Number(e.target.value)})} />
                        {formData.mrp === 0 && <span className="absolute right-3 top-2 text-green-600 text-xs font-bold">Free</span>}
                    </div>

                    <input required placeholder="Packing (e.g. 1 Unit, 10x10)" className="border p-2 rounded" value={formData.packing} onChange={e => setFormData({...formData, packing: e.target.value})} />
                    
                     <select className="border p-2 rounded" value={formData.stockStatus} onChange={e => setFormData({...formData, stockStatus: e.target.value as StockStatus})}>
                        <option value={StockStatus.AVAILABLE}>Available</option>
                        <option value={StockStatus.LOW_STOCK}>Low Stock</option>
                        <option value={StockStatus.OUT_OF_STOCK}>Out of Stock</option>
                     </select>
                </div>
                
                 {/* AI Tags Section */}
                 <div className="bg-slate-50 p-4 rounded-lg">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-2">Semantic Tags (AI)</p>
                     <div className="flex flex-wrap gap-2 mb-2">
                         {formData.tags?.map((tag, idx) => <span key={idx} className="bg-white px-2 py-1 rounded text-xs border">{tag}</span>)}
                     </div>
                     <button type="button" onClick={generateTags} disabled={!formData.brandName} className="text-xs text-blue-600 font-bold flex items-center gap-1"><Sparkles size={12}/> Generate Tags</button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="text-xs block mb-1">Image</label>
                         <input type="file" onChange={(e) => handleFileUpload(e, 'imageUrl')} />
                    </div>
                     <div>
                         <label className="text-xs block mb-1">Launch Date</label>
                         <input type="date" className="border p-2 rounded w-full" value={formData.launchDate} onChange={(e) => setFormData({...formData, launchDate: e.target.value})} />
                    </div>
                 </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold">Save Product</button>
            </form>
        )}

        {subTab === 'manage' && (
             <div className="space-y-4">
                 <input placeholder="Search inventory..." className="w-full border p-2 rounded" value={editSearch} onChange={e => setEditSearch(e.target.value)} />
                 <div className="border rounded overflow-hidden">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-100"><tr><th className="p-2">Name</th><th className="p-2">Type</th><th className="p-2">Stock</th><th className="p-2">Trending</th><th className="p-2">Action</th></tr></thead>
                         <tbody>
                             {products.filter(p => p.brandName.toLowerCase().includes(editSearch.toLowerCase())).map(p => (
                                 <tr key={p.id} className="border-t">
                                     <td className="p-2">{p.brandName}</td>
                                     <td className="p-2">{p.isPromotional ? <span className="text-purple-600 font-bold text-xs">Promo</span> : 'Medicine'}</td>
                                     <td className="p-2">{p.stockStatus}</td>
                                     <td className="p-2 text-center"><button onClick={() => handleToggleTrending(p)}><Star size={16} className={p.isTrending ? "fill-orange-400 text-orange-400" : "text-slate-300"} /></button></td>
                                     <td className="p-2"><button onClick={() => handleEditClick(p)} className="text-blue-600"><Edit2 size={16} /></button></td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}
        
        {subTab === 'bulk' && <div className="text-center py-10 text-slate-500">Bulk Import via CSV placeholder</div>}
    </div>
  );

  const renderUsersTab = () => {
    const [newUser, setNewUser] = useState<Partial<UserType>>({ role: UserRole.CUSTOMER, isBlocked: false });
    
    const handleCreateUser = () => {
        if(newUser.username && newUser.password && newUser.name) {
            onAddUser({ ...newUser, id: Date.now().toString() } as UserType);
            setNewUser({ role: UserRole.CUSTOMER, isBlocked: false, username: '', password: '', name: '' });
        }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8">
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User size={20}/> Create New User</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                 <div className="lg:col-span-1">
                     <label className="text-xs block mb-1">Role</label>
                     <select className="w-full p-2 border rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                         <option value={UserRole.ADMIN}>Admin</option>
                         <option value={UserRole.STAFF}>Staff</option>
                         <option value={UserRole.CUSTOMER}>Distributor</option>
                     </select>
                 </div>
                 <div className="lg:col-span-1">
                     <label className="text-xs block mb-1">Full Name</label>
                     <input className="w-full p-2 border rounded" placeholder="John Doe" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1">
                     <label className="text-xs block mb-1">Username</label>
                     <input className="w-full p-2 border rounded" placeholder="username" value={newUser.username || ''} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1">
                     <label className="text-xs block mb-1">Password</label>
                     <input className="w-full p-2 border rounded" placeholder="password" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                 </div>
                 <div className="lg:col-span-1">
                     <button onClick={handleCreateUser} className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Create</button>
                 </div>
             </div>
         </div>

         <div>
             <h3 className="font-bold text-lg mb-4">User List</h3>
             <div className="border rounded-xl overflow-hidden">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100">
                         <tr>
                             <th className="p-3">Name</th>
                             <th className="p-3">Role</th>
                             <th className="p-3">Username</th>
                             <th className="p-3">Status</th>
                             <th className="p-3">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y">
                         {users.map(u => (
                             <tr key={u.id} className="bg-white">
                                 <td className="p-3 font-medium">{u.name}</td>
                                 <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{u.role}</span></td>
                                 <td className="p-3 text-slate-500">{u.username}</td>
                                 <td className="p-3">
                                     {u.isBlocked ? <span className="text-red-500 font-bold text-xs">Blocked</span> : <span className="text-green-600 font-bold text-xs">Active</span>}
                                 </td>
                                 <td className="p-3">
                                     <button 
                                        onClick={() => onUpdateUser({...u, isBlocked: !u.isBlocked})}
                                        className={`text-xs px-2 py-1 rounded border ${u.isBlocked ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-red-200 text-red-500 hover:bg-red-50'}`}
                                     >
                                         {u.isBlocked ? 'Unblock' : 'Block'}
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>
      </div>
    );
  };

  const renderContentTab = () => {
    const [newDivision, setNewDivision] = useState('');
    const [newsInput, setNewsInput] = useState(newsTicker.join('\n'));

    const handleSaveNews = () => {
        onUpdateNews(newsInput.split('\n').filter(s => s.trim().length > 0));
        alert("News Ticker Updated!");
    };

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Divisions */}
          <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Layout size={20}/> Specialty Divisions</h3>
              <div className="flex gap-2">
                  <input className="flex-1 border p-2 rounded" placeholder="New Division Name" value={newDivision} onChange={e => setNewDivision(e.target.value)} />
                  <button onClick={() => {if(newDivision) {onAddDivision(newDivision); setNewDivision('')}}} className="bg-blue-600 text-white px-4 rounded font-bold"><Plus size={16}/></button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {divisions.map(d => <span key={d} className="bg-slate-100 px-3 py-1 rounded-full text-sm border">{d}</span>)}
              </div>
          </div>

          {/* News Ticker */}
          <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Calendar size={20}/> Flash News</h3>
              <textarea 
                className="w-full border p-2 rounded h-32 text-sm" 
                value={newsInput}
                onChange={e => setNewsInput(e.target.value)}
                placeholder="Enter each news item on a new line..."
              />
              <button onClick={handleSaveNews} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm w-full">Update News Ticker</button>
          </div>

          {/* Banners (Simplified View) */}
          <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <h3 className="font-bold text-lg flex items-center gap-2"><Image size={20}/> Home Screen Banners</h3>
              <p className="text-sm text-slate-500">Currently showing {banners.length} active banners.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {banners.map(b => (
                      <div key={b.id} className="relative aspect-video bg-slate-100 rounded overflow-hidden group">
                          <img src={b.imageUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 text-white p-2 text-xs flex items-end opacity-0 group-hover:opacity-100 transition">
                              {b.headline}
                          </div>
                      </div>
                  ))}
              </div>
              <p className="text-xs text-slate-400 italic">Banner management UI is simplified for this demo.</p>
          </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    const [settings, setSettings] = useState(companySettings);

    const handleSave = () => {
        onUpdateSettings(settings);
        alert("Settings Saved!");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20}/> Company Settings</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input className="w-full border p-2 rounded" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input className="w-full border p-2 rounded" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Support Phone</label>
                    <input className="w-full border p-2 rounded" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp Number (No +)</label>
                    <input className="w-full border p-2 rounded" value={settings.whatsappNumber} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Logo URL</label>
                    <input className="w-full border p-2 rounded" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} />
                </div>
            </div>

            <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Save Changes</button>
        </div>
    );
  };
  
  const handleAskAI = async () => {
      if (!aiQuery.trim()) return;
      setIsAiLoading(true);
      const context = JSON.stringify(products.map(p => ({name: p.brandName, stock: p.stockStatus, price: p.mrp})));
      const res = await askAdminAssistant(aiQuery, context);
      setAiResponse(res);
      setIsAiLoading(false);
  };

  const renderAITab = () => (
      <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Sparkles /> Admin AI Assistant</h3>
              <p className="text-purple-100 text-sm">Ask about market trends, draft descriptions, or analyze your inventory.</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm min-h-[300px] flex flex-col">
              {aiResponse ? (
                  <div className="bg-slate-50 p-4 rounded-lg mb-4 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                  </div>
              ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                      AI response will appear here...
                  </div>
              )}
              <div className="mt-auto relative">
                  <input 
                      type="text" 
                      className="w-full border rounded-xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Ask me anything..."
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                  />
                  <button onClick={handleAskAI} disabled={isAiLoading} className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                      {isAiLoading ? <span className="animate-spin text-xs">...</span> : <Send size={18} />}
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
        {/* Main Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-slate-50">
          <button 
            className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('products')}
          >
            <Layout size={18}/> Products
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18}/> Users
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'content' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('content')}
          >
            <Image size={18}/> Content
          </button>
          <button 
            className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18}/> Settings
          </button>
           <button 
            className={`flex-1 py-4 px-4 text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-slate-500 hover:bg-white/50'}`}
            onClick={() => setActiveTab('ai')}
          >
            <Sparkles size={18}/> AI
          </button>
        </div>

        <div className="p-4 md:p-8">
            {activeTab === 'products' && renderProductTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'content' && renderContentTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'ai' && renderAITab()}
        </div>
      </div>
    </div>
  );
};