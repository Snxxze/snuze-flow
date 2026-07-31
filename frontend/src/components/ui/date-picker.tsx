import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value = '', onChange, placeholder = 'เลือกวันกำหนดส่ง...', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 pointer-events-none text-charcoal-subtle">
          <CalendarIcon className="h-4 w-4 text-ocean" />
        </div>
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={cn(
            'flex h-9 w-full rounded-md border border-surface-border bg-canvas pl-9 pr-3 py-1.5 text-xs text-charcoal shadow-xs transition-colors hover:bg-surface focus:border-ocean focus:outline-none focus:ring-1 focus:ring-ocean disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:light]',
            className
          )}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
