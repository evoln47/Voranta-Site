import type { ReactNode } from 'react';

export type CardSize = 'md' | 'lg';

const SIZE_CLASS: Record<CardSize, string> = {
  md: 'card',
  lg: 'card card-lg',
};

export interface CardProps {
  size?: CardSize;
  children: ReactNode;
  className?: string;
}

export function Card({ size = 'md', children, className = '' }: CardProps) {
  return <div className={[SIZE_CLASS[size], className].filter(Boolean).join(' ')}>{children}</div>;
}
