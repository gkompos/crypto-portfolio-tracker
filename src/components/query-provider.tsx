"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/*This file is the bridge that powers all your useQuery calls — a single, shared, 
client-side query manager for your whole crypto tracker app. */

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1,      //retry failed queries once before showing error.
        refetchOnWindowFocus: false }  //don’t automatically refetch when user tabs back (avoids surprise refreshes).
    }
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}