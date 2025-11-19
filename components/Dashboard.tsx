
import React, { useState } from 'react';
import { CardData, ContactSubmission } from '../types';
import { CardPreview } from './CardPreview';
import { 
  LayoutGrid, Users, PieChart, Settings, Plus, Search, Filter, 
  MoreHorizontal, Edit, Eye, Share2, ArrowUpRight, Signal, SlidersHorizontal,
  Download, Mail, Phone, Calendar, ChevronRight, ArrowDownToLine,
  CreditCard, Lock, Bell, Shield, LogOut, CheckCircle2, Upload, Copy, Trash2, User
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ShareModal } from './ShareModal';
import { useLanguage } from '../LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface DashboardProps {
  sites: CardData[];
  onEdit: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (site: CardData) => void;
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sites, onEdit, onCreate, onDelete, onDuplicate, onUpdate, onLogout }) => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'links' | 'contacts' | 'analytics' | 'settings'>('links');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sharingSite, setSharingSite] = useState<CardData | null>(null);
  const [userEmail, setUserEmail] = useState('alex@example.com');
  const [userName, setUserName] = useState('Alex Rivera');

  // --- Aggregated Data Helpers ---
  const allContacts = sites.flatMap(site => 
    (site.collectedContacts || []).map(contact => ({
        ...contact,
        source: site.internalName
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalViews = sites.reduce((acc, site) => acc + (site.analytics?.views || 0), 0);
  const totalClicks = sites.reduce((acc, site) => acc + (site.analytics?.clicks || 0), 0);
  const avgCtr = sites.length > 0 ? (sites.reduce((acc, site) => acc + (site.analytics?.ctr || 0), 0) / sites.length).toFixed(1) : 0;

  // Close menu when clicking outside
  const handleMenuToggle = (id: string) => {
      if (openMenuId === id) {
          setOpenMenuId(null);
      } else {
          setOpenMenuId(id);
      }
  };

  const handleUpgrade = () => {
      alert("Redirecting to payment provider...");
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans text-slate-900">
      {/* Dropdown Backdrop */}
      {openMenuId && (
          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
           <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
              <LayoutGrid size={18} />
           </div>
           <span className="font-bold text-xl tracking-tight text-slate-900">WeShare</span>
        </div>

        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
           <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</div>
           <nav className="space-y-0.5">
              <button 
                onClick={() => setActiveView('links')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === 'links' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                 <LayoutGrid size={18} /> {t('dashboard.myLinks')}
              </button>
              <button 
                onClick={() => setActiveView('contacts')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === 'contacts' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                 <Users size={18} /> {t('dashboard.contacts')}
                 {allContacts.length > 0 && (
                    <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{allContacts.length}</span>
                 )}
              </button>
              <button 
                onClick={() => setActiveView('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === 'analytics' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                 <PieChart size={18} /> {t('dashboard.analytics')}
              </button>
           </nav>
           
           <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6">{t('dashboard.system')}</div>
           <nav className="space-y-0.5">
              <button 
                onClick={() => setActiveView('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${activeView === 'settings' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                 <Settings size={18} /> {t('dashboard.settings')}
              </button>
           </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg">
              <h4 className="font-bold text-sm mb-1">{t('dashboard.upgrade')}</h4>
              <p className="text-xs opacity-70 mb-3">{t('dashboard.upgradeDesc')}</p>
              <button 
                onClick={handleUpgrade}
                className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
              >
                  {t('dashboard.viewPlans')}
              </button>
           </div>
           
           <div 
                className="flex items-center gap-3 mt-4 px-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                onClick={() => setActiveView('settings')}
           >
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=random`} alt="User" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                 <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
         {/* Header */}
         <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-900">
                    {activeView === 'links' && t('dashboard.myLinks')}
                    {activeView === 'contacts' && t('dashboard.contacts')}
                    {activeView === 'analytics' && t('dashboard.analytics')}
                    {activeView === 'settings' && t('dashboard.settings')}
                </h1>
                {activeView === 'links' && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium hidden sm:inline-block">{sites.length} Sites</span>
                )}
             </div>
             
             <div className="flex items-center gap-3">
                <LanguageSwitcher />
                {activeView === 'links' && (
                    <>
                        <div className="hidden md:flex relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder={t('common.search')}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none w-64 transition-all focus:w-72"
                            />
                        </div>
                        <Button onClick={onCreate} size="sm" icon={<Plus size={16} />}>{t('dashboard.createNew')}</Button>
                    </>
                )}
                {activeView === 'contacts' && (
                     <Button variant="outline" size="sm" icon={<ArrowDownToLine size={16} />}>{t('dashboard.exportCsv')}</Button>
                )}
             </div>
         </header>
         
         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
             
             {/* LINKS VIEW */}
             {activeView === 'links' && (
                 <>
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                                <Filter size={14} /> {t('common.filter')}
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                                <SlidersHorizontal size={14} /> {t('common.sort')}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Create New Card Placeholder */}
                        <button 
                            onClick={onCreate}
                            className="group relative aspect-[9/16] md:aspect-auto md:h-[420px] rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                                <Plus size={32} />
                            </div>
                            <span className="font-medium text-slate-500 group-hover:text-blue-600">{t('dashboard.createNewCard')}</span>
                        </button>

                        {/* Site Cards */}
                        {sites.map((site) => (
                            <div 
                                key={site.id} 
                                className={`
                                    bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-[420px] relative
                                    ${openMenuId === site.id ? 'z-20 ring-2 ring-slate-900 ring-offset-2' : 'z-0'}
                                `}
                            >
                                <div className="flex-1 bg-slate-100 relative overflow-hidden group cursor-pointer rounded-t-3xl" onClick={() => onEdit(site.id)}>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="transform scale-[0.45] origin-center">
                                            <CardPreview data={site} className="pointer-events-none shadow-none" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-bold text-slate-900">
                                            {t('dashboard.editSite')}
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-sm border border-white/50">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">{t('dashboard.live')}</span>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-white z-10 rounded-b-3xl">
                                    <div className="flex justify-between items-start mb-3 relative">
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-slate-900 truncate pr-2" title={site.internalName}>{site.internalName}</h3>
                                            <a href={`#`} className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 mt-0.5 truncate">
                                                weshare.site/u/{site.profile.name.replace(/\s+/g, '').toLowerCase()} <ArrowUpRight size={10} />
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleMenuToggle(site.id); }}
                                                className="text-slate-400 hover:text-slate-600 p-1 shrink-0 rounded-full hover:bg-slate-100 transition-colors"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {openMenuId === site.id && (
                                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setOpenMenuId(null);
                                                            setTimeout(() => onDuplicate(site.id), 10);
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Copy size={14} /> {t('dashboard.duplicate')}
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setOpenMenuId(null);
                                                            setTimeout(() => onDelete(site.id), 10); 
                                                        }}
                                                        className="w-full px-4 py-2.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-50"
                                                    >
                                                        <Trash2 size={14} /> {t('common.delete')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <button 
                                            onClick={() => onEdit(site.id)}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-medium transition-colors border border-slate-100"
                                        >
                                            <Edit size={14} /> {t('common.edit')}
                                        </button>
                                        <button 
                                            onClick={() => setActiveView('analytics')} 
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-medium transition-colors border border-slate-100"
                                        >
                                            <PieChart size={14} /> {t('dashboard.stats')}
                                        </button>
                                        <button 
                                            onClick={() => setSharingSite(site)}
                                            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-medium transition-colors border border-slate-100"
                                        >
                                            <Share2 size={14} /> {t('dashboard.share')}
                                        </button>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Eye size={12} /> {site.analytics?.views || 0}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Signal size={12} /> {site.analytics?.ctr || 0}% CTR
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </>
             )}

             {/* CONTACTS VIEW */}
             {activeView === 'contacts' && (
                 <div className="animate-fade-in max-w-6xl mx-auto">
                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                         {allContacts.length === 0 ? (
                             <div className="p-12 text-center flex flex-col items-center">
                                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                     <Users size={32} />
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-900">{t('dashboard.noContacts')}</h3>
                                 <p className="text-slate-500 max-w-sm mt-2">{t('dashboard.noContactsDesc')}</p>
                             </div>
                         ) : (
                             <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm">
                                     <thead>
                                         <tr className="bg-slate-50 border-b border-slate-200">
                                             <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                             <th className="px-6 py-4 font-semibold text-slate-700">Contact Info</th>
                                             <th className="px-6 py-4 font-semibold text-slate-700 hidden md:table-cell">Source</th>
                                             <th className="px-6 py-4 font-semibold text-slate-700 hidden sm:table-cell">Date</th>
                                             <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {allContacts.map((contact) => (
                                             <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                                                 <td className="px-6 py-4">
                                                     <div className="flex items-center gap-3">
                                                         <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                                             {contact.name.charAt(0)}
                                                         </div>
                                                         <span className="font-medium text-slate-900">{contact.name}</span>
                                                     </div>
                                                 </td>
                                                 <td className="px-6 py-4">
                                                     <div className="flex flex-col gap-1">
                                                         <div className="flex items-center gap-2 text-slate-600">
                                                             <Mail size={12} /> {contact.email}
                                                         </div>
                                                         {contact.phone && (
                                                             <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                                 <Phone size={12} /> {contact.phone}
                                                             </div>
                                                         )}
                                                     </div>
                                                 </td>
                                                 <td className="px-6 py-4 hidden md:table-cell">
                                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                         {contact.source}
                                                     </span>
                                                 </td>
                                                 <td className="px-6 py-4 hidden sm:table-cell text-slate-500">
                                                     <div className="flex items-center gap-2">
                                                         <Calendar size={14} />
                                                         {new Date(contact.date).toLocaleDateString()}
                                                     </div>
                                                 </td>
                                                 <td className="px-6 py-4 text-right">
                                                     <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50">
                                                         <MoreHorizontal size={16} />
                                                     </button>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         )}
                     </div>
                 </div>
             )}

             {/* ANALYTICS VIEW */}
             {activeView === 'analytics' && (
                 <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2">
                                 <Eye size={16} /> {t('dashboard.totalViews')}
                             </div>
                             <div className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2">
                                 <Download size={16} /> {t('dashboard.totalClicks')}
                             </div>
                             <div className="text-3xl font-bold text-slate-900">{totalClicks.toLocaleString()}</div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2">
                                 <Signal size={16} /> {t('dashboard.avgCtr')}
                             </div>
                             <div className="text-3xl font-bold text-slate-900">{avgCtr}%</div>
                         </div>
                     </div>

                     <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-64 text-center">
                         <div className="bg-slate-50 p-4 rounded-full mb-4">
                             <PieChart size={32} className="text-slate-400" />
                         </div>
                         <h3 className="font-bold text-slate-900">Detailed Analytics Coming Soon</h3>
                         <p className="text-slate-500 text-sm mt-1">We are building more charts for you.</p>
                     </div>
                 </div>
             )}

             {/* SETTINGS VIEW */}
             {activeView === 'settings' && (
                 <div className="animate-fade-in max-w-4xl mx-auto pb-20">
                    <div className="space-y-6">
                        
                        {/* Profile Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <User size={18} /> General Profile
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Manage your personal information.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=random&size=128`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <Button variant="outline" size="sm">{t('editor.upload')}</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label={t('editor.fullName')} value={userName} onChange={(e) => setUserName(e.target.value)} />
                                    <Input label={t('auth.email')} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                                </div>
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={() => alert("Profile saved!")}>{t('common.save')}</Button>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard size={18} /> Subscription
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Manage your plan and billing.</p>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-slate-900">Starter Plan</div>
                                    <div className="text-sm text-slate-500">Free forever</div>
                                </div>
                                <Button onClick={handleUpgrade}>{t('dashboard.upgrade')}</Button>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Lock size={18} /> Security
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Password and security settings.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <Input label="New Password" type="password" placeholder="••••••••" />
                                <div className="flex justify-end">
                                     <Button size="sm" variant="outline">Update Password</Button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-red-100">
                                <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                    <Shield size={18} /> Account Actions
                                </h2>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div className="text-sm text-red-700">
                                    <strong>Log Out</strong>
                                    <p className="opacity-80">Sign out of your session.</p>
                                </div>
                                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300" onClick={onLogout}>
                                    <LogOut size={16} className="mr-2" /> {t('common.logOut')}
                                </Button>
                            </div>
                        </div>

                    </div>
                 </div>
             )}

         </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-2">
                <button 
                    onClick={() => setActiveView('links')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeView === 'links' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    <LayoutGrid size={20} strokeWidth={activeView === 'links' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{t('dashboard.myLinks')}</span>
                </button>
                <button 
                    onClick={() => setActiveView('contacts')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeView === 'contacts' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    <div className="relative">
                        <Users size={20} strokeWidth={activeView === 'contacts' ? 2.5 : 2} />
                        {allContacts.length > 0 && (
                            <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white">
                                {allContacts.length}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">{t('dashboard.contacts')}</span>
                </button>
                <button 
                    onClick={() => setActiveView('analytics')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeView === 'analytics' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    <PieChart size={20} strokeWidth={activeView === 'analytics' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{t('dashboard.analytics')}</span>
                </button>
                <button 
                    onClick={() => setActiveView('settings')}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeView === 'settings' ? 'text-slate-900' : 'text-slate-400'}`}
                >
                    <Settings size={20} strokeWidth={activeView === 'settings' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{t('dashboard.settings')}</span>
                </button>
            </div>
        </nav>

      </main>

      {/* Share Modal for Dashboard */}
      {sharingSite && (
        <ShareModal 
            isOpen={!!sharingSite} 
            onClose={() => setSharingSite(null)} 
            data={sharingSite} 
            onUpdate={onUpdate} 
        />
      )}
    </div>
  );
};
