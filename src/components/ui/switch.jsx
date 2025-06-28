import * as React from "react"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const handleCheckboxChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <label className={cn("flex cursor-pointer select-none items-center", disabled && "opacity-50 cursor-not-allowed", className)}>
      <div className='relative'>
        <input
          type='checkbox'
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          className='sr-only'
          ref={ref}
          {...props}
        />
        <div
          className={`block h-6 w-11 rounded-full transition-colors duration-200 ${
            checked ? 'bg-green-500' : 'bg-gray-400'
          }`}
          style={{
            border: 'none',
            outline: 'none',
            boxShadow: 'none'
          }}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
          style={{
            border: 'none',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        ></div>
      </div>
    </label>
  );
});

Switch.displayName = "Switch"

export { Switch }
