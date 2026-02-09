import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#6E6E73] selection:bg-[#0071E3] selection:text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.10)] text-[#F5F5F7] h-10 w-full min-w-0 rounded-[10px] px-4 py-3 text-base shadow-xs transition-[color,box-shadow,border-color] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        "focus-visible:border-[#0071E3] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,113,227,0.2)]",
        "aria-invalid:ring-[rgba(255,69,58,0.2)] aria-invalid:border-[#FF453A]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
