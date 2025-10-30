
export enum AppFeature {
  Chat = 'Chat',
  LiveTalk = 'Live Talk',
  ImageAnalyzer = 'Image Analyzer',
  ImageEditor = 'Image Editor',
  VideoAnalyzer = 'Video Analyzer',
  Transcriber = 'Transcriber',
  TextToSpeech = 'Text-to-Speech',
  DeepThought = 'Deep Thought',
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
