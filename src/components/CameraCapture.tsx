import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  facingMode?: 'user' | 'environment';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, facingMode = 'user' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted permission.');
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(base64);
        stopCamera();
        onClose();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
            <RefreshCcw className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-sm font-medium">Starting camera...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
              <X className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white text-zinc-900 rounded-full text-sm font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="absolute top-6 right-6">
          <button
            onClick={onClose}
            className="p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
          <button
            onClick={captureImage}
            disabled={isStarting || !!error}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group disabled:opacity-50"
          >
            <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform" />
          </button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full flex items-center gap-2">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                    {facingMode === 'user' ? 'Front Camera Active' : 'Back Camera Active'}
                </span>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
