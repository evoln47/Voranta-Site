import { render } from '@testing-library/react';
import { Card } from './Card';

test('md card has card class', () => {
  const { container } = render(<Card>x</Card>);
  expect(container.firstChild).toHaveClass('card');
});

test('lg card adds card-lg', () => {
  const { container } = render(<Card size="lg">x</Card>);
  expect(container.firstChild).toHaveClass('card', 'card-lg');
});
