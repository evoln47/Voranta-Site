import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders a button with the solid base class', () => {
  render(<Button>Go</Button>);
  const el = screen.getByText('Go');
  expect(el).toHaveClass('btn');
});

test('ghost lg variant applies both ghost and lg classes', () => {
  render(<Button variant="ghost" size="lg">Go</Button>);
  const el = screen.getByText('Go');
  expect(el).toHaveClass('btn', 'btn-ghost', 'btn-lg');
});

test('as="a" renders an anchor', () => {
  render(<Button as="a" href="#x">Go</Button>);
  expect(screen.getByText('Go').tagName).toBe('A');
});
