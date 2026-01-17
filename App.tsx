import React, { useState } from 'react';
import { GlobalConfig, Device, DeviceType } from './types';
import DeviceCard from './components/DeviceCard';
import TimeConfig from './components/TimeConfig';
import { generateHAYaml } from './services/geminiService';
import { Settings, Plus, Code, Download, Cpu, Loader2, Copy, Check, Package, RotateCcw, Heart } from 'lucide-react';

const INITIAL_CONFIG: GlobalConfig = {
  devices: [
    {
      id: '1',
      name: 'Living Room Echo',
      entityId: 'media_player.living_room_alexa',
      type: 'alexa',
      volumes: { morning: 30, afternoon: 50, night: 15 },
      enabled: true
    },
    {
      id: '2',
      name: 'Kitchen Nest',
      entityId: 'media_player.kitchen_nest',
      type: 'google',
      volumes: { morning: 40, afternoon: 60, night: 20 },
      enabled: true
    },
    {
      id: '3',
      name: 'Family Group',
      entityId: 'notify.telegram',
      chatId: '-123456789',
      type: 'telegram',
      volumes: { morning: 0, afternoon: 0, night: 0 },
      enabled: true
    }
  ],
  dnd: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  },
  shutdownTime: '01:00', // Default shutdown time
  restoreMusic: true, // Default enable music restore
  timeDefinitions: {
    morningStart: '06:00',
    afternoonStart: '12:00',
    nightStart: '20:00'
  }
};

export default function App() {
  const [config, setConfig] = useState<GlobalConfig>(INITIAL_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');
  const [isCopied, setIsCopied] = useState(false);

  // Device Management
  const addDevice = () => {
    const newDevice: Device = {
      id: Date.now().toString(),
      name: 'New Speaker',
      entityId: 'media_player.new_device',
      type: 'google',
      volumes: { morning: 40, afternoon: 50, night: 20 },
      enabled: true
    };
    setConfig(prev => ({ ...prev, devices: [...prev.devices, newDevice] }));
  };

  const updateDevice = (updated: Device) => {
    setConfig(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === updated.id ? updated : d)
    }));
  };

  const deleteDevice = (id: string) => {
    setConfig(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setActiveTab('code');
    try {
      const code = await generateHAYaml(config);
      setGeneratedCode(code);
    } catch (e) {
      console.error(e);
      setGeneratedCode("# Error generating code. Please check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Centralino HA</h1>
              <p className="text-xs text-slate-400 font-medium">Component Generator</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Configurazione
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Codice Generato
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex-grow w-full">
        
        {activeTab === 'config' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Time & DND Section */}
            <section>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4 flex items-center gap-2">
                <Settings size={16} /> Impostazioni Globali
              </h2>
              <TimeConfig config={config} setConfig={setConfig} />
            </section>

            {/* Devices Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Dispositivi Connessi</h2>
                <button 
                  onClick={addDevice}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                >
                  <Plus size={16} /> Aggiungi Dispositivo
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.devices.map(device => (
                  <DeviceCard 
                    key={device.id} 
                    device={device} 
                    onUpdate={updateDevice}
                    onDelete={deleteDevice}
                  />
                ))}
              </div>
            </section>

            {/* Action Bar */}
            <div className="flex justify-end pt-8 border-t border-slate-800">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-indigo-900/30 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Package />}
                Genera Componente HACS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="h-[calc(100vh-200px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 border border-slate-700 rounded-t-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300">
                <Download size={18} />
                <span className="font-mono text-sm">custom_components/centralino/</span>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                  title="Regenerate Code"
                >
                   {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <RotateCcw size={16}/>}
                   <span>Rigenera Codice</span>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors border border-slate-700"
                >
                  {isCopied ? <Check size={16} className="text-green-400"/> : <Copy size={16} />}
                  {isCopied ? 'Copiato!' : 'Copia'}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 border-x border-b border-slate-700 rounded-b-xl overflow-hidden relative group">
              {generatedCode ? (
                <pre className="w-full h-full p-6 overflow-auto font-mono text-sm text-blue-100 leading-relaxed selection:bg-indigo-500/30 whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                  <Package size={48} className="opacity-20" />
                  <p>Clicca "Genera" per creare i file del tuo componente.</p>
                  <button 
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    Genera Ora
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer with Attribution */}
      <footer className="w-full text-center py-6 text-slate-500 text-xs border-t border-slate-900">
        <p className="flex items-center justify-center gap-1">
          Developed with <Heart size={12} className="text-red-500 fill-red-500/20" /> by <span className="text-indigo-400 font-semibold">@ago1980</span>
        </p>
      </footer>
    </div>
  );
}