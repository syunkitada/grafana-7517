import React from 'react';
import { renderComponentWithTheme } from '../../utils/storybook/withTheme';
import { CallToActionCard, CallToActionCardProps } from './CallToActionCard';
import { NOOP_CONTROL } from '../../utils/storybook/noopControl';
import { Story } from '@storybook/react';
import { Button } from '../Button/Button';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Layout/CallToActionCard',
  component: CallToActionCard,
  parameters: {
    knobs: {
      disabled: true,
    },
  },
  argTypes: {
    Element: { control: { type: 'select', options: ['button', 'custom'] } },
    className: NOOP_CONTROL,
    callToActionElement: NOOP_CONTROL,
    theme: NOOP_CONTROL,
  },
};

interface StoryProps extends Partial<CallToActionCardProps> {
  Element: string;
  H1Text: string;
  buttonText: string;
}

export const Basic: Story<StoryProps> = (args) => {
  const ctaElements: { [key: string]: JSX.Element } = {
    custom: <h1>{args.H1Text}</h1>,
    button: (
      <Button size="lg" icon="plus" onClick={action('cta button clicked')}>
        {args.buttonText}
      </Button>
    ),
  };

  return renderComponentWithTheme(CallToActionCard, {
    message: args.message,
    callToActionElement: ctaElements[args.Element],
    footer: args.footer,
  });
};

Basic.args = {
  Element: 'custom',
  message: 'Renders message prop content',
  footer: 'Renders footer prop content',
  H1Text: 'This is just H1 tag, you can any component as CTA element',
  buttonText: 'Add datasource',
};
