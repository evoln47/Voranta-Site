import type { ReactNode } from 'react';

export interface ResearchCalloutProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function ResearchCallout({ label, children, className = '' }: ResearchCalloutProps) {
  return (
    <div className={['callout-research', className].filter(Boolean).join(' ')}>
      {label && <strong>{label}</strong>}
      {children}
    </div>
  );
}
