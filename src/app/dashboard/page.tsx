"use client";
import { Card } from "../../components/ui/card";
import { Table, THead, TRow, TCell } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "../../hooks/use-portfolio";
import { fetchJSON, COINGECKO } from "../../lib/coingecko";
import { fmtUSD, fmtPct } from "../(helpers)/format";

export default function DashboardPage() {
  const { holdings, clearAll } = usePortfolio();
  const [prices, setPrices] = useState<Record<string, any>>({});
  const ids = Object.keys(holdings);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (ids.length === 0) { setPrices({}); return; }
      const data = await fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&ids=${ids.join(",")}`);
      if (!cancelled) {
        const map: Record<string, any> = {};
        for (const r of data) map[r.id] = r;
        setPrices(map);
      }
    })();
    return () => { cancelled = true; };
  }, [JSON.stringify(ids)]);

  const rows = useMemo(() => {
    return ids.map((id) => {
      const h = holdings[id]!;
      const p = prices[id];
      const live = p?.current_price ?? 0;
      const value = h.qty * live;
      const pnl = h.qty * (live - h.avgBuyPriceUsd);
      return { id, name: h.name, symbol: h.symbol, qty: h.qty, avg: h.avgBuyPriceUsd, live, value, pnl };
    }).sort((a,b)=>b.value-a.value);
  }, [holdings, prices]);

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.qty * r.avg, 0);
  const totalPnL = totalValue - totalCost;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className="text-sm text-slate-400">Total Value</div>
          <div className="text-3xl font-extrabold">{fmtUSD(totalValue)}</div>
        </div>
        <div>
          <div className="text-sm text-slate-400">Unrealized P&L</div>
          <div className={`text-2xl font-bold ${totalPnL>=0?"text-emerald-300":"text-rose-300"}`}>{fmtUSD(totalPnL)}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={()=>location.reload()}>Refresh Prices</Button>
          <Button variant="destructive" onClick={clearAll}>Clear Portfolio</Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="p-8 text-center text-slate-300">Your portfolio is empty. Add coins from the <Link href="/" className="underline">Markets</Link> list.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <THead className="bg-slate-900/80">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800">
                <th className="px-4 py-3 font-semibold">Coin</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Avg&nbsp;Buy</th>
                <th className="px-4 py-3 font-semibold">Live</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">P&amp;L</th>
                <th className="px-4 py-3 font-semibold">Share</th>
              </tr>
            </THead>
            <tbody>
              {rows.map((r) => (
                <TRow key={r.id}>
                  <TCell><Link href={`/coins/${r.id}`} className="uppercase underline-offset-2 hover:underline">{r.symbol}</Link></TCell>
                  <TCell>{r.qty}</TCell>
                  <TCell>{fmtUSD(r.avg)}</TCell>
                  <TCell>{fmtUSD(r.live)}</TCell>
                  <TCell>{fmtUSD(r.value)}</TCell>
                  <TCell className={r.pnl>=0?"text-emerald-300":"text-rose-300"}>{fmtUSD(r.pnl)}</TCell>
                  <TCell>{totalValue>0?fmtPct(r.value/totalValue):"-"}</TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </section>
  );
}