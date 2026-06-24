import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = { title: 'Components/Badge', component: Badge };
export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: 'Research-led' } };
export const Ink: Story = { args: { variant: 'ink', children: 'Beta' } };
export const WithDot: Story = { args: { dot: true, children: 'One sponsor per category' } };
