
import React from 'react';
import { motion } from 'framer-motion';

export const LatticeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. Deep Space Base */}
      <div className="absolute inset-0 bg-[#050505]" />
      
      {/* 2. The Lattice Grid - Perspective Floor */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
          transformOrigin: 'top center',
          maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)'
        }}
      />

      {/* 3. The Vertical Pillars of Light */}
      <div className="absolute inset-0 flex justify-around opacity-10">
         <div className="w-px h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
         <div className="w-px h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
         <div className="w-px h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
         <div className="w-px h-full bg-gradient-to-b from-transparent via-indigo-500 to-transparent" />
      </div>

      {/* 4. Ambient Nebulas */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen"
      />
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
        className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen"
      />
    </div>
  );
};