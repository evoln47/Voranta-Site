import { render, screen } from '@testing-library/react';
import { Eyebrow } from './Eyebrow';

test('eyebrow class applied', () => {
  render(<Eyebrow>How it works</Eyebrow>);
  expect(screen.getByText('How it works')).toHaveClass('eyebrow');
});
