import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/*
To create a smart className helper that:

Combines multiple class names or conditional classes.
Works with Tailwind CSS.
Automatically resolves conflicts (like p-2 vs p-4).
Keeps your components clean and readable.
*/