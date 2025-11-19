
import React, { useState, useEffect } from 'react';
import { Layout as LayoutIcon, Share2, Smartphone, Monitor, ArrowLeft, Check, LogOut } from 'lucide-react';
import { CardData, Tab, ViewMode } from './types';
import { INITIAL_DATA } from './constants';
import { Button } from './components/ui/Button';
import { EditorPanel } from './components/EditorPanel';
import { CardPreview } from './components/CardPreview';
import { WebPreview } from './components/WebPreview';
import { Dashboard } from './components/Dashboard';
import { ShareModal } from './components/ShareModal';
import { useAuth } from './contexts/AuthContext';
import { sitesService } from './lib/database';

interface AppProps {
    onLogout?: () => void;
}

const App: React.FC<AppProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [sites, setSites] = useState<CardData[]>([]);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Editor specific state (only relevant when viewMode === 'editor')
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    if (user) {
      loadSites();
    }
  }, [user]);

  const loadSites = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await sitesService.getAll(user.id);
      setSites(data);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSite = sites.find(s => s.id === currentSiteId) || INITIAL_DATA;

  const handleEditSite = (id: string) => {
    setCurrentSiteId(id);
    setViewMode('editor');
  };

  const handleCreateSite = async () => {
    if (!user) return;
    try {
      const newSite: CardData = {
        ...INITIAL_DATA,
        id: '',
        internalName: 'New Untitled Site',
        profile: { ...INITIAL_DATA.profile, name: user.user_metadata?.full_name || 'Your Name' }
      };
      const created = await sitesService.create(user.id, newSite);
      setSites([created, ...sites]);
      setCurrentSiteId(created.id);
      setViewMode('editor');
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Failed to create site. Please try again.');
    }
  };

  const handleUpdateSite = async (updatedData: CardData) => {
    if (!user) return;
    try {
      await sitesService.update(updatedData.id, updatedData);
      setSites(prevSites => prevSites.map(site => site.id === updatedData.id ? updatedData : site));
    } catch (error) {
      console.error('Error updating site:', error);
      alert('Failed to update site. Please try again.');
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this site? This action cannot be undone.')) {
      return;
    }
    try {
      await sitesService.delete(id);
      setSites(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('Failed to delete site. Please try again.');
    }
  };

  const handleDuplicateSite = async (id: string) => {
    if (!user) return;
    const site = sites.find(s => s.id === id);
    if (!site) return;

    try {
      const duplicatedSite = {
        ...site,
        id: '',
        internalName: `${site.internalName} (Copy)`,
        profile: { ...site.profile, name: `${site.profile.name} (Copy)` }
      };
      const created = await sitesService.create(user.id, duplicatedSite);
      setSites([created, ...sites]);
    } catch (error) {
      console.error('Error duplicating site:', error);
      alert('Failed to duplicate site. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
      setViewMode('dashboard');
      setCurrentSiteId(null);
  };

  const toggleTab = (tab: Tab) => setActiveTab(tab);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your sites...</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'dashboard') {
      return (
          <div className="min-h-screen font-sans text-slate-900 relative">
              <Dashboard
                  sites={sites}
                  onEdit={handleEditSite}
                  onCreate={handleCreateSite}
                  onDelete={handleDeleteSite}
                  onDuplicate={handleDuplicateSite}
                  onUpdate={handleUpdateSite}
                  onLogout={onLogout}
              />
          </div>
      );
  }

  // Render Editor View
  return (
    <div className="min-h-screen flex flex-col h-screen bg-slate-50 font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToDashboard}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Back to Dashboard"
          >
              <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <LayoutIcon size={18} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">{currentSite.internalName}</span>
                <span className="text-[10px] text-slate-400 leading-tight">Editing</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Mobile Tabs Toggle */}
            <div className="flex md:hidden bg-slate-100 p-1 rounded-lg mr-2">
                <button 
                    onClick={() => toggleTab('editor')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    Edit
                </button>
                <button 
                    onClick={() => toggleTab('preview')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                    Preview
                </button>
            </div>
            
            <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Check size={12} className="text-green-500" /> Saved
                </span>
            </div>

            <Button 
                size="sm" 
                icon={<Share2 size={16} />}
                onClick={() => setIsShareModalOpen(true)}
                className="shadow-lg shadow-slate-200/50"
            >
                Share
            </Button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel - Editor */}
        <div className={`
            flex-1 max-w-2xl border-r border-slate-200 bg-white z-10
            absolute inset-0 md:static md:block transition-transform duration-300
            ${activeTab === 'editor' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="h-full p-4 md:p-6 lg:p-8 bg-slate-50/50">
                <EditorPanel data={currentSite} onChange={handleUpdateSite} />
            </div>
        </div>

        {/* Right Panel - Preview */}
        <div className={`
            flex-1 bg-slate-100 relative flex flex-col items-center p-4
            absolute inset-0 md:static md:flex transition-transform duration-300
            ${activeTab === 'preview' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
             {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col gap-4">
                
                {/* Preview Header Controls */}
                <div className="flex justify-center shrink-0">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1">
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Mobile View"
                        >
                            <Smartphone size={20} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Desktop View"
                        >
                            <Monitor size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex items-center justify-center overflow-hidden pb-4">
                    {previewMode === 'mobile' ? (
                        <CardPreview data={currentSite} className="shadow-2xl shadow-slate-400/20" />
                    ) : (
                        <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-fade-in">
                             {/* Browser Toolbar Simulation */}
                             <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                </div>
                                <div className="flex-1 max-w-lg mx-auto bg-white border border-slate-200 h-6 rounded-md flex items-center justify-center">
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <LayoutIcon size={10} /> weshare.site/u/{currentSite.profile.name.replace(/\s+/g, '').toLowerCase()}
                                    </span>
                                </div>
                             </div>
                             {/* Web Preview Content */}
                             <div className="flex-1 overflow-hidden relative bg-white">
                                <WebPreview data={currentSite} />
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        data={currentSite} 
        onUpdate={handleUpdateSite} 
      />
    </div>
  );
};

export default App;
