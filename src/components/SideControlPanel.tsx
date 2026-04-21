import React from 'react';
import { Sparkles, Smile, Frame, Film } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { stickers_list } from './StickerLayer';
import { FrameType, StripStyle } from '@/src/types';

interface SideControlPanelProps {
  brightness: number;
  onBrightnessChange: (v: number) => void;
  contrast: number;
  onContrastChange: (v: number) => void;
  exposure: number;
  onExposureChange: (v: number) => void;
  beautyMode: boolean;
  onBeautyModeChange: (v: boolean) => void;
  currentFrame: FrameType;
  onFrameChange: (f: FrameType) => void;
  stripStyle: StripStyle;
  onStripStyleChange: (s: StripStyle) => void;
  onAddSticker: (emoji: string) => void;
  className?: string;
}

const frames: { id: FrameType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'glossy', label: 'Glossy' },
  { id: 'polaroid', label: 'Polax' },
  { id: 'classic', label: 'Classic' },
];

const stripStyles: { id: StripStyle; label: string }[] = [
  { id: 'classic', label: 'White' },
  { id: 'film', label: 'Film' },
  { id: 'cute', label: 'Cute' },
  { id: 'sleek', label: 'Dark' },
  { id: 'retro', label: 'Retro' },
];

export const SideControlPanel: React.FC<SideControlPanelProps> = ({
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  exposure,
  onExposureChange,
  beautyMode,
  onBeautyModeChange,
  currentFrame,
  onFrameChange,
  stripStyle,
  onStripStyleChange,
  onAddSticker,
  className
}) => {
  return (
    <div className={cn("flex flex-col gap-4 w-44 z-10", className)}>
      <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md shadow-lg">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Adjustments
        </h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-white/80">
              <span>Exp</span>
              <span>{exposure}%</span>
            </div>
            <input 
              type="range" min="50" max="150" value={exposure}
              onChange={(e) => onExposureChange(parseInt(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-white"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-white/80">
              <span>Soft</span>
              <button 
                onClick={() => onBeautyModeChange(!beautyMode)}
                className={cn(
                  "h-3 w-6 rounded-full transition-all relative",
                  beautyMode ? "bg-white" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-[2px] h-2 w-2 rounded-full bg-zinc-900 transition-all",
                  beautyMode ? "right-[2px]" : "left-[2px]"
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md shadow-lg">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
          <Frame className="h-3 w-3" />
          Frames
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {frames.map((f) => (
            <button
              key={f.id}
              onClick={() => onFrameChange(f.id)}
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-1.5 text-[9px] font-medium transition-all border",
                currentFrame === f.id ? "bg-white text-zinc-900 border-white" : "bg-white/10 text-white border-white/10 hover:bg-white/20"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md shadow-lg">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
          <Film className="h-3 w-3" />
          Strip Style
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {stripStyles.map((s) => (
            <button
              key={s.id}
              onClick={() => onStripStyleChange(s.id)}
              className={cn(
                "flex items-center justify-center rounded-lg px-2 py-1.5 text-[9px] font-medium transition-all border",
                stripStyle === s.id ? "bg-white text-zinc-900 border-white" : "bg-white/10 text-white border-white/10 hover:bg-white/20"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-md shadow-lg">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
          <Smile className="h-3 w-3" />
          Stickers
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {stickers_list.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onAddSticker(emoji)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-lg transition-all hover:scale-110 hover:bg-white/20 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
