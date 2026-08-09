import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded border border-surface-border bg-canvas px-3.5 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle hover:bg-surface focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
