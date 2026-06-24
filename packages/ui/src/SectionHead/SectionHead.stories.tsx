import type { Meta, StoryObj } from '@storybook/react';
import { SectionHead } from './SectionHead';

const meta: Meta<typeof SectionHead> = { title: 'Components/SectionHead', component: SectionHead };
export default meta;
export const Default: StoryObj<typeof SectionHead> = {
  args: { eyebrow: 'The methodology', heading: 'Research, not opinion', subhead: 'Every score traces to a documented question and weight.' },
};
