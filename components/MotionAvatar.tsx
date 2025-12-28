
import React from 'react';
import { motion } from 'framer-motion';

interface MotionAvatarProps {
  imageUrl?: string;
  sigil: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
}

// 1. Floating Energy Particles (Upward flow)
const EnergyParticles: React.FC<{ color: string; count?: number }> = ({ color, count = 12 }) => {
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 5
  }));

  return (
    <div className="absolute inset-[-40%] pointer-events-none z-0 overflow-hidden rounded-full">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full blur-[0.5px]"
          style={{ 
            backgroundColor: color,
            left: `${p.left}%`,
            top: `${p.top}%`,
            boxShadow: `0 0 6px ${color}`
          }}
          animate={{
            y: [0, -40, -80], // Float up
            opacity: [0, 0.6, 0], // Fade in/out
            scale: [0, p.scale, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// 2. Cosmic Nebula Fog (Rotating background ambience)
const NebulaFog: React.FC<{ color: string }> = ({ color }) => (
    <motion.div 
        className="absolute inset-[-50%] rounded-full opacity-30 mix-blend-screen blur-2xl pointer-events-none"
        style={{ 
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${color} 100deg, transparent 200deg, ${color} 300deg, transparent 360deg)`
        }}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
    />
);

// 3. Starfield (Twinkling static noise)
const StarField: React.FC = () => (
    <div className="absolute inset-0 z-10 opacity-50 mix-blend-overlay pointer-events-none">
        <motion.div 
            className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
        />
    </div>
);

export const MotionAvatar: React.FC<MotionAvatarProps> = ({ 
  imageUrl, 
  sigil, 
  color, 
  size = 'lg',
  isActive = true 
}) => {
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const containerSize = sizeClasses[size];

  return (
    <div className={`relative ${containerSize} flex items-center justify-center`}>
      
      {/* BACKGROUND EFFECTS */}
      {isActive && <NebulaFog color={color} />}
      {isActive && <EnergyParticles color={color} />}

      {/* RINGS */}
      {/* 1. Outer Pulse Ring (Breathing) */}
      <motion.div 
        className="absolute inset-[-15%] rounded-full opacity-20 blur-xl mix-blend-screen"
        style={{ backgroundColor: color }}
        animate={isActive ? { 
            scale: [1, 1.25, 1], 
            opacity: [0.1, 0.3, 0.1] 
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2. Rotating Dashed Ring (Color Shifting) */}
      <motion.div 
        className="absolute inset-[-4%] rounded-full border border-dashed"
        style={{ borderColor: `${color}40` }}
        animate={isActive ? { 
            rotate: 360,
            borderColor: [`${color}20`, `${color}80`, `${color}20`]
        } : {}}
        transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            borderColor: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* 3. Counter-Rotating Tech Ring */}
      <motion.div 
        className="absolute inset-[-8%] rounded-full border border-dotted border-white/10"
        animate={isActive ? { rotate: -360 } : {}}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />

      {/* MAIN CONTAINER */}
      <motion.div 
        className="relative w-full h-full rounded-full overflow-hidden border-2 bg-black z-10 group cursor-pointer" 
        style={{ 
            borderColor: `${color}60`,
            boxShadow: isActive ? `0 0 40px ${color}20` : `0 0 10px ${color}10` 
        }}
        whileTap={{ scale: 0.95 }}
      >
        
        {/* CLICK FLASH OVERLAY */}
        <motion.div 
            className="absolute inset-0 bg-white z-50 pointer-events-none mix-blend-overlay"
            initial={{ opacity: 0 }}
            whileTap={{ opacity: 0.5 }}
            transition={{ duration: 0.05 }}
        />
        
        {/* === HOLOGRAPHIC LIVE OVERLAYS === */}
        <div className="absolute inset-0 z-30 pointer-events-none rounded-full overflow-hidden">
             
             {/* A. Scanline */}
             <motion.div 
                className="w-full h-[20%] bg-gradient-to-b from-transparent via-white/10 to-transparent absolute top-0 left-0 blur-[2px]"
                animate={isActive ? { top: ['-20%', '120%'] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
             />

             {/* B. Starfield / Noise */}
             {isActive && <StarField />}
             
             {/* C. Occasional Glint / Flash */}
             <motion.div 
                className="absolute inset-0 bg-white mix-blend-overlay opacity-0"
                animate={isActive ? { opacity: [0, 0, 0.2, 0] } : {}}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.95, 0.98, 1] }}
             />
             
             {/* D. Color Gradient Pulse */}
             <motion.div 
                className="absolute inset-0 mix-blend-color opacity-20"
                style={{ backgroundColor: color }}
                animate={isActive ? { opacity: [0.1, 0.3, 0.1] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             />

             {/* E. Vignette */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
        
        {imageUrl ? (
          <motion.img 
            src={imageUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={isActive ? { 
                scale: [1.1, 1.15, 1.1],
                filter: [
                    `contrast(1.1) brightness(1) saturate(1.1)`, 
                    `contrast(1.2) brightness(1.1) saturate(1.25)`, 
                    `contrast(1.1) brightness(1) saturate(1.1)`
                ] 
            } : {}}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative overflow-hidden">
             {/* Abstract Geometric Background for no-image avatars */}
             <motion.div 
                className="absolute inset-0 opacity-20"
                style={{ 
                    backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 1px, transparent 0, transparent 50%)`,
                    backgroundSize: '12px 12px'
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             />
             <motion.span 
               className="text-6xl font-thin relative z-10"
               style={{ color: color }}
               animate={isActive ? { 
                   opacity: [0.6, 1, 0.6], 
                   textShadow: [`0 0 15px ${color}40`, `0 0 30px ${color}80`, `0 0 15px ${color}40`],
                   scale: [1, 1.05, 1]
               } : {}}
               transition={{ duration: 4, repeat: Infinity }}
             >
               {sigil}
             </motion.span>
          </div>
        )}
      </motion.div>

      {/* 5. Status Indicator (Dot) */}
      <div className="absolute bottom-[5%] right-[5%] z-30">
          <motion.div 
            className="w-3 h-3 rounded-full bg-black flex items-center justify-center border border-black/50"
            style={{ boxShadow: `0 0 15px ${color}` }}
          >
              <motion.div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
          </motion.div>
      </div>

    </div>
  );
};
