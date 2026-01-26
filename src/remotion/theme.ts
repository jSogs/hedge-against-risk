import type {VideoFormat} from './Root';

export const theme = {
  bg0: '#070A0F',
  bg1: '#0B1220',
  panel: 'rgba(255,255,255,0.06)',
  panel2: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.10)',
  text: 'rgba(255,255,255,0.92)',
  muted: 'rgba(255,255,255,0.70)',
  subtle: 'rgba(255,255,255,0.52)',
  accent: '#1C8AA3', // matches app primary (teal) vibe without "crypto neon"
  accent2: '#60A5FA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const fontFamily =
  "Space Grotesk, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans', sans-serif";

export const dimsFor = (format: VideoFormat) => {
  if (format === 'portrait') {
    return {
      pad: 70,
      h1: 72,
      h2: 44,
      body: 30,
      small: 24,
      corner: 26,
      maxWidth: 940,
    };
  }

  return {
    pad: 96,
    h1: 80,
    h2: 48,
    body: 30,
    small: 24,
    corner: 28,
    maxWidth: 1200,
  };
};




