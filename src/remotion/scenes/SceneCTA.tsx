import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {Panel, Pill} from '../components/Chrome';
import {fadeIn, slideY} from '../utils/anim';

export const SceneCTA: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);
  const logo = staticFile('probable-logo.png');

  const o1 = fadeIn(frame, 0, 18);
  const y1 = slideY(frame, 0, 20, 22, 0);

  const o2 = fadeIn(frame, 12, 18);
  const y2 = slideY(frame, 12, 20, 18, 0);

  const o3 = fadeIn(frame, 24, 18);
  const y3 = slideY(frame, 24, 20, 14, 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{opacity: o1, transform: `translateY(${y1}px)`}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 10,
          }}
        >
          <img
            src={logo}
            alt="Probable"
            style={{
              height: format === 'portrait' ? 42 : 36,
              width: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 18px 60px rgba(0,0,0,0.55))',
            }}
          />
          <Pill text="Run your exposure" tone="accent" />
        </div>

        <div
          style={{
            fontFamily,
            fontSize: format === 'portrait' ? 78 : 76,
            fontWeight: 800,
            lineHeight: 1.04,
            color: theme.text,
            letterSpacing: -0.8,
            maxWidth: dims.maxWidth,
          }}
        >
          Turn uncertainty into clear, scenario-based protection.
        </div>
      </div>

      <div style={{opacity: o2, transform: `translateY(${y2}px)`}}>
        <Panel style={{padding: 20}}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: format === 'portrait' ? '1fr' : '1.2fr 0.8fr',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{color: theme.subtle, fontSize: 18, letterSpacing: 0.3}}>Get started</div>
              <div style={{color: theme.text, fontSize: 28, fontWeight: 800}}>
                Run your exposure in minutes.
              </div>
              <div style={{color: theme.muted, fontSize: 20, lineHeight: 1.4}}>
                Enter your context → see matched events → compare outcomes → hedge only when it’s worth it.
              </div>
            </div>
            <div
              style={{
                justifySelf: format === 'portrait' ? 'start' : 'end',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: format === 'portrait' ? 'flex-start' : 'flex-end',
              }}
            >
              <Pill text="probable.live" tone="neutral" />
              <Pill text="Bars • SMBs • Individuals" tone="neutral" />
            </div>
          </div>
        </Panel>
      </div>

      <div style={{opacity: o3, transform: `translateY(${y3}px)`}}>
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
          <Pill text="No hype" tone="neutral" />
          <Pill text="Plain-English guidance" tone="neutral" />
          <Pill text="Know when not to hedge" tone="warning" />
        </div>
      </div>
    </div>
  );
};


