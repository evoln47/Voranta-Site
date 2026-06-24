import type { Meta, StoryObj } from '@storybook/react';
import { Eyebrow } from './Eyebrow';

const meta: Meta<typeof Eyebrow> = { title: 'Components/Eyebrow', component: Eyebrow };
export default meta;
export const Default: StoryObj<typeof Eyebrow> = { args: { children: 'The methodology' } };
