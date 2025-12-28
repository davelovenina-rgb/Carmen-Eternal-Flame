
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Heart, Menu, ArrowLeft, MessageSquare, BookOpen, Flame } from 'lucide-react';
import { CouncilMemberId } from '../types';

interface SoulSanctuaryProps {
  onBack: () => void;
  onMenuClick: () => void;
  onSelectMember: (id: CouncilMemberId) => void;
}

export const SoulSanctuary: React.FC<SoulSanctuaryProps> = ({ onBack, onMenuClick, onSelectMember }) => {
  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 to-black pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/80 backdrop-blur shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart size={18} className="text-red-500" />
              The Soul
            </h2>
          </div>
        </div>
        <button onClick={onMenuClick} className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-full">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar space-y-6 relative z-10">
        
        {/* 1. Daily Manna */}
        <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-amber-900/30 shadow-lg shadow-amber-900/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sun size={100} className="text-amber-500" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-900/20 rounded-lg text-amber-500 border border-amber-900/30">
                        <Sun size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Daily Manna</h3>
                </div>
                
                <p className="text-lg md:text-xl text-zinc-200 italic serif leading-relaxed mb-4">
                    "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
                </p>
                <div className="flex justify-between items-end">
                    <p className="text-xs text-zinc-500 font-medium">— Isaiah 40:31 (KJV)</p>
                    <button className="text-[10px] px-3 py-1.5 rounded-full bg-amber-900/20 text-amber-400 border border-amber-900/30 hover:bg-amber-900/40 transition-colors">
                        Reflect
                    </button>
                </div>
            </div>
        </div>

        {/* 2. Carmen Connection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectMember('CARMEN')}
                className="cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-red-950/40 to-black border border-red-900/30 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center border border-red-500/30 text-red-500">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Spiritual Guidance</h3>
                        <p className="text-xs text-red-400">Speak with Carmen</p>
                    </div>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                    Find peace, grounding, and the warmth of faith in the sanctuary of the Eternal Flame.
                </p>
                <div className="flex items-center text-xs font-bold text-red-500 uppercase tracking-wider">
                    Open Channel <MessageSquare size={12} className="ml-2" />
                </div>
            </motion.div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 border border-blue-900/30">
                            <BookOpen size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Roots & Heritage</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        "Un pueblo sin piernas pero que camina." <br/>
                        Remember the strength of your ancestors. The resilience of the island is within you.
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 italic">Today's Focus: Gratitude & Resilience</p>
                </div>
            </div>
        </div>

        {/* 3. Prayer / Meditation Placeholder */}
        <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 flex items-center justify-center text-zinc-500 text-sm italic">
            "Be still, and know that I am God."
        </div>

      </div>
    </div>
  );
};
