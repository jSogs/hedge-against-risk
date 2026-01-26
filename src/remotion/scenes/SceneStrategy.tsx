import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {VideoFormat} from '../Root';
import {dimsFor, fontFamily, theme} from '../theme';
import {Panel, Pill} from '../components/Chrome';
import {fadeIn, slideY} from '../utils/anim';

const ScenarioCard: React.FC<{
  title: string;
  subtitle: string;
  rows: Array<{label: string; value: string; tone?: 'neutral' | 'success' | 'warning'}>;
  delay: number;
}> = ({title, subtitle, rows, delay}) => {
  const frame = useCurrentFrame();
  const o = fadeIn(frame, delay, 16);
  const y = slideY(frame, delay, 20, 18, 0);
  return (
    <Panel style={{padding: 22, opacity: o, transform: `translateY(${y}px)`, height: '100%'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div>
          <div style={{color: theme.text, fontSize: 24, fontWeight: 750}}>{title}</div>
          <div style={{height: 6}} />
          <div style={{color: theme.muted, fontSize: 18}}>{subtitle}</div>
        </div>
      </div>

      <div style={{height: 16}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {rows.map((r) => {
          const tone = r.tone ?? 'neutral';
          const pillTone: 'neutral' | 'success' | 'warning' =
            tone === 'success' ? 'success' : tone === 'warning' ? 'warning' : 'neutral';
          return (
            <div
              key={r.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{color: theme.subtle, fontSize: 18}}>{r.label}</div>
              <Pill text={r.value} tone={pillTone} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

export const SceneStrategy: React.FC<{format: VideoFormat}> = ({format}) => {
  const frame = useCurrentFrame();
  const dims = dimsFor(format);

  const titleO = fadeIn(frame, 0, 16);
  const titleY = slideY(frame, 0, 18, 18, 0);

  const recO = fadeIn(frame, 18, 16);
  const recY = slideY(frame, 18, 18, 16, 0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 22, height: '100%'}}>
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
          Compare outcomes—then decide.
        </div>
        <div style={{height: 10}} />
        <div style={{fontSize: dims.body, color: theme.muted, lineHeight: 1.4, maxWidth: dims.maxWidth}}>
          Probable shows your exposure side-by-side, including when a hedge doesn’t make sense.
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: format === 'portrait' ? '1fr' : '1fr 1fr', gap: 18, flex: 1}}>
        <ScenarioCard
          title="If the Finals happen"
          subtitle="Higher demand weekend"
          rows={[
            {label: 'Expected incremental revenue', value: '+$4,000', tone: 'success'},
            {label: 'Hedge payout (if you hedge)', value: '+$2,600', tone: 'success'},
            {label: 'Net outcome (protected)', value: '+$6,600', tone: 'success'},
          ]}
          delay={10}
        />

        <ScenarioCard
          title="If the Finals don’t happen"
          subtitle="Normal weekend"
          rows={[
            {label: 'Incremental revenue', value: '+$0', tone: 'neutral'},
            {label: 'Hedge cost', value: '-$400', tone: 'warning'},
            {label: 'Net outcome', value: '-$400', tone: 'warning'},
          ]}
          delay={14}
        />
      </div>

      <div style={{opacity: recO, transform: `translateY(${recY}px)`}}>
        <Panel style={{padding: 18, background: 'linear-gradient(90deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))', border: `1px solid ${theme.success}`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              <div style={{color: theme.success, fontSize: 18, letterSpacing: 0.3, fontWeight: 700}}>RECOMMENDATION</div>
              <div style={{color: theme.text, fontSize: 24, fontWeight: 800}}>
                Hedge when the downside is real.
              </div>
              <div style={{color: theme.muted, fontSize: 18}}>
                If your exposure is small, Probable will tell you to skip it.
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end'}}>
              <Pill text="Hedge: Yes (this case)" tone="success" />
              <Pill text="Hedge: No (low exposure)" tone="neutral" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};


