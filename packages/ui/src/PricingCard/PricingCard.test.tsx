import { render, screen } from '@testing-library/react';
import { PricingCard } from './PricingCard';

test('renders price, period, and features', () => {
  const { container } = render(
    <PricingCard title="Sponsor" price="$5k" period="/yr" features={['A', 'B']} />,
  );
  expect(container.firstChild).toHaveClass('pricing-card');
  expect(screen.getByText('$5k')).toHaveClass('price-value');
  expect(screen.getByText('/yr')).toHaveClass('price-period');
  expect(screen.getByText('A')).toBeInTheDocument();
});

test('featured adds is-featured', () => {
  const { container } = render(<PricingCard title="x" price="$1" features={[]} featured />);
  expect(container.firstChild).toHaveClass('pricing-card', 'is-featured');
});
