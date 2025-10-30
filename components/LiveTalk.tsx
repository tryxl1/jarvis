import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: The `LiveSession` type is not exported from the '@google/genai' package.
// It has been removed from the import statement to resolve the module error.
// The unused `GoogleGenAI` import was also removed.
import { LiveServerMessage, Modality, Blob } from '@google/genai';
import { getAiInstance } from '../services/geminiService';
import { decode, encode, decodeAudioData } from '../utils/helpers';
import { MicIcon, StopCircleIcon } from './Icons';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

// FIX: A local `LiveSession` interface is defined to provide type safety for the session object reference,
// which is necessary because the official type is not exported.
interface LiveSession {
  close(): void;
}

const LiveTalk: React.FC = () => {
    const [isTalking, setIsTalking] = useState(false);
    const [status, setStatus] = useState('STANDBY');
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const startConversation = async () => {
        if (isTalking) return;

        try {
            setStatus('CONNECTING...');
            const ai = getAiInstance();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('CONNECTION ESTABLISHED. LIVE.');
                        setIsTalking(true);

                        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

                        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            // FIX: Refactored audio data conversion to use a more performant loop-based approach
                            // as recommended by the guidelines, instead of using Array.prototype.map.
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                       const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                       if (base64Audio && outputAudioContextRef.current) {
                           const outputCtx = outputAudioContextRef.current;
                           nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                           const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                           
                           const source = outputCtx.createBufferSource();
                           source.buffer = audioBuffer;
                           source.connect(outputCtx.destination);
                           
                           source.addEventListener('ended', () => {
                               audioSourcesRef.current.delete(source);
                           });

                           source.start(nextStartTimeRef.current);
                           nextStartTimeRef.current += audioBuffer.duration;
                           audioSourcesRef.current.add(source);
                       }
                       if (message.serverContent?.interrupted) {
                            for(const source of audioSourcesRef.current.values()) {
                                source.stop();
                                audioSourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                       }
                    },
                    onerror: (e) => {
                        console.error('Live API Error:', e);
                        setStatus(`ERROR: ${e.type}`);
                        stopConversation();
                    },
                    onclose: () => {
                        setStatus('CONNECTION CLOSED');
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('ERROR: MICROPHONE ACCESS DENIED');
        }
    };
    
    const stopConversation = useCallback(() => {
        if (!isTalking && !sessionRef.current) return;
        setIsTalking(false);
        setStatus('STANDBY');
        
        sessionRef.current?.close();
        sessionRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close();

        outputAudioContextRef.current?.close();

        nextStartTimeRef.current = 0;
        for (const source of audioSourcesRef.current.values()) {
            source.stop();
        }
        audioSourcesRef.current.clear();
    }, [isTalking]);

    useEffect(() => {
      return () => {
        stopConversation();
      }
    }, [stopConversation]);

    return (
        <div className="text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Live Conversation</h2>
            <p className="text-cyan-400/80 mb-6">
                Engage in a real-time voice conversation with the Gemini model.
            </p>
            <div className="relative w-32 h-32 mb-6">
                <div className={`absolute inset-0 bg-cyan-500 rounded-full transition-transform duration-500 ${isTalking ? 'scale-100 animate-pulse' : 'scale-0'}`}></div>
                <button
                    onClick={isTalking ? stopConversation : startConversation}
                    className="relative w-32 h-32 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/20 transition-colors shadow-lg border-2 border-cyan-400/50"
                >
                    <div className="w-12 h-12">{isTalking ? <StopCircleIcon /> : <MicIcon />}</div>
                </button>
            </div>
            <p className="font-sans text-lg text-cyan-300 bg-black/50 px-4 py-2 rounded-md hud-border tracking-widest">{status}</p>
        </div>
    );
};

export default LiveTalk;