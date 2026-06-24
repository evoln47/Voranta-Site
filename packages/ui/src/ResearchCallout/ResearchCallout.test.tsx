import { render, screen } from '@testing-library/react';
import { ResearchCallout } from './ResearchCallout';

test('renders label and body in callout', () => {
  const { container } = render(<ResearchCallout label="Finding">68% of buyers said so.</ResearchCallout>);
  expect(container.firstChild).toHaveClass('callout-research');
  expect(screen.getByText('Finding').tagName).toBe('STRONG');
  expect(screen.getByText('68% of buyers said so.')).toBeInTheDocument();
});
