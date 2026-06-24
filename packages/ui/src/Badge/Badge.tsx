import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'ink';

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'badge',
  ink: 'badge badge-ink',
};

export interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', dot = false, children, className = '' }: BadgeProps) {
  const cls = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
