"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchJSON, COINGECKO } from "../lib/coingecko";
import { Table, THead, TRow, TCell } from "../components/ui/table";
import { fmtUSD } from "./(helpers)/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MarketsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);

  const marketsQuery = useQuery({
    queryKey: ["markets", debounced ? "search" : "list", page, perPage, debounced],
    queryFn: async () => {
      if (debounced) {
        const s = await fetchJSON(`${COINGECKO}/search?query=${encodeURIComponent(debounced)}`);
        const ids = (s.coins ?? []).slice(0, 50).map((c: any) => c.id).join(",");
        if (!ids) return [];
        return fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&ids=${ids}`);
      }
      return fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&price_change_percentage=24h`);
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return (
    <section className="space-y-4">
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <Input placeholder="Search coins (e.g. bitcoin, eth)" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-64" />
        {!debounced && (
          <>
            <Select
              value={String(perPage)}
              onValueChange={(val) => {
                setPerPage(parseInt(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows / page" />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}/page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <span className="px-1">Page {page}</span>
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </>
        )}
      </Card>

      {marketsQuery.isLoading && <div className="text-slate-400">Loading markets…</div>}
      {marketsQuery.error && <div className="text-rose-300">Error: {(marketsQuery.error as Error).message}</div>}

      {marketsQuery.data && (
        <Card className="overflow-x-auto">
          <Table>
            <THead className="bg-slate-900/80">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Coin</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">24h</th>
                <th className="px-4 py-3 font-semibold">Market Cap</th>
              </tr>
            </THead>
            <tbody>
              {marketsQuery.data.map((r: any, i: number) => (
                <TRow key={r.id}>
                  <TCell>{i + 1 + (debounced ? 0 : (page - 1) * perPage)}</TCell>
                  <TCell>
                    <Link href={`/coins/${r.id}`} className="inline-flex items-center gap-2">
                      <Image src={r.image} alt="" width={24} height={24} className="rounded-full" />
                      <span className="font-medium">{r.name}</span>
                      <span className="uppercase text-slate-400">{r.symbol}</span>
                    </Link>
                  </TCell>
                  <TCell>{fmtUSD(r.current_price)}</TCell>
                  <TCell className={r.price_change_percentage_24h>=0?"text-emerald-300":"text-rose-300"}>
                    {r.price_change_percentage_24h?.toFixed(2)}%
                  </TCell>
                  <TCell>{r.market_cap?.toLocaleString()}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </section>
  );
}