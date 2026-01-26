import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {AppWindow, Pill} from '../components/Chrome';
import {fadeIn, slideY} from '../utils/anim';

const MarketRow: React.FC<{
  title: string;
  subtitle: string;
  chip: {text: string; tone: 'neutral' | 'accent' | 'success' | 'warning'};
  delay: number;
}> = ({title, subtitle, chip, delay}) => {
  const frame = useCurrentFrame();
  const o = fadeIn(frame, delay, 14);
  const y = slideY(frame, delay, 18, 14, 0);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 18,
        padding: '18px 22px',
        borderTop: `1px solid ${theme.border}`,
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <div style={{color: theme.text, fontSize: 22, fontWeight: 650}}>{title}</div>
        <div style={{color: theme.muted, fontSize: 18}}>{subtitle}</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Pill text={chip.text} tone={chip.tone} />
      </div>
    </div>
  );
};

export const SceneMarketMatch: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);

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
            Find the events that matter.
          </div>
          <div style={{height: 10}} />
          <div style={{fontSize: dims.body, color: theme.muted, lineHeight: 1.4}}>
            Probable matches your exposure to relevant prediction markets—and explains the impact in
            plain language.
          </div>
          <div style={{height: 16}} />
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
            <Pill text="Relevant markets" tone="accent" />
            <Pill text="Plain-English impact" />
            <Pill text="No crypto vibes" />
          </div>
        </div>
      </div>

      <div style={{flex: format === 'portrait' ? 0 : 1.3}}>
        <AppWindow
          title="Market Match"
          style={{
            width: format === 'portrait' ? 940 : '100%',
            transform: `translateY(${cardY}px)`,
            opacity: cardO,
          }}
        >
          <div style={{padding: '22px 22px 16px 22px'}}>
            <div style={{color: theme.subtle, fontSize: 18, letterSpacing: 0.3}}>
              Relevant events
            </div>
            <div style={{height: 8}} />
            <div style={{color: theme.text, fontSize: 26, fontWeight: 700}}>
              Game-night demand drivers
            </div>
          </div>

          <MarketRow
            title="Warriors make the Finals"
            subtitle="Likely higher watch-party traffic"
            chip={{text: 'Increases demand', tone: 'success'}}
            delay={16}
          />
          <MarketRow
            title="Warriors win Game 7"
            subtitle="Peak traffic next-day + weekend"
            chip={{text: 'Increases demand', tone: 'success'}}
            delay={22}
          />
          <MarketRow
            title="Rainy weekend (SF)"
            subtitle="Changes foot traffic patterns"
            chip={{text: 'Uncertain impact', tone: 'warning'}}
            delay={28}
          />
          <MarketRow
            title="Transit disruption"
            subtitle="May reduce late-night flow"
            chip={{text: 'Decreases demand', tone: 'accent'}}
            delay={34}
          />
        </AppWindow>
      </div>
    </div>
  );
};


