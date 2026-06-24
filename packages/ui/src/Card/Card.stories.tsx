import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = { title: 'Components/Card', component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Medium: Story = {
  render: () => <Card><p style={{ margin: 0 }}>A standard card surface.</p></Card>,
};
export const Large: Story = {
  render: () => <Card size="lg"><p style={{ margin: 0 }}>A large module surface.</p></Card>,
};
