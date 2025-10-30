import React, { useState } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { UploadIcon, EditIcon } from './Icons';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalBase64, setOriginalBase64] = useState<string | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  
  const [prompt, setPrompt] = useState<string>('Add a retro filter to this image.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      const previewUrl = URL.createObjectURL(file);
      setOriginalPreviewUrl(previewUrl);
      fileToBase64(file).then(setOriginalBase64).catch(err => {
        console.error(err);
        setError("Failed to process image file.");
      });
      setEditedImageUrl(null);
      setError(null);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !originalBase64 || !prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const response = await editImage(prompt, originalBase64, originalImage.type);
      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart && imagePart.inlineData) {
        const base64Data = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        setEditedImageUrl(`data:${mimeType};base64,${base64Data}`);
      } else {
          throw new Error("No image data returned from API.");
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while editing the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-cyan-300 uppercase tracking-widest">Image Editor</h2>
      <p className="text-cyan-400/80 mb-6">Upload an image and tell Gemini how to edit it.</p>
      
      <div className="space-y-6">
        <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-cyan-300 mb-2">Original Image</label>
            {!originalPreviewUrl && (
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-cyan-400/30 border-dashed rounded-md bg-black/20">
                    <div className="space-y-1 text-center">
                        <div className="w-12 h-12 mx-auto text-cyan-500"><UploadIcon /></div>
                        <div className="flex text-sm text-cyan-400/80">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-cyan-300 hover:text-cyan-100 focus-within:outline-none">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                        <p className="text-xs text-cyan-500/70">PNG, JPG, etc.</p>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {originalPreviewUrl && (
                <div className="text-center p-2 bg-black/20 rounded-md hud-border">
                    <h3 className="font-semibold mb-2 text-cyan-300 uppercase">Original</h3>
                    <img src={originalPreviewUrl} alt="Original" className="w-full h-auto rounded-lg object-contain max-h-96"/>
                    <label htmlFor="file-reupload" className="mt-2 inline-block cursor-pointer text-sm text-cyan-300 hover:text-cyan-100">
                        Change image
                         <input id="file-reupload" name="file-reupload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                </div>
            )}
            
            {(isLoading || editedImageUrl) && (
                 <div className="text-center p-2 bg-black/20 rounded-md hud-border">
                    <h3 className="font-semibold mb-2 text-cyan-300 uppercase">Edited</h3>
                    {isLoading && (
                        <div className="w-full bg-black/30 rounded-lg flex items-center justify-center aspect-square animate-pulse max-h-96">
                             <div className="w-12 h-12 text-cyan-400"><EditIcon /></div>
                        </div>
                    )}
                    {editedImageUrl && !isLoading && (
                        <img src={editedImageUrl} alt="Edited" className="w-full h-auto rounded-lg object-contain max-h-96" />
                    )}
                </div>
            )}
        </div>

        {originalImage && (
            <>
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-cyan-300">Edit Instruction</label>
                    <input
                    id="prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-1 block w-full bg-black/50 text-cyan-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all border border-cyan-400/30 p-2"
                    />
                </div>

                <button
                    onClick={handleEdit}
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 rounded-md shadow-sm text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-900/50 disabled:text-cyan-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-500 uppercase tracking-wider"
                >
                    {isLoading ? 'Editing...' : 'Generate Edit'}
                </button>
            </>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ImageEditor;