import type { ReactNode } from 'react';

export interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  body: ReactNode;
  className?: string;
}

export function FeatureCard({ icon, title, body, className = '' }: FeatureCardProps) {
  return (
    <div className={['feature-card', className].filter(Boolean).join(' ')}>
      {icon && <div className="icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
