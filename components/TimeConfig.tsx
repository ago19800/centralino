import React from 'react';
import { GlobalConfig } from '../types';
import { Moon, Sun, Sunrise, Sunset, Power, Music } from 'lucide-react';

interface TimeConfigProps {
  config: GlobalConfig;
  setConfig: React.Dispatch<React.SetStateAction<GlobalConfig>>;
}

const TimeConfig: React.FC<TimeConfigProps> = ({ config, setConfig }) => {
  
  const handleTimeChange = (key: keyof GlobalConfig['timeDefinitions'], value: string) => {
    setConfig(prev => ({
      ...prev,
      timeDefinitions: { ...prev.timeDefinitions, [key]: value }
    }));
  };

  const handleDndChange = (key: keyof GlobalConfig['dnd'], value: any) => {
    setConfig(prev => ({
      ...prev,
      dnd: { ...prev.dnd, [key]: value }
    }));
  };

  const handleConfigChange = (key: keyof GlobalConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Phases of Day */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sun className="text-yellow-500" size={20}/> Day Phases
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              <Sunrise size={16} className="text-orange-300"/> <span>Morning Start</span>
            </div>
            <input 
              type="time" 
              value={config.timeDefinitions.morningStart}
              onChange={(e) => handleTimeChange('morningStart', e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              <Sun size={16} className="text-yellow-300"/> <span>Afternoon Start</span>
            </div>
            <input 
              type="time" 
              value={config.timeDefinitions.afternoonStart}
              onChange={(e) => handleTimeChange('afternoonStart', e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-300">
              <Sunset size={16} className="text-indigo-300"/> <span>Night Start</span>
            </div>
            <input 
              type="time" 
              value={config.timeDefinitions.nightStart}
              onChange={(e) => handleTimeChange('nightStart', e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Do Not Disturb */}
        <div className={`border rounded-xl p-6 transition-colors ${config.dnd.enabled ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800 border-slate-700'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Moon className="text-indigo-400" size={20}/> Do Not Disturb
            </h3>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="toggle" 
                id="dnd-toggle" 
                checked={config.dnd.enabled}
                onChange={(e) => handleDndChange('enabled', e.target.checked)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out transform checked:translate-x-6 checked:border-indigo-600"
              />
              <label htmlFor="dnd-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.dnd.enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}></label>
            </div>
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            Silence audio notifications. <br/><span className="text-indigo-400 font-medium">Urgent messages will bypass this.</span>
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">From</label>
              <input 
                type="time" 
                value={config.dnd.startTime}
                disabled={!config.dnd.enabled}
                onChange={(e) => handleDndChange('startTime', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">To</label>
              <input 
                type="time" 
                value={config.dnd.endTime}
                disabled={!config.dnd.enabled}
                onChange={(e) => handleDndChange('endTime', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Logic: Shutdown & Music Restore */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <Power className="text-red-400" size={20} />
               <div>
                 <span className="block text-sm font-semibold text-white">Speaker Shutdown</span>
                 <span className="text-xs text-slate-400">Turn off all devices at</span>
               </div>
             </div>
             <input 
                type="time" 
                value={config.shutdownTime}
                onChange={(e) => handleConfigChange('shutdownTime', e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

           <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <Music className="text-green-400" size={20} />
               <div>
                 <span className="block text-sm font-semibold text-white">Smart Resume</span>
                 <span className="text-xs text-slate-400">Restore music after notification</span>
               </div>
             </div>
             <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="music-restore"
                checked={config.restoreMusic}
                onChange={(e) => handleConfigChange('restoreMusic', e.target.checked)}
                className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out transform checked:translate-x-5 checked:border-green-500"
              />
              <label htmlFor="music-restore" className={`block overflow-hidden h-5 rounded-full cursor-pointer ${config.restoreMusic ? 'bg-green-500' : 'bg-slate-700'}`}></label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeConfig;