import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default: 
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 ' +
          'dark:bg-blue-600 dark:hover:bg-blue-700',
        destructive: 
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 ' +
          'dark:bg-red-600 dark:hover:bg-red-700',
        outline: 
          'border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-400 ' +
          'dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-100',
        ghost: 
          'hover:bg-gray-100 focus-visible:ring-gray-400 text-gray-700 ' +
          'dark:hover:bg-gray-800 dark:text-gray-300',
        success: 
          'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 ' +
          'dark:bg-emerald-600 dark:hover:bg-emerald-700',
        warning: 
          'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400 ' +
          'dark:bg-amber-500 dark:hover:bg-amber-600',
        info: 
          'bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-400 ' +
          'dark:bg-cyan-500 dark:hover:bg-cyan-600',
        secondary: 
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-400 ' +
          'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
        link: 
          'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 ' +
          'dark:text-blue-400',
        gradient: 
          'bg-gradient-to-r from-blue-600 to-purple-600 text-white ' +
          'hover:from-blue-700 hover:to-purple-700 focus-visible:ring-purple-500 ' +
          'shadow-lg hover:shadow-xl',
        soft: {
          default: 
            'bg-blue-50 text-blue-700 hover:bg-blue-100 focus-visible:ring-blue-400 ' +
            'dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900',
          destructive: 
            'bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-400 ' +
            'dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900',
          success: 
            'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-400 ' +
            'dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900',
          warning: 
            'bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-400 ' +
            'dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900',
          info: 
            'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 focus-visible:ring-cyan-400 ' +
            'dark:bg-cyan-950 dark:text-cyan-300 dark:hover:bg-cyan-900',
        },
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded',
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2 rounded-md',
        lg: 'h-11 px-6 text-base rounded-md',
        xl: 'h-12 px-8 text-base rounded-lg',
        icon: {
          xs: 'h-7 w-7',
          sm: 'h-8 w-8',
          default: 'h-10 w-10',
          lg: 'h-11 w-11',
          xl: 'h-12 w-12',
        },
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'relative cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      loadingText,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Handle soft variant specially
    const resolvedVariant = typeof variant === 'string' && variant.startsWith('soft-') 
      ? 'soft' 
      : variant;

    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant: resolvedVariant as any, 
            size, 
            loading,
            fullWidth,
            className,
          })
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Export variant types for type safety
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;