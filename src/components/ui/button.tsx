import { cn } from "@/lib/utils";
import React from "react";

export function Button({ className, variant = "primary", disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"outline"|"ghost"|"destructive" }) {
  const base = "rounded-xl px-3 py-2 text-sm font-medium transition border";
  const styles: Record<string,string> = {
    primary: "bg-indigo-600 hover:bg-indigo-500 border-indigo-500",
    outline: "bg-slate-900 hover:bg-slate-800 border-slate-800",
    ghost: "bg-transparent hover:bg-slate-800 border-transparent",
    destructive: "bg-rose-900/40 hover:bg-rose-900/60 border-rose-900 text-rose-200",
  };
  return <button className={cn(base, styles[variant], disabled && "opacity-60 cursor-not-allowed", className)} disabled={disabled} {...props} />;
}

// convenience link styles
export const linkButtonClasses = "rounded-xl px-3 py-2 text-sm border border-slate-800 hover:bg-slate-800";
