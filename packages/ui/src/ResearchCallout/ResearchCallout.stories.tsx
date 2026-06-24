import type { Meta, StoryObj } from '@storybook/react';
import { ResearchCallout } from './ResearchCallout';

const meta: Meta<typeof ResearchCallout> = { title: 'Components/ResearchCallout', component: ResearchCallout };
export default meta;
export const Default: StoryObj<typeof ResearchCallout> = {
  args: { label: 'Research finding', children: 'In a study of 200 software buyers, reputation outranked feature lists 3 to 1.' },
};
