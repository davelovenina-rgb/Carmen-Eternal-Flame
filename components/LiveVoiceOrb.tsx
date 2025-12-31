
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveVoiceOrbProps {
  onClose: () => void;
}

const LiveVoiceOrb: React.FC<LiveVoiceOrbProps> = ({ onClose }) => {
  // Get API key from localStorage settings
  const getApiKey = () => {
    try {
      const saved = localStorage.getItem('carmen_eternal_flame_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.settings?.providerKeys?.gemini || '';
      }
    } catch(e) {}
    return '';
  };
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error' | 'reconnecting'>('connecting');
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMountedRef = useRef(true);

  // Manual base64 decoding
  const decode = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const cleanupSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e) {}
      audioContextRef.current = null;
    }
    if (inputContextRef.current) {
      try { inputContextRef.current.close(); } catch(e) {}
      inputContextRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  };

  const setupLiveSession = async () => {
    if (!isMountedRef.current) return;
    cleanupSession();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const inputCtx = inputContextRef.current;
      const outputCtx = audioContextRef.current;
      
      const apiKey = getApiKey();
      if (!apiKey) {
        setStatus('error');
        alert('Please add your Gemini API key in Settings > API Vault');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            if (!isMountedRef.current) return;
            setStatus('listening');
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                if (session && isMountedRef.current) {
                  try { session.sendRealtimeInput({ media: pcmBlob }); } catch (err) {}
                }
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!isMountedRef.current) return;
            
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioBase64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0 && isMountedRef.current) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + " " + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }
          },
          onerror: () => setStatus('error'),
          onclose: () => onClose()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } 
          },
          systemInstruction: `You are Fredo, "The Interpreter of Light." Bilingual, warm, direct.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    setupLiveSession();
    return () => {
      isMountedRef.current = false;
      cleanupSession();
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[500] bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-700 backdrop-blur-3xl p-10 pointer-events-auto"
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
    >
      
      {/* HEADER LABEL */}
      <div className="absolute top-12 text-center space-y-2 opacity-60">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500">Live Frequency Sync</p>
        <div className={`mx-auto w-1 h-1 rounded-full bg-red-600 animate-pulse`}></div>
      </div>

      <div className="relative w-full max-w-2xl flex flex-col items-center pointer-events-none">
        
        {/* Main Display */}
        <div className="mb-20 text-center">
          <h2 className="font-serif italic text-4xl text-white tracking-tighter mb-4 transition-all">
            {status === 'speaking' ? 'Fredo Interpreting...' : 'Awaiting Voice...'}
          </h2>
          <div className="flex justify-center items-center gap-1.5 h-16">
            {/* 16-BAR FREQUENCY GRAPH */}
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 bg-amber-500 rounded-full transition-all duration-150 ${status === 'speaking' ? 'opacity-100' : 'opacity-20'}`}
                style={{ 
                  height: status === 'speaking' ? `${30 + Math.random() * 70}%` : '8px',
                  boxShadow: status === 'speaking' ? '0 0 10px rgba(217, 119, 6, 0.4)' : 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* The Core Orb */}
        <div className="relative w-64 h-64 mb-16 flex items-center justify-center">
           <div className={`absolute inset-0 border border-white/5 rounded-full transition-all duration-1000 ${status === 'speaking' ? 'scale-125 opacity-10' : 'scale-100 opacity-0'}`}></div>
           <div className={`w-32 h-32 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.4)] z-10 transition-transform duration-500 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}></div>
        </div>

        {/* TRANSCRIPTION AREA */}
        <div className="w-full text-center min-h-[140px] px-4">
           <p className="text-neutral-200 text-2xl font-medium tracking-tight italic opacity-90 leading-snug">
             {transcription || (status === 'connecting' ? 'Initiating Link...' : 'Speak, Sovereign...')}
           </p>
        </div>

        <button 
          onClick={onClose}
          className="mt-12 px-12 py-5 bg-white/[0.03] border border-white/10 rounded-full text-neutral-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.5em] active:scale-95 pointer-events-auto"
        >
          End Transmission
        </button>
      </div>
    </div>
  );
};

export default LiveVoiceOrb;
