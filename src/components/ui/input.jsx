import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out",
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-orange-500 focus:border-orange-500",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
