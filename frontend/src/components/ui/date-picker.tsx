import * as React from 'react';
import { format } from 'date-fns';
import { th, enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD or ISO string
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value = '',
  onChange,
  placeholder,
  className,
}: DatePickerProps) {
  const { i18n } = useTranslation();

  const currentLocale = i18n.language === 'th' ? th : enUS;
  const defaultPlaceholder = i18n.language === 'th' ? 'เลือกวันกำหนดส่ง...' : 'Pick a date...';
  const displayPlaceholder = placeholder ?? defaultPlaceholder;

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal text-xs h-9 px-3 border-surface-border bg-canvas hover:bg-surface text-charcoal shadow-xs',
            !selectedDate && 'text-charcoal-subtle/70',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-ocean shrink-0" />
          <span className="truncate flex-1">
            {selectedDate
              ? format(selectedDate, 'd MMM yyyy', { locale: currentLocale })
              : displayPlaceholder}
          </span>
          {selectedDate && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (onChange) onChange('');
              }}
              className="ml-1 text-charcoal-subtle/60 hover:text-charcoal p-0.5 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (onChange) {
              onChange(date ? format(date, 'yyyy-MM-dd') : '');
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
