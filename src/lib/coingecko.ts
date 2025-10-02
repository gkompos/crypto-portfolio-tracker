export const COINGECKO = "https://api.coingecko.com/api/v3";
export async function fetchJSON<T=any>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}