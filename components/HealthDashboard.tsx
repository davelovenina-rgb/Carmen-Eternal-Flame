
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Upload, FileText, TrendingUp, AlertTriangle, Droplet, Menu, ArrowLeft } from 'lucide-react';
import { GlucoseReading } from '../types';

interface HealthDashboardProps {
    onBack: () => void;
    onMenuClick: () => void;
}

const MOCK_READINGS: GlucoseReading[] = [
    { id: '1', value: 112, timestamp: Date.now() - 1000 * 60 * 60 * 4, context: 'fasting' },
    { id: '2', value: 145, timestamp: Date.now() - 1000 * 60 * 60 * 24, context: 'post-meal' },
    { id: '3', value: 98, timestamp: Date.now() - 1000 * 60 * 60 * 48, context: 'fasting' },
    { id: '4', value: 130, timestamp: Date.now() - 1000 * 60 * 60 * 72, context: 'random' },
    { id: '5', value: 105, timestamp: Date.now() - 1000 * 60 * 60 * 96, context: 'fasting' },
];

export const HealthDashboard: React.FC<HealthDashboardProps> = ({ onBack, onMenuClick }) => {
    const [readings, setReadings] = useState<GlucoseReading[]>(MOCK_READINGS);
    const [showLogModal, setShowLogModal] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [newContext, setNewContext] = useState<GlucoseReading['context']>('random');

    const handleAddReading = () => {
        if (!newValue) return;
        const reading: GlucoseReading = {
            id: Date.now().toString(),
            value: parseInt(newValue),
            timestamp: Date.now(),
            context: newContext
        };
        setReadings(prev => [reading, ...prev]);
        setShowLogModal(false);
        setNewValue('');
    };

    const latest = readings[0];
    const isHigh = latest.value > 140;
    const isLow = latest.value < 70;
    const statusColor = isHigh ? 'text-amber-500' : isLow ? 'text-red-500' : 'text-emerald-500';

    return (
        <div className="w-full h-full bg-black flex flex-col relative overflow-hidden font-sans">
             {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity size={18} className="text-emerald-500" />
                            Health Command
                        </h2>
                    </div>
                </div>
                <button onClick={onMenuClick} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full">
                    <Menu size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar space-y-6">
                
                {/* 1. Main Status Card */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <div className="text-zinc-500 text-sm uppercase tracking-widest font-medium mb-2">Latest Glucose</div>
                        <div className={`text-6xl font-bold tracking-tighter mb-1 ${statusColor}`}>
                            {latest.value}
                        </div>
                        <div className="text-zinc-400 text-sm font-medium mb-6">
                            mg/dL • <span className="capitalize">{latest.context}</span> • {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div className="flex gap-3 w-full max-w-sm">
                            <button 
                                onClick={() => setShowLogModal(true)}
                                className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Log
                            </button>
                            <button 
                                className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-700"
                            >
                                <Upload size={18} /> Glooko
                            </button>
                        </div>
                    </div>
                    
                    {/* Background Pulse */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 ${isHigh ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>

                {/* 2. Visual Trend Graph (Custom SVG) */}
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-sm font-bold text-zinc-300">Glucose Trend (Last 5 Readings)</h3>
                        <TrendingUp size={16} className="text-zinc-500" />
                    </div>
                    <div className="h-40 w-full flex items-end justify-between px-4 gap-2 relative">
                         {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
                            <div className="w-full h-px bg-zinc-500 border-t border-dashed" />
                            <div className="w-full h-px bg-zinc-500 border-t border-dashed" />
                            <div className="w-full h-px bg-zinc-500 border-t border-dashed" />
                        </div>
                        
                        {/* Bars */}
                        {[...readings].reverse().slice(-7).map((r, i) => {
                            const height = Math.min((r.value / 250) * 100, 100);
                            const color = r.value > 140 ? 'bg-amber-500' : r.value < 70 ? 'bg-red-500' : 'bg-emerald-500';
                            return (
                                <div key={r.id} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="relative w-full rounded-t-lg bg-zinc-800 h-full overflow-hidden">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={`absolute bottom-0 left-0 right-0 ${color} opacity-80 group-hover:opacity-100 transition-opacity rounded-t-sm mx-1`}
                                        />
                                    </div>
                                    <span className="text-[10px] text-zinc-500">{new Date(r.timestamp).getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Ennea's Insight */}
                <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-900/30 flex gap-4 items-start">
                    <div className="p-2 bg-emerald-900/30 rounded-lg shrink-0">
                        <Activity size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-emerald-400 mb-1">Guardian Insight</h4>
                        <p className="text-xs text-emerald-200/70 leading-relaxed">
                            Your fasting levels are stabilizing. The recent spike post-meal suggests checking carb intake for lunch. Keep hydrated, Brother.
                        </p>
                    </div>
                </div>

                {/* 4. Recent History List */}
                <div>
                     <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">History</h3>
                     <div className="space-y-2">
                         {readings.map(r => (
                             <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${r.value > 140 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                     <div>
                                         <div className="text-sm font-bold text-white">{r.value} mg/dL</div>
                                         <div className="text-xs text-zinc-500 capitalize">{r.context}</div>
                                     </div>
                                 </div>
                                 <div className="text-xs text-zinc-600">
                                     {new Date(r.timestamp).toLocaleDateString()}
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>

            </div>

             {/* Log Modal */}
             {showLogModal && (
                <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Log Glucose</h3>
                        
                        <div className="mb-4">
                            <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Level (mg/dL)</label>
                            <input 
                                type="number" 
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-2xl font-bold text-white focus:border-emerald-500 outline-none"
                                placeholder="000"
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                             <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Context</label>
                             <div className="grid grid-cols-2 gap-2">
                                 {['fasting', 'post-meal', 'bedtime', 'random'].map((ctx) => (
                                     <button
                                        key={ctx}
                                        onClick={() => setNewContext(ctx as any)}
                                        className={`p-2 rounded-lg text-xs font-medium border ${newContext === ctx ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                     >
                                         {ctx}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowLogModal(false)} className="flex-1 py-3 bg-zinc-800 text-white font-medium rounded-xl">Cancel</button>
                            <button onClick={handleAddReading} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl">Save Entry</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
