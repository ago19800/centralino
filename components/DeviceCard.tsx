
import React from 'react';
import { Device, DeviceType } from '../types';
import { Trash2, MessageSquare, Cast, Radio, Volume2, Camera, Plus, X, Timer } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onUpdate: (updatedDevice: Device) => void;
  onDelete: (id: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onUpdate, onDelete }) => {
  const getIcon = (type: DeviceType) => {
    switch (type) {
      case 'alexa': return <Radio className="text-blue-400" size={20} />;
      case 'google': return <Cast className="text-orange-400" size={20} />;
      case 'telegram': return <MessageSquare className="text-sky-400" size={20} />;
      default: return <Volume2 className="text-slate-400" size={20} />;
    }
  };

  const handleCameraChange = (index: number, val: string) => {
    const cams = [...(device.cameraEntities || [])];
    cams[index] = val;
    onUpdate({ ...device, cameraEntities: cams });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">{getIcon(device.type)}</div>
        <div className="flex-1">
          <input type="text" value={device.name} onChange={e => onUpdate({...device, name: e.target.value})} className="bg-transparent text-sm font-bold text-white focus:outline-none w-full" />
          <input type="text" value={device.entityId} onChange={e => onUpdate({...device, entityId: e.target.value})} className="bg-transparent text-[10px] text-slate-500 font-mono w-full" />
        </div>
        <button onClick={() => onDelete(device.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={16} /></button>
      </div>

      {device.type === 'telegram' && (
        <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
          <span className="text-[9px] font-black text-slate-500 uppercase">Chat ID</span>
          <input type="text" value={device.chatId || ''} onChange={e => onUpdate({...device, chatId: e.target.value})} className="bg-transparent text-xs text-white w-full focus:outline-none mt-1" />
        </div>
      )}

      {device.type !== 'telegram' && (
        <div className="grid grid-cols-3 gap-2">
          {['morning', 'afternoon', 'night'].map(p => (
            <div key={p} className="bg-slate-800/50 p-2 rounded-lg text-center">
              <span className="text-[8px] text-slate-500 uppercase">{p}</span>
              <input type="number" value={device.volumes[p as keyof typeof device.volumes]} onChange={e => onUpdate({...device, volumes: {...device.volumes, [p]: parseInt(e.target.value)}})} className="bg-transparent text-xs text-white w-full text-center focus:outline-none" />
            </div>
          ))}
        </div>
      )}

      {/* Camera Section - IMPORTANTE: Deve esserci sempre per tutti gli speaker */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Camera size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Telecamere Snapshot</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg">
             <Timer size={10} className="text-slate-500" />
             <input type="number" value={device.snapDelay || 0} onChange={e => onUpdate({...device, snapDelay: parseInt(e.target.value)})} className="bg-transparent text-[10px] text-white w-6 text-center focus:outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          {(device.cameraEntities || []).map((cam, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={cam} onChange={e => handleCameraChange(idx, e.target.value)} className="flex-1 bg-slate-800 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500" placeholder="camera.entity_id" />
              <button onClick={() => onUpdate({...device, cameraEntities: device.cameraEntities?.filter((_, i) => i !== idx)})} className="text-slate-600 hover:text-red-400"><X size={14} /></button>
            </div>
          ))}
          <button onClick={() => onUpdate({...device, cameraEntities: [...(device.cameraEntities || []), '']})} className="w-full py-2 border border-dashed border-slate-800 rounded-lg text-[10px] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 flex items-center justify-center gap-2 transition-all">
            <Plus size={12} /> AGGIUNGI CAMERA
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
