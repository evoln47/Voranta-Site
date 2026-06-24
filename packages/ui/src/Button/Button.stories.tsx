import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Solid: Story = { args: { children: 'Get the assessment' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Learn more' } };
export const SolidLarge: Story = { args: { size: 'lg', children: 'Get the assessment' } };
export const GhostLarge: Story = { args: { variant: 'ghost', size: 'lg', children: 'Learn more' } };
