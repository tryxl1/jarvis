
import { GoogleGenAI, Chat, Modality, GenerateContentResponse } from '@google/genai';

// IMPORTANT: Do NOT expose your API key in client-side code.
// This is done for demonstration purposes only.
// In a real application, this logic should be on a server.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Chat Service ---
let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: [],
    });
  }
  return chatInstance;
};

export const sendMessageToChat = async (message: string): Promise<GenerateContentResponse> => {
  const chat = getChatInstance();
  return await chat.sendMessage({ message });
};

// --- Image Analysis Service ---
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType } }
      ]
    },
  });
};

// --- Image Editing Service ---
export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt },
      ]
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
};

// --- Video Analysis Service ---
export const analyzeVideoFrames = async (prompt: string, frames: string[]): Promise<GenerateContentResponse> => {
    const imageParts = frames.map(frame => ({
        inlineData: {
            data: frame,
            mimeType: 'image/jpeg'
        }
    }));

    return await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{text: prompt}, ...imageParts] }
    });
};

// --- Audio Transcription Service ---
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: "Transcribe the following audio:" },
        { inlineData: { data: audioBase64, mimeType } }
      ]
    },
  });
};

// --- Text-to-Speech Service ---
export const generateSpeech = async (text: string): Promise<GenerateContentResponse> => {
    return await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
};

// --- Deep Thought Service ---
export const getDeepThoughtResponse = async (prompt: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
};

// --- Live Talk Service ---
// The connection logic is complex and stateful, so we expose the AI instance
// for the component to manage the connection directly.
export const getAiInstance = () => ai;
