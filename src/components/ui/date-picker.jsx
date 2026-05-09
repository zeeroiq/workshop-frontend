import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const DatePicker = React.forwardRef(({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className
}, ref) => {
  const [open, setOpen] = useState(false);

  // Ensure value is a Date object or null
  const dateValue = value ? new Date(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(date) => {
            // Convert to YYYY-MM-DD format as required by the form
            if (date) {
              const formattedDate = date.toISOString().split('T')[0];
              onChange({ target: { name: '', value: formattedDate } });
            }
            setOpen(false);
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = 'DatePicker';

export { DatePicker };

