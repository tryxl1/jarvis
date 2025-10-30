import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon, UserIcon, BotIcon } from './Icons';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I am the J.A.R.V.I.S. interface, powered by Gemini. How may I assist you?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToChat(input);
      const botMessage: ChatMessage = { sender: 'bot', text: response.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: 'Apologies, I have encountered an anomaly in my processing core. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Gemini Chat Interface</h2>
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && <BotIcon />}
            <div
              className={`max-w-xl p-3 rounded-xl backdrop-blur-sm hud-border ${
                msg.sender === 'user'
                  ? 'bg-cyan-600/30 text-white rounded-br-none'
                  : 'bg-cyan-950/30 text-cyan-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
             {msg.sender === 'user' && <UserIcon />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <BotIcon />
            <div className="bg-cyan-950/30 text-cyan-200 p-3 rounded-xl rounded-bl-none hud-border">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-6 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter command..."
          className="flex-grow bg-black/50 text-cyan-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all border border-cyan-400/30"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="ml-4 bg-cyan-500 text-black p-3 rounded-full hover:bg-cyan-400 disabled:bg-cyan-900/50 disabled:text-cyan-500 disabled:cursor-not-allowed transition-colors shadow-glow-cyan hover:shadow-glow-cyan-light"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default Chat;