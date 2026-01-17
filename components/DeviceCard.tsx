import React from 'react';
import { Device, DeviceType } from '../types';
import { Trash2, Volume2, MessageSquare, Cast, Radio, Settings2 } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onUpdate: (updatedDevice: Device) => void;
  onDelete: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onUpdate, onDelete }) => {
  
  const getIcon = (type: DeviceType) => {
    switch (type) {
      case 'alexa': return <Radio className="w-5 h-5 text-blue-400" />;
      case 'google': return <Cast className="w-5 h-5 text-orange-400" />;
      case 'telegram': return <MessageSquare className="w-5 h-5 text-sky-400" />;
      case 'sonos': return <Volume2 className="w-5 h-5 text-yellow-400" />;
      default: return <Volume2 className="w-5 h-5" />;
    }
  };

  const handleVolumeChange = (period: 'morning' | 'afternoon' | 'night', val: string) => {
    onUpdate({
      ...device,
      volumes: {
        ...device.volumes,
        [period]: parseInt(val, 10)
      }
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col gap-4 shadow-lg group hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start gap-3">
        {/* Type Selector Icon */}
        <div className="relative shrink-0">
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
            {getIcon(device.type)}
          </div>
          <select 
            value={device.type}
            onChange={(e) => onUpdate({...device, type: e.target.value as DeviceType})}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Change Device Type"
          >
            <option value="alexa">Alexa</option>
            <option value="google">Google Home</option>
            <option value="telegram">Telegram</option>
            <option value="sonos">Sonos</option>
          </select>
        </div>

        {/* Editable Name and Entity ID */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <input 
            type="text" 
            value={device.name}
            onChange={(e) => onUpdate({...device, name: e.target.value})}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:bg-slate-900/50 rounded px-1 -ml-1 border border-transparent focus:border-slate-600 placeholder-slate-500"
            placeholder="Device Name"
          />
          <input 
            type="text" 
            value={device.entityId}
            onChange={(e) => onUpdate({...device, entityId: e.target.value})}
            className="bg-transparent text-xs text-slate-400 font-mono focus:outline-none focus:bg-slate-900/50 rounded px-1 -ml-1 border border-transparent focus:border-slate-600 placeholder-slate-600"
            placeholder="entity_id"
          />
        </div>

        <button 
          onClick={() => onDelete(device.id)}
          className="text-slate-600 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Telegram Chat ID Input */}
      {device.type === 'telegram' && (
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
          <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Telegram Chat ID (Optional)
          </label>
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-slate-600" />
            <input 
              type="text" 
              value={device.chatId || ''}
              onChange={(e) => onUpdate({...device, chatId: e.target.value})}
              className="bg-transparent text-xs text-white w-full focus:outline-none placeholder-slate-600"
              placeholder="-100123456789"
            />
          </div>
        </div>
      )}

      {/* Volume Sliders (Hidden for Telegram) */}
      {device.type !== 'telegram' ? (
        <div className="grid grid-cols-3 gap-2 mt-1">
          {(['morning', 'afternoon', 'night'] as const).map((period) => (
            <div key={period} className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {period}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={device.volumes[period]}
                  onChange={(e) => handleVolumeChange(period, e.target.value)}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <span className="text-[10px] font-mono text-right text-slate-400">
                {device.volumes[period]}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2 text-center text-[10px] text-slate-500 italic">
          Volume settings managed by user device
        </div>
      )}
    </div>
  );
};

export default DeviceCard;