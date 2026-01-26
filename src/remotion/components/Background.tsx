import React from 'react';
import {AbsoluteFill} from 'remotion';
import {theme} from '../theme';

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 800px at 20% 15%, rgba(28, 138, 163, 0.22), transparent 55%),
                     radial-gradient(1000px 700px at 85% 25%, rgba(96, 165, 250, 0.16), transparent 60%),
                     radial-gradient(900px 650px at 30% 85%, rgba(34, 197, 94, 0.10), transparent 60%),
                     linear-gradient(180deg, ${theme.bg0}, ${theme.bg1})`,
      }}
    />
  );
};




