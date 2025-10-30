import React, { useState } from 'react';
import { getDeepThoughtResponse } from '../services/geminiService';
import { BrainIcon } from './Icons';

const DeepThought: React.FC = () => {
  const [prompt, setPrompt] = useState('Explain the theory of relativity as if I were a curious high school student. Include its key principles, historical context, and real-world applications in a structured and easy-to-understand manner.');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await getDeepThoughtResponse(prompt);
      setResult(response.text);
    } catch (err) {
      console.error("Deep Thought Error:", err);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center text-cyan-300 uppercase tracking-widest"><div className="w-6 h-6"><BrainIcon /></div> <span className="ml-2">Deep Thought (Gemini Pro)</span></h2>
      <p className="text-cyan-400/80 mb-6">For complex queries, this mode utilizes Gemini Pro's enhanced thinking capabilities for more thorough, reasoned responses.</p>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-cyan-300">Your Complex Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="mt-1 block w-full bg-black/50 text-cyan-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all border border-cyan-400/30 p-2"
            placeholder="Enter a complex question or task..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!prompt || isLoading}
          className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-900/50 disabled:text-cyan-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 uppercase tracking-wider"
        >
          {isLoading ? 'Thinking...' : 'Initiate Deep Thought'}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        {isLoading && (
            <div className="text-center text-cyan-300 animate-pulse">
                <p>Engaging advanced reasoning protocols... This may require additional processing time.</p>
            </div>
        )}

        {result && (
            <div className="bg-black/30 p-4 rounded-lg hud-border">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase">Response</h3>
                <p className="text-cyan-200 whitespace-pre-wrap">{result}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeepThought;