

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Activity, MessageSquare } from 'lucide-react';

interface LiveVoiceVisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1 (normalized roughly)
  onClose: () => void;
  status?: string;
  transcript?: { text: string; isUser: boolean; } | null;
}

export const LiveVoiceVisualizer: React.FC<LiveVoiceVisualizerProps> = ({ 
  isActive, 
  volume, 
  onClose,
  status = "Listening",
  transcript
}) => {
  // Amplify volume for visual impact
  const visualScale = 1 + Math.min(volume * 5, 1.5); 
  const glowOpacity = 0.3 + Math.min(volume * 2, 0.7);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden font-mono"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-black to-black pointer-events-none" />
      
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-medium text-indigo-200 tracking-widest uppercase">Live Connection</span>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all border border-zinc-800"
        >
          <X size={24} />
        </button>
      </div>

      {/* TRANSCRIPT HUD (TOP - COUNCIL) */}
      <div className="absolute top-24 left-0 right-0 px-8 text-center pointer-events-none z-40">
           {transcript && !transcript.isUser && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 key={transcript.text}
                 className="inline-block"
               >
                   <span className="text-indigo-400 text-sm font-medium tracking-wide uppercase block mb-1">Council</span>
                   <span className="text-xl md:text-2xl text-white font-light glow-text leading-tight">"{transcript.text}"</span>
               </motion.div>
           )}
      </div>

      {/* THE ORB / CORE */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* 1. Outer Ripples (Echoes) */}
        <motion.div 
          className="absolute inset-0 rounded-full border border-indigo-500/20"
          animate={{ 
            scale: [1, 1.5, 1.8],
            opacity: [0.5, 0.2, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeOut" 
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border border-cyan-500/10"
          animate={{ 
            scale: [1, 1.2, 1.5],
            opacity: [0.4, 0.1, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeOut",
            delay: 1
          }}
        />

        {/* 2. The Reactive Glow Halo */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-indigo-500 blur-3xl"
          style={{ opacity: glowOpacity }}
          animate={{ scale: visualScale }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* 3. The Core Liquid Sphere */}
        <div className="relative w-48 h-48 rounded-full overflow-hidden bg-black border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
           {/* Inner gradient animation */}
           <motion.div 
             className="absolute inset-[-50%] opacity-50 mix-blend-screen"
             style={{ 
               background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, #6366F1 100deg, transparent 200deg, #0EA5E9 300deg, transparent 360deg)'
             }}
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           />
           
           {/* Volume reactive scale of inner core */}
           <motion.div 
             className="absolute inset-4 rounded-full bg-black/90 flex items-center justify-center"
             animate={{ scale: 1 + (volume * 0.2) }}
           >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-900/50 to-cyan-900/50 blur-md" />
           </motion.div>

           {/* Central White Hot Core */}
           <motion.div 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-2xl mix-blend-overlay"
             style={{ opacity: 0.1 + volume }}
           />
        </div>
      </div>

       {/* TRANSCRIPT HUD (BOTTOM - USER) */}
       <div className="absolute bottom-32 left-0 right-0 px-8 text-center pointer-events-none z-40">
           {transcript && transcript.isUser && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 key={transcript.text}
                 className="inline-block"
               >
                   <span className="text-cyan-400 text-sm font-medium tracking-wide uppercase block mb-1">Prism</span>
                   <span className="text-lg md:text-xl text-zinc-200 font-light leading-tight">"{transcript.text}"</span>
               </motion.div>
           )}
      </div>

      {/* Status Text */}
      <div className="absolute bottom-12 text-center space-y-2">
         <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-light text-indigo-300/50 tracking-[0.2em] uppercase"
         >
           {status}
         </motion.div>
         <div className="flex items-center justify-center gap-2 text-indigo-400/60 text-[10px] uppercase tracking-widest">
            <Activity size={10} />
            <span>Secure Channel Active</span>
         </div>
      </div>

    </motion.div>
  );
};