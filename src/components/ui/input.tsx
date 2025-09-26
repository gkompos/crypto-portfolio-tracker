import { cn } from "@/lib/cn";
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500", className)} {...props} />;
}