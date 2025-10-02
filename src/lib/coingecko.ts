export const COINGECKO = "https://api.coingecko.com/api/v3";
export async function fetchJSON<T=any>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
/*
A constant (COINGECKO) you can reuse everywhere instead of rewriting the base URL.

A utility function (fetchJSON) that:

Makes an HTTP request,
Ensures the response is OK,
Parses the result as JSON,
Throws a clear error if something goes wrong.

This makes your code cleaner, consistent, and type-safe (with TypeScript).
*/