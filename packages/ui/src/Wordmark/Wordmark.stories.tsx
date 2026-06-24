import type { Meta, StoryObj } from '@storybook/react';
import { Wordmark } from './Wordmark';

const meta: Meta<typeof Wordmark> = { title: 'Components/Wordmark', component: Wordmark };
export default meta;
export const Default: StoryObj<typeof Wordmark> = {
  render: () => <div style={{ fontSize: 48 }}><Wordmark /></div>,
};
