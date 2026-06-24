import { render, screen } from '@testing-library/react';
import { Wordmark } from './Wordmark';

test('renders the wordmark text with class', () => {
  render(<Wordmark />);
  expect(screen.getByText('Voranta')).toHaveClass('wordmark');
});
