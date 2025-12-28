
import React, { useState } from 'react';
import { HealthReading, Medication, Trip, Reminder, Task } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface DashboardProps {
  readings: HealthReading[];
  medications: Medication[];
  trips: Trip[];
  reminders: Reminder[];
  tasks: Task[];
  onLogReading: (r: HealthReading) => void;
  onToggleMed: (id: string) => void;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  readings, medications, trips, reminders, tasks, onLogReading, onToggleMed, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'meds' | 'schedule'>('matrix');

  const getTrendData = (type: string) => {
    const raw = readings
      .filter(r => r.type === type)
      .slice(0, 7)
      .reverse();
    
    if (raw.length < 2) return raw.map(r => ({ time: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), value: r.value, projection: null }));

    const xValues = raw.map((_, i) => i);
    const yValues = raw.map(r => r.value);
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return raw.map((r, i) => ({
      time: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: r.value,
      projection: slope * i + intercept
    }));
  };

  const scheduleEvents = [
    ...reminders.map(r => ({ id: r.id, type: 'reminder', title: r.title, time: r.timestamp })),
    ...tasks.filter(t => !t.completed).map(t => ({ id: t.id, type: 'task', title: t.title, time: t.timestamp }))
  ].sort((a, b) => a.time - b.time);

  const tabItemClass = (t: string) => `px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-amber-600 text-black shadow-lg shadow-amber-600/20' : 'text-neutral-600 hover:text-white'}`;

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden font-sans">
      <header className="px-8 py-8 flex justify-between items-center border-b border-neutral-900 bg-black z-20 sticky top-0">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
           </button>
           <div className="flex flex-col">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Health Command</h2>
              <p className="text-[9px] font-bold uppercase text-amber-600 tracking-[0.4em]">Operational Matrix</p>
           </div>
        </div>
        <div className="flex gap-1 bg-neutral-950 p-1 rounded-full border border-neutral-900">
          {['matrix', 'meds', 'schedule'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={tabItemClass(t)}>{t}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32 max-w-5xl mx-auto w-full">
        {activeTab === 'matrix' && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { type: 'glucose', label: 'Metabolic Signal', unit: 'mg/dL', color: '#D97706' },
                { type: 'weight', label: 'Gravity Anchor', unit: 'LBS', color: '#FFFFFF' }
              ].map(matrix => {
                const data = getTrendData(matrix.type);
                const current = readings.filter(r => r.type === matrix.type)[0]?.value || '--';
                return (
                  <div key={matrix.type} className="card-refined p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{matrix.label}</p>
                      <p className="text-3xl font-black text-white">{current}<span className="text-[10px] ml-1 opacity-20 font-bold">{matrix.unit}</span></p>
                    </div>
                    <div className="h-40 w-full bg-neutral-950/50 rounded-xl">
                      {data.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                            <defs>
                              <linearGradient id={`grad-${matrix.type}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={matrix.color} stopOpacity={0.1}/>
                                <stop offset="95%" stopColor={matrix.color} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="value" stroke={matrix.color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${matrix.type})`} />
                            <Line type="monotone" dataKey="projection" stroke={matrix.color} strokeWidth={1} strokeDasharray="5 5" dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : <div className="h-full flex items-center justify-center text-[10px] text-neutral-800 uppercase font-black tracking-widest italic">Signal Loading...</div>}
                    </div>
                    <button onClick={() => onLogReading({ id: Date.now().toString(), type: matrix.type as any, value: 120, timestamp: Date.now() })} className="w-full py-4 border border-neutral-900 text-[9px] font-black uppercase text-neutral-600 hover:text-white hover:bg-white/[0.02] transition-all tracking-widest">+ Update Node</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'meds' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             {medications.map(med => (
               <div key={med.id} className="card-refined p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl grayscale opacity-50">💊</div>
                     <div className="space-y-1">
                        <p className="text-base font-black text-white uppercase tracking-tight">{med.name}</p>
                        <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">{med.dosage} • {med.frequency}</p>
                     </div>
                  </div>
                  <button onClick={() => onToggleMed(med.id)} className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all active:scale-95">Log Dose</button>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-10 animate-in slide-in-from-bottom duration-500">
             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-neutral-700 tracking-[0.5em] px-2">Next 48 Hours</p>
                <div className="space-y-2">
                   {scheduleEvents.length === 0 ? (
                     <div className="py-20 text-center card-refined border-dashed">
                        <p className="text-[10px] font-black text-neutral-800 uppercase tracking-widest">Archive Quiet. No pending protocols.</p>
                     </div>
                   ) : (
                     scheduleEvents.map(event => (
                       <div key={event.id} className="card-refined p-6 flex items-center justify-between group">
                          <div className="flex items-center gap-6">
                             <div className={`w-2 h-2 rounded-full ${event.type === 'reminder' ? 'bg-amber-600 animate-status' : 'bg-blue-600'}`}></div>
                             <div className="space-y-0.5">
                                <p className="text-sm font-black text-white uppercase tracking-tight">{event.title}</p>
                                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                                   {new Date(event.time).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                          </div>
                          <span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Temporal Lock</span>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
