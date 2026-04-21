export type FilterType = 
  | 'none' 
  | 'grayscale' 
  | 'sepia' 
  | 'vintage' 
  | 'cool' 
  | 'warm' 
  | 'high-contrast' 
  | 'film'
  | 'cartoon'
  | 'invert'
  | 'mirror-h'
  | 'mirror-v';

export type FrameType = 'none' | 'glossy' | 'polaroid' | 'classic' | 'strip';

export type StripStyle = 'classic' | 'film' | 'cute' | 'sleek' | 'retro';

export interface PhotoSession {
  id: string;
  timestamp: number;
  photos: string[]; // base64 images
  type: 'single' | 'strip';
  filter: FilterType;
  stripStyle?: StripStyle;
}

export interface CameraSettings {
  filter: FilterType;
  countdown: number;
  mode: 'single' | 'strip';
  frame: FrameType;
  stripStyle: StripStyle;
  brightness: number;
  contrast: number;
  exposure: number;
  beautyMode: boolean;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
