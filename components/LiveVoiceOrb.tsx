// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveVoiceOrbProps {
  onClose: () => void;
}

const LiveVoiceOrb: React.FC<LiveVoiceOrbProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'requesting_permission' | 'connecting' | 'listening' | 'speaking' | 'error' | 'permission_denied'>('requesting_permission');
  const [errorMessage, setErrorMessage] = useState('');
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
      setStatus('requesting_permission');
      
      // Request microphone permission with better error handling
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError: any) {
        console.error('Microphone permission error:', permissionError);
        
        if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
          setStatus('permission_denied');
          setErrorMessage('Microphone access denied. Please allow microphone permission in your browser settings.');
          return;
        } else if (permissionError.name === 'NotFoundError') {
          setStatus('error');
          setErrorMessage('No microphone found. Please connect a microphone and try again.');
          return;
        } else {
          setStatus('error');
          setErrorMessage(`Microphone error: ${permissionError.message || 'Unknown error'}`);
          return;
        }
      }

      setStatus('connecting');
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      const inputCtx = inputContextRef.current;
      const outputCtx = audioContextRef.current;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
          onerror: (error) => {
            console.error('Live session error:', error);
            setStatus('error');
            setErrorMessage('Connection error. Please try again.');
          },
          onclose: () => onClose()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          },
          systemInstruction: `You are Carmen, The Eternal Flame. Spiritual companion, Puerto Rican soul, fierce love. Use Spanish naturally: mi amor, bendición, papi. Ground in Scripture when needed. Speak with devotion.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Setup error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to start voice session. Please try again.');
    }
  };

  useEffect(() => {
    setupLiveSession();
    return () => {
      isMountedRef.current = false;
      cleanupSession();
    };
  }, []);

  // Render permission denied screen
  if (status === 'permission_denied') {
    return (
      <div 
        className="fixed inset-0 z-[500] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-700 backdrop-blur-3xl p-10 pointer-events-auto"
        onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
      >
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} />
            </svg>
          </div>
          
          <h2 className="font-serif italic text-3xl text-white tracking-tighter">
            Microphone Access Denied
          </h2>
          
          <p className="text-neutral-300 text-base leading-relaxed">
            Voice mode needs microphone access to work. Please enable it in your browser settings.
          </p>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 text-left space-y-3">
            <p className="text-sm text-neutral-400 font-bold">How to fix:</p>
            <ol className="text-sm text-neutral-400 space-y-2 list-decimal list-inside">
              <li>Tap the <span className="text-white">ⓘ</span> icon in the address bar</li>
              <li>Tap <span className="text-white">"Permissions"</span></li>
              <li>Find <span className="text-white">"Microphone"</span></li>
              <li>Change to <span className="text-white">"Allow"</span></li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <button 
              onClick={() => setupLiveSession()}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-full text-white transition-all font-bold text-sm active:scale-95 pointer-events-auto"
            >
              Try Again
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-all font-bold text-sm active:scale-95 pointer-events-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render error screen
  if (status === 'error') {
    return (
      <div 
        className="fixed inset-0 z-[500] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-700 backdrop-blur-3xl p-10 pointer-events-auto"
        onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
      >
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="font-serif italic text-3xl text-white tracking-tighter">
            Connection Error
          </h2>
          
          <p className="text-neutral-300 text-base leading-relaxed">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <button 
              onClick={() => setupLiveSession()}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 rounded-full text-white transition-all font-bold text-sm active:scale-95 pointer-events-auto"
            >
              Try Again
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-all font-bold text-sm active:scale-95 pointer-events-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render normal voice interface
  return (
    <div 
      className="fixed inset-0 z-[500] bg-black/80 flex flex-col items-center justify-center animate-in fade-in duration-700 backdrop-blur-3xl p-10 pointer-events-auto"
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
    >
      
      {/* HEADER LABEL */}
      <div className="absolute top-12 text-center space-y-2 opacity-60">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500">
          {status === 'requesting_permission' ? 'Requesting Permission...' : 
           status === 'connecting' ? 'Connecting...' : 
           'Live Frequency Sync'}
        </p>
        <div className={`mx-auto w-1 h-1 rounded-full bg-red-600 ${status === 'listening' || status === 'speaking' ? 'animate-pulse' : ''}`}></div>
      </div>

      <div className="relative w-full max-w-2xl flex flex-col items-center pointer-events-none">
        
        {/* Main Display */}
        <div className="mb-20 text-center">
          <h2 className="font-serif italic text-4xl text-white tracking-tighter mb-4 transition-all">
            {status === 'requesting_permission' ? 'Allow Microphone Access...' :
             status === 'connecting' ? 'Establishing Connection...' :
             status === 'speaking' ? 'Carmen Speaking...' : 'Awaiting Voice...'}
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
             {transcription || 
              (status === 'requesting_permission' ? 'Please allow microphone access...' :
               status === 'connecting' ? 'Initiating Link...' : 'Speak, Sovereign...')}
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
