import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Layout, 
  Trash2, 
  Download, 
  X,
  History,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CameraView } from './components/CameraView';
import { SideControlPanel } from './components/SideControlPanel';
import { FilterTray } from './components/FilterTray';
import { StickerLayer } from './components/StickerLayer';
import { FilterType, FrameType, PhotoSession, Sticker, StripStyle } from './types';
import { cn } from './lib/utils';

const App: React.FC = () => {
  // Settings State
  const [filter, setFilter] = useState<FilterType>('none');
  const [frame, setFrame] = useState<FrameType>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [exposure, setExposure] = useState(100);
  const [beautyMode, setBeautyMode] = useState(false);
  const [stripStyle, setStripStyle] = useState<StripStyle>('classic');
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [mode, setMode] = useState<'single' | 'strip'>('single');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDuration, setTimerDuration] = useState(3);
  
  // App State
  const [isCapturing, setIsCapturing] = useState(false);
  const [gallery, setGallery] = useState<PhotoSession[]>([]);
  const [activeSession, setActiveSession] = useState<PhotoSession | null>(null);
  const [stripProgress, setStripProgress] = useState<string[]>([]);
  const [bottomTab, setBottomTab] = useState<'filters' | 'gallery'>('filters');
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCountdown = () => {
    if (countdown !== null) return;
    let count = timerDuration;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        handleCapture();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const drawPhotoToCanvas = useCallback(() => {
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Apply Filters manually to canvas
    let base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${exposure}%)`;
    if (beautyMode) base += ' blur(0.5px) saturate(110%)';
    let filterStr = base;
    switch (filter) {
      case 'grayscale': filterStr = `grayscale(100%) ${base}`; break;
      case 'sepia': filterStr = `sepia(100%) ${base}`; break;
      case 'vintage': filterStr = `sepia(50%) hue-rotate(-30deg) saturate(120%) ${base}`; break;
      case 'cool': filterStr = `hue-rotate(180deg) ${base}`; break;
      case 'warm': filterStr = `sepia(20%) saturate(150%) ${base}`; break;
      case 'high-contrast': filterStr = `contrast(150%) saturate(200%) ${base}`; break;
      case 'invert': filterStr = `invert(100%) ${base}`; break;
      case 'film': filterStr = `sepia(10%) contrast(110%) brightness(105%) ${base}`; break;
      case 'cartoon': filterStr = `contrast(130%) saturate(180%) ${base}`; break;
    }
    
    ctx.filter = filterStr;
    
    if (filter === 'mirror-h') {
      const w = canvas.width;
      const h = canvas.height;
      ctx.drawImage(video, 0, 0, w/2, h, 0, 0, w/2, h);
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
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw stickers
    stickers.forEach(s => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); 
      ctx.translate((100 - s.x) * canvas.width / 100, s.y * canvas.height / 100);
      ctx.rotate(s.rotation * Math.PI / 180);
      const scaledSize = 120 * s.scale;
      ctx.font = `${scaledSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    });

    return canvas.toDataURL('image/png');
  }, [filter, brightness, contrast, exposure, beautyMode, stickers]);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      const dataUrl = drawPhotoToCanvas();
      if (!dataUrl) return;

      if (mode === 'single') {
        const session: PhotoSession = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          photos: [dataUrl],
          type: 'single',
          filter: filter
        };
        setGallery(prev => [session, ...prev]);
        setActiveSession(session);
        setBottomTab('gallery');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        const newProgress = [...stripProgress, dataUrl];
        if (newProgress.length >= 4) {
          const session: PhotoSession = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            photos: newProgress,
            type: 'strip',
            filter: filter,
            stripStyle: stripStyle
          };
          setGallery(prev => [session, ...prev]);
          setActiveSession(session);
          setStripProgress([]);
          setBottomTab('gallery');
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
        } else {
          setStripProgress(newProgress);
          setTimeout(handleCapture, 1500);
        }
      }
    }, 150);
  };

  const deleteSession = (id: string) => {
    setGallery(prev => prev.filter(s => s.id !== id));
    if (activeSession?.id === id) setActiveSession(null);
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: (Math.random() - 0.5) * 30
    };
    setStickers([...stickers, newSticker]);
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const updateSticker = (id: string, updates: Partial<Sticker>) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const downloadSession = (session: PhotoSession) => {
    if (session.type === 'single') {
      const link = document.createElement('a');
      link.href = session.photos[0];
      link.download = `photo-${session.id}.png`;
      link.click();
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const style = session.stripStyle || 'classic';
      
      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const p = style === 'film' ? 80 : 40;
        canvas.width = w + p * 2;
        canvas.height = (h * 4) + (p * 5) + (style === 'cute' ? 100 : 0);
        
        // Background colors
        switch (style) {
          case 'film': ctx.fillStyle = '#111111'; break;
          case 'cute': ctx.fillStyle = '#ffdeeb'; break;
          case 'sleek': ctx.fillStyle = '#1a1a1a'; break;
          case 'retro': ctx.fillStyle = '#f4ecd8'; break;
          default: ctx.fillStyle = '#ffffff'; 
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorate background
        if (style === 'film') {
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 20; i++) {
            ctx.fillRect(10, i * (canvas.height / 20) + 10, 20, 30);
            ctx.fillRect(canvas.width - 30, i * (canvas.height / 20) + 10, 20, 30);
          }
          ctx.font = 'bold 24px monospace';
          ctx.fillStyle = '#e67e22';
          ctx.fillText('KODAK 400', 40, canvas.height - 20);
        } else if (style === 'cute') {
          ctx.font = '40px Arial';
          ctx.fillText('✨', 20, 50);
          ctx.fillText('💖', canvas.width - 60, 50);
          ctx.fillText('🍓', 20, canvas.height - 40);
          ctx.fillText('🧸', canvas.width - 60, canvas.height - 40);
          ctx.fillStyle = '#ff69b4';
          ctx.font = 'italic bold 24px cursive';
          ctx.textAlign = 'center';
          ctx.fillText('Besties Forever', canvas.width / 2, canvas.height - 30);
        } else if (style === 'retro') {
           ctx.strokeStyle = '#8b4513';
           ctx.lineWidth = 2;
           ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        }
        
        ctx.textAlign = 'left'; // Reset
        
        session.photos.forEach((photo, i) => {
          const frameImg = new Image();
          frameImg.onload = () => {
            // Shadow for photos
            if (style === 'sleek' || style === 'classic') {
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 5;
              ctx.shadowOffsetY = 5;
            }
            
            ctx.drawImage(frameImg, p, p + i * (h + p), w, h);
            ctx.shadowBlur = 0; // Reset shadow
            
            if (i === 3) {
              const link = document.createElement('a');
              link.href = canvas.toDataURL('image/png');
              link.download = `strip-${session.id}.png`;
              link.click();
            }
          };
          frameImg.src = photo;
        });
      };
      img.src = session.photos[0];
    }
  };

  return (
    <div className="app-window flex h-[700px] w-[960px] flex-col rounded-xl bg-mac-window shadow-mac-window outline outline-1 outline-black/10 overflow-hidden">
      {/* Title Bar */}
      <header className="title-bar relative flex h-[38px] items-center bg-gradient-to-b from-mac-title-start to-mac-title-end border-b border-mac-border px-3">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57] border border-black/10" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-black/10" />
          <div className="h-3 w-3 rounded-full bg-[#28c940] border border-black/10" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[13px] font-semibold text-[#4d4d4d]">Photo Booth Pro</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content relative flex flex-1 flex-col items-center justify-center bg-mac-content overflow-hidden">
        {/* Camera Viewport */}
        <div className="relative h-[480px] w-[760px] overflow-hidden rounded-sm bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 h-1.5 w-1.5 rounded-full bg-[#00ff00] shadow-[0_0_5px_#00ff00]" />
          
          <CameraView 
            isCapturing={isCapturing}
            filter={filter}
            brightness={brightness}
            contrast={contrast}
            exposure={exposure}
            beautyMode={beautyMode}
            onCapture={() => {}}
            className="h-full w-full"
          />

          <StickerLayer 
            stickers={stickers}
            onRemoveSticker={removeSticker}
            onUpdateSticker={updateSticker}
            onAddSticker={addSticker}
            isEditing={countdown === null}
          />

          {/* Countdown Overlay */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20 z-[60]"
              >
                <span className="text-[8rem] font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Strip Progress Indicator */}
          {mode === 'strip' && stripProgress.length > 0 && (
            <div className="absolute right-4 top-4 flex flex-col space-y-2 z-10">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn("h-2 w-2 rounded-full", i < stripProgress.length ? "bg-white shadow-[0_0_8px_#fff]" : "bg-white/20")} />
              ))}
            </div>
          )}

          {/* Controls Overlay on Camera */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
             <div className="flex gap-2">
                <button 
                  onClick={() => setTimerDuration(timerDuration === 3 ? 5 : timerDuration === 5 ? 10 : 3)}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white backdrop-blur-md border border-white/20"
                >
                  Timer: {timerDuration}s
                </button>
             </div>

             <button 
              onClick={startCountdown}
              disabled={countdown !== null}
              className={cn(
                "h-16 w-16 rounded-full border-4 border-white bg-radial from-[#ff4b4b] to-[#cc0000] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 disabled:grayscale active:from-[#cc0000] active:to-[#ff4b4b]"
              )}
            />

             <div className="flex gap-2">
                <button 
                  onClick={() => { setMode(mode === 'single' ? 'strip' : 'single'); setStripProgress([]); }}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white backdrop-blur-md border border-white/20"
                >
                   {mode === 'single' ? 'Photo Strip' : 'Single Shot'}
                </button>
             </div>
          </div>
        </div>

        {/* Floating Side Panels */}
        <SideControlPanel 
          className="absolute right-6 top-6"
          brightness={brightness}
          onBrightnessChange={setBrightness}
          contrast={contrast}
          onContrastChange={setContrast}
          exposure={exposure}
          onExposureChange={setExposure}
          beautyMode={beautyMode}
          onBeautyModeChange={setBeautyMode}
          currentFrame={frame}
          onFrameChange={setFrame}
          stripStyle={stripStyle}
          onStripStyleChange={setStripStyle}
          onAddSticker={addSticker}
        />
      </div>

      {/* Bottom Tray */}
      <div className="flex-none bg-mac-window border-t border-mac-border shadow-mac-inner relative h-[140px]">
        {/* Tray Tabs */}
        <div className="flex absolute -top-8 left-6 gap-1">
          <button 
            onClick={() => setBottomTab('filters')}
            className={cn(
              "px-3 py-1 text-[11px] font-medium rounded-t-lg border-x border-t transition-all",
              bottomTab === 'filters' ? "bg-mac-window border-mac-border text-zinc-800" : "bg-zinc-800/10 border-transparent text-zinc-500 hover:text-zinc-700"
            )}
          >
            Filters
          </button>
          <button 
            onClick={() => setBottomTab('gallery')}
            className={cn(
              "px-3 py-1 text-[11px] font-medium rounded-t-lg border-x border-t transition-all",
              bottomTab === 'gallery' ? "bg-mac-window border-mac-border text-zinc-800" : "bg-zinc-800/10 border-transparent text-zinc-500 hover:text-zinc-700"
            )}
          >
            Gallery ({gallery.length})
          </button>
        </div>

        {bottomTab === 'filters' ? (
          <FilterTray currentFilter={filter} onFilterChange={setFilter} className="h-full" />
        ) : (
          <div className="flex h-full items-center p-4 space-x-4 overflow-x-auto scrollbar-none">
            {gallery.length === 0 && <div className="text-[11px] text-zinc-400 uppercase w-full text-center">No shots yet</div>}
            {gallery.map(session => (
              <motion.div 
                layoutId={session.id}
                key={session.id}
                onClick={() => setActiveSession(session)}
                className="relative aspect-video h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-black border-2 border-transparent hover:border-mac-accent transition-all"
              >
                <img src={session.photos[0]} className="h-full w-full object-cover" alt="Capture" />
                {session.type === 'strip' && <div className="absolute right-1 top-1 text-[8px] bg-mac-accent text-white px-1 rounded-sm">Strip</div>}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {activeSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8 backdrop-blur-xl">
            <button onClick={() => setActiveSession(null)} className="absolute right-8 top-8 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"><X className="h-6 w-6" /></button>
            <div className="flex flex-col items-center gap-6 max-h-[90vh]">
              <div className="overflow-hidden rounded-xl bg-white shadow-2xl p-2 max-w-full">
                {activeSession.type === 'single' ? (
                  <img src={activeSession.photos[0]} className="max-h-[60vh] w-auto rounded-lg" alt="Capture" />
                ) : (
                  <div 
                    className={cn(
                      "flex gap-4 p-4 max-h-[70vh] overflow-y-auto w-auto rounded-lg transition-colors",
                      activeSession.stripStyle === 'film' ? "bg-zinc-900" : 
                      activeSession.stripStyle === 'cute' ? "bg-[#ffdeeb]" :
                      activeSession.stripStyle === 'sleek' ? "bg-zinc-800" :
                      activeSession.stripStyle === 'retro' ? "bg-[#f4ecd8]" :
                      "bg-white"
                    )}
                  >
                    {activeSession.photos.map((p, i) => (
                      <img 
                        key={i} 
                        src={p} 
                        className={cn(
                          "h-[400px] w-auto rounded-md shadow-lg",
                          activeSession.stripStyle === 'film' && "border-x-[20px] border-zinc-900"
                        )} 
                        alt="Shot" 
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => downloadSession(activeSession)} className="flex items-center gap-2 rounded-full bg-mac-accent px-8 py-3 font-semibold text-white hover:bg-blue-600 transition-all"><Download className="h-5 w-5" />Download</button>
                <button onClick={() => deleteSession(activeSession.id)} className="flex items-center gap-2 rounded-full bg-white/10 px-8 py-3 font-semibold text-white hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" />Delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
