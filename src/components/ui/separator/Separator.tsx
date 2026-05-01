import React from 'react'
import { cn } from '@/lib/utils'

type SeparatorElement = React.ElementRef<'div'>

interface SeparatorProps extends React.ComponentPropsWithoutRef<'div'> {
  isDarkMode: boolean
  decorative?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: '1' | '2' | '3' | '4'
}

const Separator = React.forwardRef<SeparatorElement, SeparatorProps>(
  (
    {
      className,
      isDarkMode,
      decorative = true,
      orientation = 'horizontal',
      size = '1',
      ...props
    },
    forwardedRef
  ) => {
    const colors = {
      light: {
        bg: 'bg-gray-200',
        muted: 'bg-gray-100',
      },
      dark: {
        bg: 'bg-gray-600',
        muted: 'bg-gray-700',
      },
    }

    const theme = isDarkMode ? colors.dark : colors.light

    const sizes = {
      horizontal: {
        1: 'h-[1px]',
        2: 'h-[2px]',
        3: 'h-[3px]',
        4: 'h-[4px]',
      },
      vertical: {
        1: 'w-[1px]',
        2: 'w-[2px]',
        3: 'w-[3px]',
        4: 'w-[4px]',
      },
    }

    return (
      <div
        role={decorative ? undefined : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        data-orientation={orientation}
        data-size={size}
        ref={forwardedRef}
        className={cn(
          'shrink-0',
          
          theme.bg,
          
          orientation === 'horizontal'
            ? cn('w-full', sizes.horizontal[size])
            : cn('h-full', sizes.vertical[size]),
          
          orientation === 'horizontal' && 'my-2',
          
          orientation === 'vertical' && 'mx-2',
          
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
export type { SeparatorProps }