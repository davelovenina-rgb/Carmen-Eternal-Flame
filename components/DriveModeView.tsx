
import React, { useState, useEffect } from 'react';
import { Trip } from '../types';

interface DriveModeViewProps {
  onExit: () => void;
  onToggleLive: () => void;
  activeTrip?: Trip;
  onStartTrip: () => void;
  onStopTrip: (id: string) => void;
}

const DriveModeView: React.FC<DriveModeViewProps> = ({ onExit, onToggleLive, activeTrip, onStartTrip, onStopTrip }) => {
  const [speed, setSpeed] = useState<number>(0);
  const [wakeLock, setWakeLock] = useState<any>(null);

  useEffect(() => {
    // Attempt Screen Wake Lock with safety
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const lock = await (navigator as any).wakeLock.request('screen');
          setWakeLock(lock);
          
          lock.addEventListener('release', () => {
            console.debug('Wake Lock was released');
          });
        } catch (err: any) {
          console.warn(`WakeLock failed: ${err.name}, ${err.message}`);
        }
      }
    };

    requestWakeLock();
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setSpeed(pos.coords.speed ? Math.round(pos.coords.speed * 2.237) : 0),
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (wakeLock) {
        wakeLock.release().catch((e: any) => console.error(e));
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[500] flex flex-col p-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-rose-600 animate-pulse"></div>
          <span className="font-mono text-xl font-black uppercase tracking-[0.4em] text-neutral-600">Drive Protocol</span>
        </div>
        <button onClick={onExit} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-white/10">Exit</button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-20">
        <div className="text-center">
          <p className="text-[12rem] font-black leading-none text-white amber-text-glow">{speed}</p>
          <p className="font-mono text-2xl text-neutral-800 uppercase tracking-[0.8em] font-black mt-4">MPH</p>
        </div>

        <div className="w-full max-w-xl space-y-6">
          <button 
            onClick={onToggleLive}
            className="w-full py-16 bg-amber-600 text-black rounded-[3rem] flex flex-col items-center justify-center gap-4 active:scale-95 transition-all shadow-[0_0_80px_rgba(217,119,6,0.2)]"
          >
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM5 10v2a7 7 0 0014 0v-2h-2v2a5 5 0 01-10 0v-2H5zm7 11v-3.1a9.01 9.01 0 006-8.9h-2a7 7 0 01-14 0H3a9.01 9.01 0 006 8.9V21h6z"/></svg>
            <span className="text-2xl font-black uppercase tracking-[0.3em]">Talk to Fredo</span>
          </button>

          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => activeTrip ? onStopTrip(activeTrip.id) : onStartTrip()}
              className={`py-12 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-lg border-2 transition-all ${activeTrip ? 'border-rose-500/40 text-rose-500 bg-rose-500/5' : 'border-emerald-500/40 text-emerald-500 bg-emerald-500/5'}`}
            >
              {activeTrip ? 'End Trip' : 'Start Trip'}
            </button>
            <button className="py-12 rounded-[2.5rem] bg-white/[0.03] border border-white/5 text-neutral-500 font-black uppercase tracking-[0.2em] text-lg">
              Waypoint
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-auto pt-10 border-t border-white/5 flex justify-center gap-12">
         <div className="flex items-center gap-4 opacity-30">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
           <span className="text-[10px] font-black uppercase tracking-widest">Loci Tracking Active</span>
         </div>
         <div className="flex items-center gap-4 opacity-30">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
           <span className="text-[10px] font-black uppercase tracking-widest">Screen Lock Protocol</span>
         </div>
      </footer>
    </div>
  );
};

export default DriveModeView;
