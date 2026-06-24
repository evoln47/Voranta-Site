import type { ReactNode } from 'react';
import { Eyebrow } from '../Eyebrow';

export interface SectionHeadProps {
  eyebrow?: string;
  heading: ReactNode;
  subhead?: ReactNode;
  className?: string;
}

export function SectionHead({ eyebrow, heading, subhead, className = '' }: SectionHeadProps) {
  return (
    <div className={['section-head', className].filter(Boolean).join(' ')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{heading}</h2>
      <div className="rule" />
      {subhead && <p className="subhead">{subhead}</p>}
    </div>
  );
}
