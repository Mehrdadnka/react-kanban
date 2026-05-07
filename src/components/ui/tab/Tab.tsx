import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'underline' | 'pills';
}

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  default: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

export const Tab: React.FC<TabProps> = ({
  items,
  defaultValue,
  value,
  onValueChange,
  className,
  isDarkMode = false,
  size = 'default',
  variant = 'underline',
}) => {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue || items[0]?.id}
      value={value}
      onValueChange={onValueChange}
      className={cn('flex flex-col w-full', className)}
    >
      <TabsPrimitive.List
        className={cn(
          'flex w-full',
          variant === 'underline'
            ? 'border-b'
            : 'gap-1 rounded-lg bg-muted p-1',
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        )}
        aria-label="Tabs"
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.id}
            value={item.id}
            className={cn(
              'group flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              sizeClasses[size],
              variant === 'underline'
                ? cn(
                    'relative border-b-2 border-transparent',
                    'data-[state=active]:border-primary data-[state=active]:text-primary',
                    'hover:text-gray-600 dark:hover:text-gray-300',
                    isDarkMode
                      ? 'text-gray-400 data-[state=active]:text-primary'
                      : 'text-gray-500 data-[state=active]:text-primary'
                  )
                : cn(
                    'rounded-md',
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                    'text-muted-foreground hover:text-foreground',
                    'dark:data-[state=active]:bg-gray-800'
                  )
            )}
          >
            {item.icon && (
              <span className={cn(
                'transition-colors',
                isDarkMode
                  ? 'text-gray-500 group-data-[state=active]:text-primary'
                  : 'text-gray-400 group-data-[state=active]:text-primary'
              )}>
                {item.icon}
              </span>
            )}
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content
          key={item.id}
          value={item.id}
          className={cn(
            'flex-1 pt-4 focus-visible:outline-none',
            'data-[state=inactive]:hidden'
          )}
        >
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
};