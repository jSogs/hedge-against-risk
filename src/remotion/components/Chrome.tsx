import React from 'react';
import {theme, fontFamily} from '../theme';

export const BrandBug: React.FC<{label?: string}> = ({label = 'Probable'}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        color: theme.subtle,
        fontFamily,
        fontSize: 22,
        letterSpacing: 0.2,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: theme.accent,
          boxShadow: '0 0 0 4px rgba(28,138,163,0.10)',
        }}
      />
      <div style={{opacity: 0.95}}>{label}</div>
    </div>
  );
};

export const LogoLockup: React.FC<{
  src: string;
  height?: number;
  sublabel?: string;
}> = ({src, height = 26, sublabel}) => {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <img
        src={src}
        alt="Probable"
        style={{
          height,
          width: 'auto',
          display: 'block',
          filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.45))',
        }}
      />
      {sublabel ? (
        <div style={{color: theme.subtle, fontFamily, fontSize: 20, letterSpacing: 0.2}}>
          {sublabel}
        </div>
      ) : null}
    </div>
  );
};

export const CornerLabel: React.FC<{text: string}> = ({text}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 56,
        top: 44,
        padding: '10px 14px',
        borderRadius: 999,
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        color: theme.muted,
        fontFamily,
        fontSize: 20,
      }}
    >
      {text}
    </div>
  );
};

export const AppWindow: React.FC<{
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}> = ({children, title = 'Probable', style}) => {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        background: theme.bg1,
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Window Title Bar */}
      <div
        style={{
          height: 40,
          background: 'rgba(255,255,255,0.03)',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
        }}
      >
        <div style={{display: 'flex', gap: 6}}>
          <div style={{width: 10, height: 10, borderRadius: 999, background: '#FF5F56'}} />
          <div style={{width: 10, height: 10, borderRadius: 999, background: '#FFBD2E'}} />
          <div style={{width: 10, height: 10, borderRadius: 999, background: '#27C93F'}} />
        </div>
        {title && (
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              color: theme.subtle,
              fontSize: 12,
              fontFamily,
              opacity: 0.7,
            }}
          >
            {title}
          </div>
        )}
        <div style={{width: 40}} /> {/* Spacer to balance traffic lights */}
      </div>

      {/* Content */}
      <div style={{position: 'relative', background: theme.panel}}>
        {children}
      </div>
    </div>
  );
};

export const Panel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => {
  return (
    <div
      style={{
        borderRadius: 28,
        border: `1px solid ${theme.border}`,
        background: theme.panel,
        boxShadow:
          '0 40px 120px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Pill: React.FC<{
  text: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
}> = ({text, tone = 'neutral'}) => {
  const palette =
    tone === 'accent'
      ? {bg: 'rgba(28,138,163,0.16)', fg: 'rgba(186,240,252,0.90)', br: 'rgba(28,138,163,0.28)'}
      : tone === 'success'
        ? {bg: 'rgba(34,197,94,0.14)', fg: 'rgba(210,255,226,0.92)', br: 'rgba(34,197,94,0.24)'}
        : tone === 'warning'
          ? {bg: 'rgba(245,158,11,0.14)', fg: 'rgba(255,244,219,0.92)', br: 'rgba(245,158,11,0.22)'}
          : {bg: 'rgba(255,255,255,0.08)', fg: theme.muted, br: theme.border};

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 12px',
        borderRadius: 999,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.br}`,
        fontFamily,
        fontSize: 18,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};


