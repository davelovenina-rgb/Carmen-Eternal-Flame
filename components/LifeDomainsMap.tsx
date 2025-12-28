
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Briefcase, Heart, Zap, Coffee, BookOpen, User, DollarSign } from 'lucide-react';
import { ViewState } from '../types';

interface LifeDomainsMapProps {
    onNavigate: (view: ViewState) => void;
}

const DOMAINS = [
    { id: 'health', label: 'Health', value: 75, icon: Activity, color: '#10B981', view: ViewState.Health },
    { id: 'spirit', label: 'Spirit', value: 60, icon: Heart, color: '#EF4444', view: ViewState.CouncilHall }, // Directs to Carmen via Hall for now
    { id: 'career', label: 'Career', value: 85, icon: Briefcase, color: '#0EA5E9', view: ViewState.Projects },
    { id: 'finance', label: 'Finances', value: 50, icon: DollarSign, color: '#EAB308', view: ViewState.Projects },
    { id: 'growth', label: 'Growth', value: 40, icon: BookOpen, color: '#8B5CF6', view: ViewState.Projects },
    { id: 'relationships', label: 'Relations', value: 70, icon: User, color: '#EC4899', view: ViewState.Projects },
    { id: 'creativity', label: 'Creativity', value: 65, icon: Zap, color: '#D8B4FE', view: ViewState.Projects },
    { id: 'rest', label: 'Rest', value: 30, icon: Coffee, color: '#64748B', view: ViewState.Health },
];

export const LifeDomainsMap: React.FC<LifeDomainsMapProps> = ({ onNavigate }) => {
    
    // Calculate Polygon Points
    const numPoints = DOMAINS.length;
    const radius = 120;
    const center = 150;
    
    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
        const r = (value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    const polyPoints = DOMAINS.map((d, i) => getPoint(i, d.value)).join(" ");
    const bgPoints = DOMAINS.map((d, i) => getPoint(i, 100)).join(" ");
    const midPoints = DOMAINS.map((d, i) => getPoint(i, 50)).join(" ");

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            
            {/* Background Grid Ambience */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                     backgroundSize: '40px 40px'
                 }} 
            />

            <div className="relative z-10 max-w-lg w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Life Domains</h2>
                    <p className="text-zinc-500 text-sm">Mind, Body, & Soul Balance</p>
                </div>

                <div className="relative aspect-square w-full max-w-[360px] mx-auto">
                    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
                        {/* Background Webs */}
                        <polygon points={bgPoints} fill="none" stroke="#333" strokeWidth="1" />
                        <polygon points={midPoints} fill="none" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
                        
                        {/* Connectors to center */}
                        {DOMAINS.map((d, i) => {
                            const end = getPoint(i, 100);
                            return <line key={`line-${i}`} x1={center} y1={center} x2={end.split(',')[0]} y2={end.split(',')[1]} stroke="#222" strokeWidth="1" />;
                        })}

                        {/* The Data Shape */}
                        <motion.polygon 
                            points={polyPoints} 
                            fill="rgba(16, 185, 129, 0.2)" 
                            stroke="#10B981" 
                            strokeWidth="2"
                            initial={{ scale: 0, opacity: 0, transformOrigin: 'center' }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, type: 'spring' }}
                        />
                        
                        {/* Domain Icons/Points */}
                        {DOMAINS.map((d, i) => {
                            const pos = getPoint(i, 115); // Push out slightly for icon
                            const [x, y] = pos.split(',').map(Number);
                            
                            return (
                                <g key={d.id} onClick={() => onNavigate(d.view)} className="cursor-pointer group">
                                    <foreignObject x={x - 16} y={y - 16} width="32" height="32">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800 bg-zinc-900 group-hover:bg-zinc-800 transition-colors shadow-lg`} style={{ borderColor: d.color }}>
                                            <d.icon size={14} color={d.color} />
                                        </div>
                                    </foreignObject>
                                    {/* Label Tooltip (Always visible in this design) */}
                                    <foreignObject x={x - 40} y={y + 18} width="80" height="20">
                                        <div className="text-[10px] text-center text-zinc-500 font-medium bg-black/50 rounded px-1">{d.label} {d.value}%</div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Central Pulsing Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[2px] animate-pulse pointer-events-none" />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg">
                <button 
                    onClick={() => onNavigate(ViewState.Health)}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3 hover:bg-zinc-900 transition-colors"
                >
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Activity size={20} /></div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-white">Body</div>
                        <div className="text-xs text-zinc-500">View Health Data</div>
                    </div>
                </button>
                 <button 
                    onClick={() => onNavigate(ViewState.CouncilHall)} // Directs to Carmen basically
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3 hover:bg-zinc-900 transition-colors"
                >
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Heart size={20} /></div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-white">Soul</div>
                        <div className="text-xs text-zinc-500">Visit Carmen</div>
                    </div>
                </button>
            </div>

        </div>
    );
};
