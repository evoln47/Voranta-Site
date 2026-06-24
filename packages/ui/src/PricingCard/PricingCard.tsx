import type { ReactNode } from 'react';

export interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  featured?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function PricingCard({
  title,
  price,
  period,
  features,
  featured = false,
  footer,
  className = '',
}: PricingCardProps) {
  const cls = ['pricing-card', featured ? 'is-featured' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <h3>{title}</h3>
      <div>
        <span className="price-value">{price}</span>
        {period && <span className="price-period">{period}</span>}
      </div>
      <ul>
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {footer}
    </div>
  );
}
