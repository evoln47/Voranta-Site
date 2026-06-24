import { render, screen } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';

test('renders title and body inside feature-card', () => {
  const { container } = render(<FeatureCard title="Rigor" body="Peer-reviewed method." />);
  expect(container.firstChild).toHaveClass('feature-card');
  expect(screen.getByText('Rigor')).toBeInTheDocument();
  expect(screen.getByText('Peer-reviewed method.')).toBeInTheDocument();
});
