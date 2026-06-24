import type { Meta, StoryObj } from '@storybook/react';
import { PricingCard } from './PricingCard';

const meta: Meta<typeof PricingCard> = { title: 'Components/PricingCard', component: PricingCard };
export default meta;
type Story = StoryObj<typeof PricingCard>;

export const Standard: Story = {
  args: { title: 'Category Sponsor', price: '$5,000', period: '/year', features: ['Exclusive category', 'Quarterly report', 'Logo placement'] },
};
export const Featured: Story = {
  args: { title: 'Founding Sponsor', price: '$8,000', period: '/year', featured: true, features: ['Everything in Category', 'Methodology input', 'First access'] },
};
