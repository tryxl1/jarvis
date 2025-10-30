import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { MicIcon, StopCircleIcon } from './Icons';

const Transcriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = handleTranscription;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscription('');
      setError(null);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const handleTranscription = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    if (audioBlob.size === 0) {
        setIsLoading(false);
        setError("No audio was recorded.");
        return;
    }

    try {
      const audioBase64 = await fileToBase64(audioBlob);
      const response = await transcribeAudio(audioBase64, audioBlob.type);
      setTranscription(response.text);
    } catch (err)
      {
      console.error("Error during transcription:", err);
      setError("Failed to transcribe audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Audio Transcriber</h2>
      <p className="text-cyan-400/80 mb-6">Record audio from your microphone for transcription by Gemini.</p>

      <div className="flex flex-col items-center space-y-6">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`flex items-center justify-center w-56 h-16 px-6 py-3 border-2 border-transparent text-base font-bold rounded-md text-black transition-colors uppercase tracking-wider
            ${isRecording ? 'bg-red-500 hover:bg-red-400 border-red-300' : 'bg-cyan-400 hover:bg-cyan-300 border-cyan-200'}`}
        >
          {isRecording ? <><div className="w-6 h-6"><StopCircleIcon/></div> <span className="ml-2">Stop Recording</span></> : <><div className="w-6 h-6"><MicIcon/></div> <span className="ml-2">Start Recording</span></>}
        </button>

        {isLoading && <p className="text-cyan-300 animate-pulse">Transcribing Audio...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {transcription && (
          <div className="w-full bg-black/30 p-4 rounded-lg hud-border">
            <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase">Transcription</h3>
            <p className="text-cyan-200 whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcriber;