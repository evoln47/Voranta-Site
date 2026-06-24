import type { Preview } from '@storybook/react';
import '../src/styles/theme.css';
import '../src/styles/components.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'paper',
      values: [{ name: 'paper', value: '#ECF1ED' }],
    },
  },
};
export default preview;
