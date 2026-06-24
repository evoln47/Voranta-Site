import type { Meta, StoryObj } from '@storybook/react';
import { FeatureCard } from './FeatureCard';

const meta: Meta<typeof FeatureCard> = { title: 'Components/FeatureCard', component: FeatureCard };
export default meta;
export const Default: StoryObj<typeof FeatureCard> = {
  args: { title: 'Research-led scoring', body: 'Every score traces to a documented question and weight.' },
};
