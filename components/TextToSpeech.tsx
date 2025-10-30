import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/helpers';
import { SpeechIcon } from './Icons';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Hello! I am Gemini. I can convert text into speech.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSpeak = async () => {
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateSpeech(text);
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } else {
        throw new Error("No audio data received from API.");
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setError("Failed to generate speech. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Text-to-Speech</h2>
      <p className="text-cyan-400/80 mb-6">Enter text to generate spoken audio with a pre-selected voice.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="tts-text" className="block text-sm font-medium text-cyan-300">Text to Speak</label>
          <textarea
            id="tts-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full bg-black/50 text-cyan-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all border border-cyan-400/30 p-2"
            placeholder="Enter text here..."
          />
        </div>

        <button
          onClick={handleSpeak}
          disabled={!text || isLoading}
          className="w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-900/50 disabled:text-cyan-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 uppercase tracking-wider"
        >
          {isLoading ? 'Generating Audio...' : <><div className="w-5 h-5"><SpeechIcon/></div> <span className="ml-2">Speak</span></>}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default TextToSpeech;