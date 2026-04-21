import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface StickerLayerProps {
  onAddSticker: (emoji: string) => void;
  stickers: Sticker[];
  onRemoveSticker: (id: string) => void;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
  isEditing: boolean;
}

export const stickers_list = ['❤️', '✨', '🔥', '😎', '👑', '🎉', '🌈', '🐶', '🍕', '📸'];

export const StickerLayer: React.FC<StickerLayerProps> = ({
  stickers,
  onRemoveSticker,
  onUpdateSticker,
  isEditing
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stickers.map((s) => (
        <motion.div
          key={s.id}
          drag={isEditing}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            // This is approximate since we're in a relative container
          }}
          initial={{ scale: 0 }}
          animate={{ scale: s.scale, rotate: s.rotation }}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: '4rem' }}
          className={cn(
            "absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center select-none",
            isEditing ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          {s.emoji}
          {isEditing && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemoveSticker(s.id); }}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};
