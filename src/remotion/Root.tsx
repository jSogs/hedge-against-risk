import React from 'react';
import {Composition} from 'remotion';
import {ProbableLaunchVideo} from './compositions/ProbableLaunchVideo';

export const FPS = 30;
export const DURATION_IN_FRAMES = 45 * FPS;

export type VideoFormat = 'landscape' | 'portrait';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="probable-launch-16x9"
        component={ProbableLaunchVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{format: 'landscape' as VideoFormat}}
      />
      <Composition
        id="probable-launch-9x16"
        component={ProbableLaunchVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{format: 'portrait' as VideoFormat}}
      />
    </>
  );
};




