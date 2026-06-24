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

interface ButtonOwnProps<T extends ElementType> {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

export type ButtonProps<T extends ElementType = 'button'> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

export function Button<T extends ElementType = 'button'>({
  variant = 'solid',
  size = 'md',
  as,
  children,
  className = '',
  ...rest
}: ButtonProps<T>) {
  const Tag = (as ?? 'button') as ElementType;
  const cls = [VARIANT_CLASS[variant], SIZE_CLASS[size], className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
