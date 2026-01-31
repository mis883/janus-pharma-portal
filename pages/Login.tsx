import React, { useState } from 'react';
import { Package, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { User, CompanySettings } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  companySettings: CompanySettings;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin, companySettings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (user.isBlocked) {
        setError("Your account has been blocked. Contact Admin.");
        return;
      }
      onLogin(user);
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleWhatsAppHelp = () => {
      window.open(`https://wa.me/${companySettings.whatsappNumber}?text=Help%20recovering%20password`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 p-8 text-center">
            <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Package size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-nexa">{companySettings.name}</h1>
            <p className="text-blue-200 text-sm mt-1">Authorized Distributor Portal</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-200">
                    Login Securely
                </button>
            </form>

            <div className="mt-6 text-center">
                <button onClick={handleWhatsAppHelp} className="text-sm text-slate-500 hover:text-blue-600 hover:underline">
                    Forgot Password? Contact Support
                </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                    Restricted Access. Unauthorized use is prohibited.
                    <br />© 2024 Janus Biotech.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};