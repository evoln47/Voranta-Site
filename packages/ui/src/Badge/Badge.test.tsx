import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

test('default badge class', () => {
  render(<Badge>New</Badge>);
  expect(screen.getByText('New')).toHaveClass('badge');
});

test('ink variant adds badge-ink', () => {
  render(<Badge variant="ink">New</Badge>);
  expect(screen.getByText('New')).toHaveClass('badge', 'badge-ink');
});
