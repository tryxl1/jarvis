import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { UploadIcon } from './Icons';

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('Describe this image in detail.');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      fileToBase64(file).then(setImageBase64).catch(err => {
        console.error(err);
        setError("Failed to process image file.");
      });
      setResult('');
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image || !imageBase64 || !prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await analyzeImage(prompt, imageBase64, image.type);
      setResult(response.text);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Image Analyzer</h2>
      <p className="text-cyan-400/80 mb-6">Upload an image and submit a prompt for analysis.</p>
      
      <div className="space-y-6">
        <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-cyan-300 mb-2">Image Input</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-cyan-400/30 border-dashed rounded-md bg-black/20">
                <div className="space-y-1 text-center">
                    {previewUrl ? (
                         <img src={previewUrl} alt="Preview" className="mx-auto h-48 w-auto rounded-lg object-contain"/>
                    ) : (
                        <>
                            <div className="w-12 h-12 mx-auto text-cyan-500"><UploadIcon /></div>
                            <div className="flex text-sm text-cyan-400/80">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-300 hover:text-cyan-100 focus-within:outline-none">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-cyan-500/70">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                </div>
            </div>
             {previewUrl && (
                <div className="mt-2 text-center">
                    <label htmlFor="file-reupload" className="cursor-pointer text-sm text-cyan-300 hover:text-cyan-100">
                        Change image
                         <input id="file-reupload" name="file-reupload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>
             )}
        </div>

        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-cyan-300">Prompt</label>
            <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1 block w-full bg-black/50 text-cyan-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all border border-cyan-400/30 p-2"
            />
        </div>

        <button
            onClick={handleAnalyze}
            disabled={!image || isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-900/50 disabled:text-cyan-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 uppercase tracking-wider"
        >
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>

        {error && <p className="text-red-400 text-center">{error}</p>}
        
        {result && (
            <div className="bg-black/30 p-4 rounded-lg hud-border">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase">Analysis Result</h3>
                <p className="text-cyan-200 whitespace-pre-wrap">{result}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;