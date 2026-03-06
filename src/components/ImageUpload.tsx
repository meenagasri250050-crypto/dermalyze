import React, { useRef, useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraCapture } from './CameraCapture';

interface ImageUploadProps {
  label: string;
  description: string;
  image: string | null;
  onImageSelect: (base64: string | null) => void;
  id: string;
  facingMode?: 'user' | 'environment';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, description, image, onImageSelect, id, facingMode = 'user' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">
        {label}
      </label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative group h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
          ${image ? 'border-transparent' : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/50'}`}
      >
        <AnimatePresence mode="wait">
          {image ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={image}
                alt={label}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => onImageSelect(null)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-900" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{description}</p>
                <p className="text-xs text-zinc-500 mt-1">Drag and drop or use camera</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-[320px]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-4 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-2xl hover:bg-zinc-900 hover:text-white transition-all flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95"
                >
                  <Upload className="w-5 h-5" />
                  Upload
                </button>
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="px-6 py-4 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-2xl hover:bg-zinc-900 hover:text-white transition-all flex flex-col items-center justify-center gap-3 shadow-sm active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  Camera
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {isCameraOpen && (
          <CameraCapture
            facingMode={facingMode}
            onCapture={(base64) => {
              onImageSelect(base64);
              setIsCameraOpen(false);
            }}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
