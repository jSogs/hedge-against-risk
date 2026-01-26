import {Easing, interpolate} from 'remotion';

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const easeOutCubic = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);

export const fadeIn = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

export const fadeOut = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  });

export const slideY = (
  frame: number,
  start: number,
  duration: number,
  fromY: number,
  toY = 0,
) =>
  interpolate(frame, [start, start + duration], [fromY, toY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });




