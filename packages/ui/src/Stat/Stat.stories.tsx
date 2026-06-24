import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './Stat';

const meta: Meta<typeof Stat> = { title: 'Components/Stat', component: Stat };
export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = { args: { value: '92%', label: 'of buyers shortlist by reputation' } };
export const Accent: Story = { args: { value: '3.4x', label: 'pipeline lift', accent: true } };
