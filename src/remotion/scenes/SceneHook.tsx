import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {fadeIn, slideY} from '../utils/anim';

export const SceneHook: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);

  const o = fadeIn(frame, 0, 18);
  const y = slideY(frame, 0, 22, 26, 0);

  return (
    <div style={{maxWidth: dims.maxWidth, transform: `translateY(${y}px)`, opacity: o}}>
      <div
        style={{
          fontFamily,
          fontSize: dims.h1,
          fontWeight: 700,
          lineHeight: 1.05,
          color: theme.text,
          letterSpacing: -0.6,
        }}
      >
        Real-world uncertainty hits your bottom line.
      </div>
      <div style={{height: 18}} />
      <div
        style={{
          fontSize: dims.body,
          color: theme.muted,
          lineHeight: 1.35,
          maxWidth: format === 'portrait' ? 900 : 980,
        }}
      >
        Probable turns exposure into clear scenarios—and a practical hedge when it makes sense.
      </div>
    </div>
  );
};




