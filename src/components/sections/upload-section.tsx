'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CustomizationOptions {
  height: number; // 1-10 scale (1 = very short, 10 = very tall)
  dressStyle: string; // formal, casual, sporty, beach, party, business
  position: string; // foreground, middle, background, blend
}

export default function UploadSection() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Customization options
  const [options, setOptions] = useState<CustomizationOptions>({
    height: 5, // Medium height
    dressStyle: 'casual',
    position: 'blend',
  });

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setResultImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert base64 to blob
      const response = await fetch(uploadedImage);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'upload.jpg');
      formData.append('options', JSON.stringify(options));

      // Call API
      const apiResponse = await fetch('/api/add-hunter', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const result = await apiResponse.json();
      setResultImage(result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setResultImage(null);
    setError(null);
    setOptions({
      height: 5,
      dressStyle: 'casual',
      position: 'blend',
    });
  };

  return (
    <section id="upload" className="py-[34px] bg-white dark:bg-dark-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Photo 🚀
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Pick that photo where Hunter should have been. Let's make some magic happen! ✨
            </p>
          </div>

          {/* Upload Area */}
          {!uploadedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center transition-colors
                ${dragActive 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-primary'
                }
              `}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Click to upload
                  </label>
                  <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Uploaded Image Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Photo
                  </h3>
                  <button
                    onClick={resetUpload}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    Upload Different Photo
                  </button>
                </div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={uploadedImage}
                    alt="Uploaded photo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Customization Options */}
              <div className="bg-gray-50 dark:bg-dark-primary rounded-2xl p-6 space-y-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Customize Hunter's Appearance 🎨
                </h3>

                {/* Height Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Height
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {options.height === 1 && 'Very Short'}
                      {options.height >= 2 && options.height <= 3 && 'Short'}
                      {options.height >= 4 && options.height <= 6 && 'Average'}
                      {options.height >= 7 && options.height <= 8 && 'Tall'}
                      {options.height >= 9 && 'Very Tall'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={options.height}
                    onChange={(e) => setOptions({ ...options, height: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                </div>

                {/* Dress Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dress Style
                  </label>
                  <select
                    value={options.dressStyle}
                    onChange={(e) => setOptions({ ...options, dressStyle: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="casual">Casual 👕</option>
                    <option value="formal">Formal 👔</option>
                    <option value="sporty">Sporty 🏃</option>
                    <option value="beach">Beach 🏖️</option>
                    <option value="party">Party 🎉</option>
                    <option value="business">Business 💼</option>
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position in Photo
                  </label>
                  <select
                    value={options.position}
                    onChange={(e) => setOptions({ ...options, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="foreground">Foreground (Front) 🎯</option>
                    <option value="middle">Middle Ground 📍</option>
                    <option value="background">Background 🌄</option>
                    <option value="blend">Natural Blend ✨</option>
                  </select>
                </div>
              </div>

              {/* Process Button */}
              <button
                onClick={processImage}
                disabled={isProcessing}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-white transition-all
                  ${isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98]'
                  }
                `}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Adding Hunter to your photo... 🎨✨
                  </span>
                ) : (
                  '✨ Add Hunter to Photo ✨'
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Result Image */}
              {resultImage && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Result
                  </h3>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                    <Image
                      src={resultImage}
                      alt="Result with Hunter added"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a
                    href={resultImage}
                    download="hunter-added.jpg"
                    className="block w-full py-3 px-6 rounded-xl font-semibold text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Download Result
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

