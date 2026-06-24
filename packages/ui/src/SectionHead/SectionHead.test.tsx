import { render, screen } from '@testing-library/react';
import { SectionHead } from './SectionHead';

test('renders eyebrow, heading, rule, subhead', () => {
  const { container } = render(
    <SectionHead eyebrow="Method" heading="How scoring works" subhead="Every point traces to a question." />,
  );
  expect(container.firstChild).toHaveClass('section-head');
  expect(screen.getByText('Method')).toHaveClass('eyebrow');
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('How scoring works');
  expect(container.querySelector('.rule')).toBeInTheDocument();
  expect(screen.getByText('Every point traces to a question.')).toHaveClass('subhead');
});
