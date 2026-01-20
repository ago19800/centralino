import React, { useState, useMemo, useEffect } from 'react';
import { GlobalConfig, Device } from './types';
import DeviceCard from './components/DeviceCard';
import TimeConfig from './components/TimeConfig';
import { generateHAYaml } from './services/geminiService';
import { Settings, Plus, Cpu, Loader2, Copy, AlertTriangle, FileCode, RefreshCcw, CheckCircle2, RotateCcw } from 'lucide-react';

// Cambio chiave per forzare il browser a resettare i dati vecchi
const STORAGE_KEY = 'centralino_v6_ultra_fix';

const INITIAL_CONFIG: GlobalConfig = {
  devices: [
    { id: '1', name: 'Echo Salotto', entityId: 'media_player.echo_salotto', type: 'alexa', volumes: { morning: 30, afternoon: 50, night: 15 }, enabled: true, cameraEntities: [], snapDelay: 2 },
    { id: '2', name: 'Google Cucina', entityId: 'media_player.google_cucina', type: 'google', volumes: { morning: 40, afternoon: 60, night: 20 }, enabled: true, cameraEntities: [], snapDelay: 2 },
    { id: '3', name: 'Telegram Bot', entityId: 'notify.telegram_bot', chatId: '-10012345678', type: 'telegram', cameraEntities: [], snapDelay: 2, volumes: { morning: 0, afternoon: 0, night: 0 }, enabled: true },
  ],
  dnd: { enabled: true, startTime: '22:00', endTime: '07:00' },
  shutdownTime: '01:00',
  restoreMusic: true,
  timeDefinitions: { morningStart: '06:00', afternoonStart: '12:00', nightStart: '20:00' }
};

const parseGeneratedFiles = (text: string) => {
  if (!text) return [];
  const files: { name: string; content: string }[] = [];
  const regex = /(?:^|\n)###\s*([^\n\r]+)/g;
  let match;
  const headers: { name: string, start: number, contentStart: number }[] = [];

  while ((match = regex.exec(text)) !== null) {
      headers.push({ name: match[1].trim(), start: match.index, contentStart: match.index + match[0].length });
  }

  if (headers.length === 0) return [{ name: 'centralino_config.yaml', content: text.trim() }];

  for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const nextHeader = headers[i+1];
      const end = nextHeader ? nextHeader.start : text.length;
      let content = text.slice(header.contentStart, end).trim();
      content = content.replace(/^```\w*\s*/, '').replace(/```$/, '');
      files.push({ name: header.name, content: content.trim() });
  }
  return files;
};

export default function App() {
  const [config, setConfig] = useState<GlobalConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.devices = parsed.devices.map((d: any) => ({
          ...d,
          cameraEntities: Array.isArray(d.cameraEntities) ? d.cameraEntities : [],
          snapDelay: typeof d.snapDelay === 'number' ? d.snapDelay : 2
        }));
        return parsed;
      }
      return INITIAL_CONFIG;
    } catch (e) {
      return INITIAL_CONFIG;
    }
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'code'>('config');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const resetAll = () => {
    if (confirm("Reset Totale?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const updateDevice = (updated: Device) => {
    setConfig(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === updated.id ? updated : d)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const code = await generateHAYaml(config);
      setGeneratedCode(code);
      setActiveTab('code');
    } catch (e: any) {
      setError(e.message || "Errore");
    } finally {
      setIsGenerating(false);
    }
  };

  const parsedFiles = useMemo(() => generatedCode ? parseGeneratedFiles(generatedCode) : [], [generatedCode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/90 border-b border-indigo-500/30 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">CENTRALINO HA</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-black rounded uppercase border border-green-500/20">v6.0 LIVE</span>
                <span className="text-[8px] text-indigo-400 font-bold tracking-widest uppercase">CAMERA SUPPORT ACTIVE</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={resetAll} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><RotateCcw size={18} /></button>
            <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
              <button onClick={() => setActiveTab('config')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Config</button>
              <button onClick={() => setActiveTab('code')} disabled={!generatedCode} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Codice</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'config' ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            <TimeConfig config={config} setConfig={setConfig} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.devices.map(device => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onUpdate={updateDevice}
                  onDelete={(id) => setConfig(prev => ({...prev, devices: prev.devices.filter(d => d.id !== id)}))}
                />
              ))}
              <button 
                onClick={() => setConfig(prev => ({...prev, devices: [...prev.devices, { id: Date.now().toString(), name: 'Nuovo Speaker', entityId: 'media_player.nuovo', type: 'google', volumes: { morning: 40, afternoon: 50, night: 20 }, enabled: true, cameraEntities: [], snapDelay: 2 }]}))} 
                className="border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all bg-slate-900/10"
              >
                <Plus size={32} />
                <span className="text-xs font-bold uppercase mt-2 tracking-widest">Aggiungi Speaker</span>
              </button>
            </div>

            <div className="flex justify-center pt-8">
              <button onClick={handleGenerate} disabled={isGenerating} className="px-16 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl transition-all disabled:opacity-50 active:scale-95">
                {isGenerating ? 'Compilazione...' : 'GENERA COMPONENTE'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {parsedFiles.map((file, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-slate-800/50 flex justify-between items-center border-b border-white/5">
                  <span className="font-mono text-sm font-bold text-slate-200">{file.name}</span>
                  <button onClick={() => { navigator.clipboard.writeText(file.content); alert('Copiato!'); }} className="p-2.5 bg-slate-700 hover:bg-indigo-600 text-white rounded-xl transition-all"><Copy size={16} /></button>
                </div>
                <div className="p-8">
                  <pre className="text-[12px] font-mono text-indigo-100/60 overflow-auto max-h-[600px] leading-relaxed">{file.content}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}