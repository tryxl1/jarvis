import React from 'react';
import { AppFeature } from '../types';
import { ChatIcon, MicIcon, ImageIcon, VideoIcon, SpeechIcon, BrainIcon, EditIcon, AudioFileIcon } from './Icons';

interface HeaderProps {
  activeFeature: AppFeature;
  setActiveFeature: (feature: AppFeature) => void;
}

const Header: React.FC<HeaderProps> = ({ activeFeature, setActiveFeature }) => {
  const features = [
    { id: AppFeature.Chat, icon: <ChatIcon />, label: 'Chat' },
    { id: AppFeature.LiveTalk, icon: <MicIcon />, label: 'Live Talk' },
    { id: AppFeature.ImageAnalyzer, icon: <ImageIcon />, label: 'Image Analyzer' },
    { id: AppFeature.ImageEditor, icon: <EditIcon />, label: 'Image Editor' },
    { id: AppFeature.VideoAnalyzer, icon: <VideoIcon />, label: 'Video Analyzer' },
    { id: AppFeature.Transcriber, icon: <AudioFileIcon />, label: 'Transcriber' },
    { id: AppFeature.TextToSpeech, icon: <SpeechIcon />, label: 'Text-to-Speech' },
    { id: AppFeature.DeepThought, icon: <BrainIcon />, label: 'Deep Thought' },
  ];

  return (
    <nav className="h-full hud-border bg-black/30 backdrop-blur-sm rounded-md p-4 flex flex-col">
      <h2 className="text-lg font-bold text-cyan-400 uppercase mb-4 border-b-2 border-cyan-400/30 pb-2 tracking-wider">Modules</h2>
      <div className="flex flex-col space-y-2">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 text-left w-full
              ${activeFeature === feature.id
                ? 'bg-cyan-500/20 text-cyan-200 shadow-glow-cyan-light'
                : 'text-cyan-400 hover:text-white hover:bg-cyan-500/10'
              }`
            }
          >
            <div className="w-5 h-5">{feature.icon}</div>
            <span className="ml-3">{feature.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Header;