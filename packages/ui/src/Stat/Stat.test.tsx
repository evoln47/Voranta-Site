import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';

test('renders value and label', () => {
  render(<Stat value="92%" label="of buyers" />);
  expect(screen.getByText('92%')).toHaveClass('stat-value');
  expect(screen.getByText('of buyers')).toHaveClass('stat-label');
});

test('accent adds stat-value-accent', () => {
  render(<Stat value="3x" label="lift" accent />);
  expect(screen.getByText('3x')).toHaveClass('stat-value', 'stat-value-accent');
});
