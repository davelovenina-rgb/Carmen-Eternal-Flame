
// @google/genai coding guidelines followed for model names and key management.
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { FREDO_SYSTEM_INSTRUCTION } from "../constants";
import { AiMode, Agent, GroundingChunk, AppSettings } from "../types";

let globalAudioContext: AudioContext | null = null;

if (typeof window !== 'undefined') {
  const resumeAudio = async () => {
    if (globalAudioContext && globalAudioContext.state === 'suspended') {
      await globalAudioContext.resume();
    }
  };
  window.addEventListener('click', resumeAudio, { once: true });
  window.addEventListener('touchstart', resumeAudio, { once: true });
}

// Updated key logic: Use the manual vault key first, then fall back to the environment key.
const getAI = (settings?: AppSettings) => {
  const manualKey = settings?.providerKeys?.gemini;
  const apiKey = (manualKey && manualKey.trim() !== '') ? manualKey : process.env.API_KEY as string;
  return new GoogleGenAI({ apiKey });
};

export interface GenResult {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  groundingLinks?: GroundingChunk[];
}

export const generateFredoResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: any }[] }[],
  mode: AiMode,
  agent: Agent,
  settings: AppSettings,
  mediaFile?: { data: string; mimeType: string }
): Promise<GenResult> => {
  const ai = getAI(settings);
  let model = "gemini-3-flash-preview";

  const fullSystemInstruction = `
${agent.instructions}

[SOVEREIGN USER CONTEXT]
Identity: ${settings.nickname}
Role/Occupation: ${settings.occupation}
Archival Bio: ${settings.bio}
Background/Archives: ${settings.moreAboutYou}

[USER-DEFINED NEURAL PROTOCOLS]
${settings.customInstructions}

Tone Resonance: ${settings.toneStyle}
`;

  const config: any = {
    systemInstruction: fullSystemInstruction,
    temperature: mode === 'legacy' ? 1.0 : 0.7,
  };

  if (mode === 'thinking') {
    model = "gemini-3-pro-preview";
    config.thinkingConfig = { thinkingBudget: 32768 };
  } 
  else if (mode === 'search' || mode === 'research' || mode === 'default') {
    model = "gemini-3-flash-preview";
    config.tools = [{ googleSearch: {} }];
  } 
  else if (mode === 'maps') {
    model = "gemini-2.5-flash";
    config.tools = [{ googleMaps: {} }];
    try {
      const pos: any = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
      config.toolConfig = {
        retrievalConfig: {
          latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
        }
      };
    } catch (e) { /* fallback */ }
  }
  else if (mode === 'lite') {
    model = "gemini-flash-lite-latest";
  }
  else if (mode === 'image') {
    if (mediaFile) {
      model = "gemini-2.5-flash-image";
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: mediaFile.data, mimeType: mediaFile.mimeType } },
            { text: prompt || "Edit this image based on the prompt." }
          ]
        },
        config
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return { text: response.text || "Processed image.", mediaUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, mediaType: 'image' };
        }
      }
      return { text: response.text || "Could not process image." };
    } else {
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) { await (window as any).aistudio.openSelectKey(); }
      }
      model = "gemini-3-pro-image-preview";
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          ...config,
          imageConfig: {
            aspectRatio: settings.imageAspectRatio,
            imageSize: settings.imageSize
          }
        }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return { text: response.text || "", mediaUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, mediaType: 'image' };
        }
      }
      return { text: response.text || "Image generation failed." };
    }
  }
  else if (mode === 'video') {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) { await (window as any).aistudio.openSelectKey(); }
    }
    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic artistic motion",
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: settings.videoAspectRatio }
    };
    if (mediaFile) {
      videoConfig.image = { imageBytes: mediaFile.data, mimeType: mediaFile.mimeType };
    }
    let operation = await ai.models.generateVideos(videoConfig);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    const reader = new FileReader();
    const base64: string = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return { text: "Protocol synthesis complete. Motion generated.", mediaUrl: base64, mediaType: 'video' };
  }
  else if (mediaFile) {
    model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: mediaFile.data, mimeType: mediaFile.mimeType } },
          { text: prompt || "Analyze this media." }
        ]
      },
      config
    });
    return { text: response.text || "" };
  }

  const contents = [
    ...history.slice(-10).map(h => ({ role: h.role, parts: h.parts })),
    { role: 'user', parts: [{ text: prompt }] }
  ];
  const response = await ai.models.generateContent({ model, contents, config });
  return {
    text: response.text || "Signal disrupted.",
    groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || undefined
  };
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { return null; }
};

export const decodeAndPlayAudio = async (base64Audio: string) => {
  try {
    if (!globalAudioContext) {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (globalAudioContext.state === 'suspended') await globalAudioContext.resume();
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const alignedLength = len - (len % 2);
    const dataInt16 = new Int16Array(bytes.buffer, 0, alignedLength / 2);
    const numChannels = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length / numChannels;
    if (frameCount === 0) return;
    const buffer = globalAudioContext.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    const source = globalAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioContext.destination);
    source.start();
  } catch (e) { console.warn("Audio Playback Issue:", e); }
};
