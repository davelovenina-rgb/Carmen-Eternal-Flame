
import React, { useState } from 'react';
import { Reminder } from '../types';

interface ReminderModalProps {
  onClose: () => void;
  onAdd: (reminder: Omit<Reminder, 'id'>) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [repeat, setRepeat] = useState<'once' | 'daily' | 'weekly'>('once');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const timestamp = new Date(`${date}T${time}`).getTime();
    onAdd({ title, timestamp, repeat });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#0a0a0c] border border-white/5 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>
        
        <header className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600 mb-4">Scheduling Frequency</p>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Set Gentle Reminder</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-4">Message (Title)</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              placeholder="E.g. Medication, Water, Health Check..."
              className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 text-white font-bold placeholder:text-neutral-900 focus:border-amber-500/30 focus:ring-0 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-4">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 text-white font-bold focus:border-amber-500/30 focus:ring-0 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-4">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 text-white font-bold focus:border-amber-500/30 focus:ring-0 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-4">Repetition Protocol</label>
            <div className="grid grid-cols-3 gap-2">
              {['once', 'daily', 'weekly'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRepeat(r as any)}
                  className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${repeat === r ? 'bg-amber-600 text-white border-amber-500' : 'bg-transparent border-white/5 text-neutral-700 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-6 bg-white/[0.02] border border-white/5 text-neutral-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/5 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!title || !date || !time}
              className="flex-1 py-6 bg-amber-600 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-amber-500 transition-all disabled:opacity-10"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
