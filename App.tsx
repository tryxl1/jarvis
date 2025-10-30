import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Chat from './components/Chat';
import LiveTalk from './components/LiveTalk';
import ImageAnalyzer from './components/ImageAnalyzer';
import ImageEditor from './components/ImageEditor';
import VideoAnalyzer from './components/VideoAnalyzer';
import Transcriber from './components/Transcriber';
import TextToSpeech from './components/TextToSpeech';
import DeepThought from './components/DeepThought';
import { AppFeature } from './types';
import { BrainIcon } from './components/Icons';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    return <div className="font-mono text-cyan-300 text-lg tracking-widest">{time.toLocaleTimeString()}</div>;
};

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<AppFeature>(AppFeature.Chat);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 1500); // Boot sequence duration
    return () => clearTimeout(timer);
  }, []);

  const CurrentFeatureComponent = useMemo(() => {
    switch (activeFeature) {
      case AppFeature.LiveTalk:
        return <LiveTalk />;
      case AppFeature.ImageAnalyzer:
        return <ImageAnalyzer />;
      case AppFeature.ImageEditor:
        return <ImageEditor />;
      case AppFeature.VideoAnalyzer:
        return <VideoAnalyzer />;
      case AppFeature.Transcriber:
        return <Transcriber />;
      case AppFeature.TextToSpeech:
        return <TextToSpeech />;
      case AppFeature.DeepThought:
        return <DeepThought />;
      case AppFeature.Chat:
      default:
        return <Chat />;
    }
  }, [activeFeature]);

  if (isBooting) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black font-sans text-cyan-300">
        <div className="animate-pulse text-xl tracking-widest">INITIALIZING GEMINI INTERFACE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
      <header className="flex justify-between items-center p-3 hud-border bg-black/30 backdrop-blur-sm rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10"><BrainIcon /></div>
          <h1 className="text-lg sm:text-xl font-bold text-cyan-300 uppercase tracking-widest">Stark Industries AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">SYSTEM STATUS: <span className="text-green-400 font-bold">ONLINE</span></span>
          <Clock />
        </div>
      </header>
      
      <div className="flex-grow flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="sm:w-64 flex-shrink-0">
          <Header activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        </div>

        <main className="flex-grow hud-border bg-black/30 backdrop-blur-sm rounded-md p-1 relative">
          <div className="absolute inset-0 p-4 md:p-6 overflow-y-auto">
             {CurrentFeatureComponent}
          </div>
        </main>
      </div>

      <footer className="text-center p-2 text-cyan-500/50 text-xs hud-border bg-black/30 backdrop-blur-sm rounded-md">
        <p>CONFIDENTIAL: STARK INDUSTRIES INTERNAL USE ONLY. UNAUTHORIZED ACCESS IS PROHIBITED.</p>
      </footer>
    </div>
  );
};

export default App;