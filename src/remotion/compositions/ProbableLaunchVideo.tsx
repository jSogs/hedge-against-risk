import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {Background} from '../components/Background';
import {LogoLockup} from '../components/Chrome';
import {fadeIn, fadeOut} from '../utils/anim';
import {SceneHook} from '../scenes/SceneHook';
import {SceneContextExposure} from '../scenes/SceneContextExposure';
import {SceneMarketMatch} from '../scenes/SceneMarketMatch';
import {SceneStrategy} from '../scenes/SceneStrategy';
import {SceneCTA} from '../scenes/SceneCTA';

export const ProbableLaunchVideo: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);

  // subtle global fade-in/out
  const intro = fadeIn(frame, 0, 18);
  const outro = fadeOut(frame, 45 * 30 - 24, 24);
  const globalOpacity = Math.min(intro, outro);

  const TRANSITION_DURATION = 15;

  return (
    <AbsoluteFill style={{fontFamily, opacity: globalOpacity}}>
      <Background />

      <AbsoluteFill style={{padding: dims.pad, zIndex: 100, pointerEvents: 'none'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <LogoLockup src={staticFile('probable-logo.png')} height={format === 'portrait' ? 30 : 28} />
          <div
            style={{
              color: theme.subtle,
              fontSize: dims.corner,
              letterSpacing: 0.2,
            }}
          >
            Run your exposure
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{padding: dims.pad, paddingTop: dims.pad + 60}}>
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={3 * 30}>
            <SceneHook format={format} />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({direction: 'from-bottom'})}
            timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
          />

          <TransitionSeries.Sequence durationInFrames={10 * 30}>
            <SceneContextExposure format={format} />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({direction: 'from-right'})}
            timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
          />

          <TransitionSeries.Sequence durationInFrames={10 * 30}>
            <SceneMarketMatch format={format} />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({direction: 'from-right'})}
            timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
          />

          <TransitionSeries.Sequence durationInFrames={12 * 30}>
            <SceneStrategy format={format} />
          </TransitionSeries.Sequence>

          <TransitionSeries.Transition
            presentation={slide({direction: 'from-bottom'})}
            timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
          />

          <TransitionSeries.Sequence durationInFrames={12 * 30}>
            <SceneCTA format={format} />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


