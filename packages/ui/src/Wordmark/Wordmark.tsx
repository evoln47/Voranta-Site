import type { ComponentPropsWithoutRef, ElementType } from 'react';

interface WordmarkOwnProps<T extends ElementType> {
  as?: T;
  className?: string;
}

export type WordmarkProps<T extends ElementType = 'span'> = WordmarkOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof WordmarkOwnProps<T>>;

export function Wordmark<T extends ElementType = 'span'>({
  as,
  className = '',
  ...rest
}: WordmarkProps<T>) {
  const Tag = (as ?? 'span') as ElementType;
  return (
    <Tag className={['wordmark', className].filter(Boolean).join(' ')} {...rest}>
      Voranta
    </Tag>
  );
}
