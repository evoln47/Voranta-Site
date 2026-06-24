import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'ghost';
export type ButtonSize = 'md' | 'lg';

// Static class strings only — never interpolated, so Tailwind's scanner is irrelevant.
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  solid: 'btn',
  ghost: 'btn btn-ghost',
};
const SIZE_CLASS: Record<ButtonSize, string> = {
  md: '',
  lg: 'btn-lg',
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'solid',
  size = 'md',
  as,
  children,
  className = '',
  ...rest
}: ButtonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonProps>) {
  const Tag = as ?? 'button';
  const cls = [VARIANT_CLASS[variant], SIZE_CLASS[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
