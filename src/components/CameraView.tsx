import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { FilterType } from '@/src/types';

interface CameraViewProps {
  onCapture: (blob: string) => void;
  filter: FilterType;
  brightness: number;
  contrast: number;
  exposure: number;
  beautyMode: boolean;
  isCapturing: boolean;
  className?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  filter,
  brightness,
  contrast,
  exposure,
  beautyMode,
  isCapturing,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError("Please allow camera access to use the photo booth.");
    }
  }, []);

  const getFilterCSS = (f: FilterType) => {
    let base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${exposure}%)`;
    if (beautyMode) base += ' blur(0.5px) saturate(110%)';
    switch (f) {
      case 'grayscale': return `grayscale(100%) ${base}`;
      case 'sepia': return `sepia(100%) ${base}`;
      case 'vintage': return `sepia(50%) hue-rotate(-30deg) saturate(120%) ${base}`;
      case 'cool': return `hue-rotate(180deg) ${base}`;
      case 'warm': return `sepia(20%) saturate(150%) ${base}`;
      case 'high-contrast': return `contrast(200%) ${base}`;
      case 'cartoon': return `contrast(150%) saturate(200%) ${base}`;
      case 'invert': return `invert(100%) ${base}`;
      case 'film': return `sepia(10%) contrast(110%) brightness(105%) ${base}`;
      default: return base;
    }
  };

  useEffect(() => {
    startCamera();
    let animId: number;
    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          
          // Base setup
          ctx.filter = getFilterCSS(filter);
          
          if (filter === 'mirror-h') {
            const w = canvas.width;
            const h = canvas.height;
            // Draw left half
            ctx.drawImage(video, 0, 0, w/2, h, 0, 0, w/2, h);
            // Draw right half mirrored
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, w/2, h, 0, 0, w/2, h);
          } else if (filter === 'mirror-v') {
            const w = canvas.width;
            const h = canvas.height;
            ctx.drawImage(video, 0, 0, w, h/2, 0, 0, w, h/2);
            ctx.translate(0, h);
            ctx.scale(1, -1);
            ctx.drawImage(video, 0, 0, w, h/2, 0, 0, w, h/2);
          } else {
            // Standard mirrored view
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animId);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera, filter, brightness, contrast, exposure, beautyMode]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-black shadow-2xl", className)}>
      {error ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white">
          <AlertCircle className="h-12 w-12 text-zinc-500 mb-4" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <video ref={videoRef} className="hidden" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-30" />
          <div className={cn("pointer-events-none absolute inset-0 z-50 bg-white transition-opacity duration-100", isCapturing ? "opacity-100" : "opacity-0")} />
        </div>
      )}
    </div>
  );
};
