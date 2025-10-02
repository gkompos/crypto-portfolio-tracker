"use client";
import { useQuery } from "@tanstack/react-query";
import { COINGECKO, fetchJSON } from "../../../lib/coingecko";
import { useState } from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePortfolio } from "../../../hooks/use-portfolio";
import { fmtUSD } from "../../(helpers)/format";
import { useParams } from "next/navigation"; 

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>(); 

  const [days, setDays] = useState(7);
  const [qty, setQtyBuy] = useState("");
  const [qtySell, setQtySell] = useState("");
  const [price, setPrice] = useState("");
  const portfolio = usePortfolio();


  const stripHtml = (html: string = "") => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const coinQ = useQuery({
    queryKey: ["coin", id],
    queryFn: async () => {
      const x = await fetchJSON(`${COINGECKO}/coins/markets?vs_currency=usd&ids=${id}`);
      return x[0];
    },
    staleTime: 30_000, //fresh enough for UI; avoids refetch churn
    enabled: !!id, 
  });

  const chartQ = useQuery({
    queryKey: ["chart", id, days],
    queryFn: async () => {          //transforms the response into { ts, price } objects
      const ch = await fetchJSON(`${COINGECKO}/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
      return (ch.prices ?? []).map(([ts, p]: [number, number]) => ({ ts, price: p }));
    },
    staleTime: 30_000, //This means the fetched chart data is considered fresh for 30 seconds.
                      // Crypto prices and chart data change frequentl
    enabled: !!id,    //ensures the query only runs if id exists
  });

  const infoQ = useQuery({
    queryKey: ["coin-info", id], 
    queryFn: async () =>
      fetchJSON(
        `${COINGECKO}/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
      ),
    staleTime: 6 * 60 * 60 * 1000, // it's static-ish
    enabled: !!id,
  });

  const canBuy = Number(qty) > 0 && Number(price) >= 0;
  const handleBuy = () => {
    if (!coinQ.data) return;
    portfolio.buy(
      { coinId: String(id), symbol: coinQ.data.symbol, name: coinQ.data.name },
      Number(qty),
      Number(price || coinQ.data.current_price)
    );
    setQtyBuy(""); setPrice("");
    alert("Added to portfolio.");
  };

  if (coinQ.isLoading || !id) return <div className="text-slate-400">Loading coin…</div>;
  if (!coinQ.data) return <div className="text-slate-400">Coin not found.</div>;

  const coin = coinQ.data as any;

  return (
    <section className="space-y-6">
       <div className="flex items-center gap-3">
        <Link href="/" className="btn-ghost">← Back</Link>
        <div className="flex items-center gap-3 text-xl font-semibold">
          <Image src={coin.image} alt="" width={32} height={32} className="rounded-full" />
          <span>{coin.name}</span>
          <span className="uppercase text-slate-400 text-base">{coin.symbol}</span>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold">{fmtUSD(coin.current_price)}</div>
          <div className={`text-sm ${coin.price_change_percentage_24h >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            24h: {coin.price_change_percentage_24h?.toFixed(2)}%
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-slate-400">Range:</span>
          {[1,7,30,90,365].map((d) => (
            <Button key={d} variant={days===d?"primary":"outline"} onClick={()=>setDays(d)}>
              {d===1?"24h":d===365?"1y":`${d}d`}
            </Button>
          ))}
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartQ.data ?? []} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeOpacity={0.1} />
              <XAxis dataKey="ts" tickFormatter={(v)=>new Date(v).toLocaleDateString()} minTickGap={24} stroke="#94a3b8"/>
              <YAxis tickFormatter={(v)=>v>1000?`${Math.round(v).toLocaleString()}`:Number(v).toFixed(2)} stroke="#94a3b8" domain={["auto","auto"]}/>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }}
                labelFormatter={(v)=>new Date(Number(v)).toLocaleString()} formatter={(v)=>fmtUSD(Number(v))} />
              <Line type="monotone" dataKey="price" dot={false} stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-2">
          <div className="font-semibold">Add to Portfolio</div>
          <label className="text-sm text-slate-400 pr-3">Quantity</label>
          <Input value={qty} onChange={(e)=>setQtyBuy(e.target.value)} type="number" min="0" step="any"/>
          <br/>
          <label className="text-sm text-slate-400 pr-3">Price(USD)</label>
          <Input value={price} onChange={(e)=>setPrice(e.target.value)} type="number" min="0" step="any" placeholder={String(coin.current_price)}/>
          <div className="flex items-center gap-3 py-3">
            <Button disabled={!canBuy} onClick={handleBuy} className="w-full">Buy</Button>
            <Link href="/dashboard" className="btn-outline w-full text-center block">Go to Dashboard</Link>
          </div>
          
        </Card>

        <Card className="p-4 space-y-2">
          {(() => {
            const holding = portfolio.holdings[id];
            const currentQty = holding?.qty ?? 0;
            return (
              <div className="space-y-2">
                <div className="font-semibold">Sell from Portfolio</div>
                <div className="text-sm text-slate-400 py-3">
                  You currently hold:{" "}
                  <span className="font-medium text-slate-200">{currentQty}</span>{" "}
                  {coin.symbol?.toUpperCase()}
                </div>

                <label className="text-sm text-slate-400 pr-3">Quantity to Sell</label>
                <Input
                  value={qtySell}
                  onChange={(e) => setQtySell(e.target.value)}
                  type="number"
                  min="0"
                  max={currentQty}
                  step="any"
                />
                <div className="flex items-center gap-3 py-3">
                  <Button
                  disabled={Number(qtySell) <= 0 || Number(qtySell) > currentQty}
                  onClick={() => {
                    portfolio.sell(id, Number(qtySell));
                    alert(`Sold ${qtySell} ${coin.symbol.toUpperCase()} from portfolio.`);
                    setQtySell("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sell
                </Button>
                </div>
                
              </div>
            );
        })()}
        </Card>

        <Card className="p-4 space-y-1">
          <div className="font-semibold mb-1">Key Stats</div>
          <Key kx="Market Cap" v={coin.market_cap?.toLocaleString()} />
          <Key kx="24 Hour Trading Vol" v={coin.total_volume?.toLocaleString()} />
          <Key kx="24h High" v={fmtUSD(coin.high_24h)} />
          <Key kx="24h Low" v={fmtUSD(coin.low_24h)} />
          <Key kx="ATH" v={fmtUSD(coin.ath)} />
          <Key kx="Circulating Supply" v={coin.circulating_supply?.toLocaleString()} />
          <Key kx="Max Supply" v={coin.max_supply?.toLocaleString()} />

        </Card>

        <Card className="p-4">
          <div className="font-semibold mb-1">About {coin.name}</div>

          {!infoQ.isLoading && infoQ.data?.description?.en ? (
            <>
              <p className="text-sm text-slate-300">
                {(() => {
                  const about = stripHtml(infoQ.data.description.en);
                  const short = about.slice(0, 900);
                  return about.length > 900 ? `${short}…` : short;
                })()}
              </p>

              <div className="mt-3 text-xs text-slate-400 space-x-2">
                {infoQ.data.links?.homepage?.[0] && (
                  <a
                    href={infoQ.data.links.homepage[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Official site
                  </a>
                )}
                <a
                  href={`https://www.coingecko.com/en/coins/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on CoinGecko
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">
              {coin.name} ({coin.symbol?.toUpperCase()}) market data from CoinGecko. Record a simulated buy into your local portfolio. No accounts or wallets required.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}

function Key({ kx, v }: { kx: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-400">{kx}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
