import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {AppWindow, Pill} from '../components/Chrome';
import {fadeIn, slideY} from '../utils/anim';

const Row: React.FC<{label: string; value: string; delay: number}> = ({
  label,
  value,
  delay,
}) => {
  const frame = useCurrentFrame();
  const o = fadeIn(frame, delay, 14);
  const y = slideY(frame, delay, 18, 16, 0);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '18px 22px',
        borderTop: `1px solid ${theme.border}`,
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{color: theme.subtle, fontSize: 20}}>{label}</div>
      <div style={{color: theme.text, fontSize: 22, fontWeight: 600}}>{value}</div>
    </div>
  );
};

export const SceneContextExposure: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);

  // Still keep internal staggering for elements inside the scene
  const titleO = fadeIn(frame, 0, 16);
  const titleY = slideY(frame, 0, 18, 18, 0);

  const cardO = fadeIn(frame, 8, 18);
  const cardY = slideY(frame, 8, 22, 26, 0);

  return (
    <div style={{display: 'flex', gap: 28, alignItems: 'flex-start', height: '100%', flexDirection: format === 'portrait' ? 'column' : 'row'}}>
      <div style={{flex: 1, maxWidth: dims.maxWidth}}>
        <div style={{opacity: titleO, transform: `translateY(${titleY}px)`}}>
          <div
            style={{
              fontFamily,
              fontSize: dims.h2,
              fontWeight: 700,
              color: theme.text,
              letterSpacing: -0.4,
            }}
          >
            Start with your context.
          </div>
          <div style={{height: 10}} />
          <div style={{fontSize: dims.body, color: theme.muted, lineHeight: 1.4}}>
            Tell Probable what drives your revenue—and what uncertainty could swing it.
          </div>
          <div style={{height: 16}} />
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            <Pill text="Bar / hospitality" tone="accent" />
            <Pill text="Event-driven demand" />
            <Pill text="Local audience" />
          </div>
        </div>
      </div>

      <div style={{flex: format === 'portrait' ? 0 : 1.2}}>
        <AppWindow
          title="Setup Exposure"
          style={{
            width: format === 'portrait' ? 940 : '100%',
            transform: `translateY(${cardY}px)`,
            opacity: cardO,
          }}
        >
          <div style={{padding: '22px 22px 16px 22px'}}>
            <div style={{color: theme.subtle, fontSize: 18, letterSpacing: 0.3}}>
              Exposure setup
            </div>
            <div style={{height: 8}} />
            <div style={{color: theme.text, fontSize: 26, fontWeight: 700}}>
              Game-night demand hedge
            </div>
          </div>

          <Row label="Business" value="Neighborhood bar" delay={16} />
          <Row label="Location" value="San Francisco, CA" delay={22} />
          <Row label="Exposure" value="Big-game demand" delay={28} />
          <Row label="Sensitivity" value="+$4k weekend swing" delay={34} />
        </AppWindow>
      </div>
    </div>
  );
};


