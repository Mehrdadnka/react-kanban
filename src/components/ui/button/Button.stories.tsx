import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

import { Mail, ArrowRight, Settings } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default', 'destructive', 'outline', 'ghost',
        'success', 'warning', 'info', 'secondary',
        'link', 'gradient'
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: fn(),
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    fullWidth: false,
  }
} satisfies Meta<typeof Button>

export default meta;
type Story = StoryObj< typeof meta>

export const Default: Story = {
  args: {
    children: 'default Button',
    variant: 'default',
  },
}; 

export const Destructive: Story = {
  args: {
    children: 'delete Button',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Gradient: Story = {
  args: {
    children: 'Gradient',
    variant: 'gradient',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'XL Button',
    size: 'xl',
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Email',
    leftIcon: <Mail className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Next',
    rightIcon: <ArrowRight className="h-4 w-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: 'Settings',
    leftIcon: <Settings className="h-4 w-4" />,
    rightIcon: <ArrowRight className="h-4 w-4" />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Saving...',
    loading: true,
    loadingText: 'Please wait...',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const IconOnly: Story = {
  args: {
    children: <Settings className="h-4 w-4" />,
    'aria-label': 'Settings',
  },
};

export const Playground: Story = {
  args: {
    children: 'Play with me!',
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    fullWidth: false,
    leftIcon: null,
    rightIcon: null,
  },
};