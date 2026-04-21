import React from 'react';
import { cn } from '@/src/lib/utils';
import { FilterType } from '@/src/types';

interface FilterTrayProps {
  currentFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  className?: string;
}

const filters: { id: FilterType; label: string; color: string }[] = [
  { id: 'none', label: 'Normal', color: 'bg-zinc-700' },
  { id: 'grayscale', label: 'B&W', color: 'bg-zinc-500' },
  { id: 'sepia', label: 'Vintage', color: 'bg-amber-900' },
  { id: 'vintage', label: 'Retro', color: 'bg-orange-800' },
  { id: 'cool', label: 'Cool', color: 'bg-blue-900' },
  { id: 'warm', label: 'Warm', color: 'bg-red-900' },
  { id: 'high-contrast', label: 'Lush', color: 'bg-emerald-900' },
  { id: 'film', label: 'Noir', color: 'bg-zinc-900' },
  { id: 'cartoon', label: 'Pop', color: 'bg-purple-800' },
  { id: 'invert', label: 'X-Ray', color: 'bg-white' },
];

export const FilterTray: React.FC<FilterTrayProps> = ({
  currentFilter,
  onFilterChange,
  className
}) => {
  return (
    <div className={cn("flex h-32 items-center space-x-4 overflow-x-auto px-6 py-4 scrollbar-none bg-mac-window border-t border-mac-border", className)}>
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={cn(
            "flex h-20 w-20 flex-shrink-0 flex-col items-center justify-end rounded-lg p-2 transition-all border-2",
            currentFilter === f.id ? "border-mac-accent ring-2 ring-mac-accent/20" : "border-transparent hover:border-mac-border"
          )}
          style={{ background: f.color }}
        >
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wide drop-shadow-md",
            f.id === 'invert' ? "text-black" : "text-white"
          )}>
            {f.label}
          </span>
        </button>
      ))}
    </div>
  );
};
