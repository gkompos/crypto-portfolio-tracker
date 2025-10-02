"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export type Holding = { coinId: string; symbol: string; name: string; qty: number; avgBuyPriceUsd: number };
export type Portfolio = Record<string, Holding>;
const LS_KEY = "crypto-portfolio-v1";

export function usePortfolio() { //Manages portfolio state with localStorage persistence. Custom hook. Share the portfolio state and actions(logic).
  const [holdings, setHoldings] = useState<Portfolio>(() => {  //Uses a lazy initializer so parsing runs once.
    if (typeof window === "undefined") return {};  //Guards window for SSR.
    try {                                       //Swallows parse errors safely.
      const raw = localStorage.getItem(LS_KEY);  
      return raw ? JSON.parse(raw) : {};      
    } catch {
      return {};
    }
  });

  //Avoid writing on first render
  const didMount = useRef(false); 
  useEffect(() => {
    didMount.current = true;
  }, []);

  useEffect(() => {         //Writes only after initial mount → prevents overwriting existing storage during hydration.
    if (!didMount.current) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(holdings));
    } catch {}
  }, [holdings]);

  function buy(meta: { coinId: string; symbol: string; name: string }, qty: number, priceUsd: number) {
    if (!(qty > 0) || !(priceUsd >= 0)) return;
    setHoldings(prev => {
      const old = prev[meta.coinId];
      if (!old) {
        return { ...prev, [meta.coinId]: { coinId: meta.coinId, symbol: meta.symbol, name: meta.name, qty, avgBuyPriceUsd: priceUsd } };
      }
      const newQty = old.qty + qty;
      const newAvg = newQty === 0 ? 0 : (old.qty * old.avgBuyPriceUsd + qty * priceUsd) / newQty;
      return { ...prev, [meta.coinId]: { ...old, qty: newQty, avgBuyPriceUsd: newAvg } };
    });
  }

  function sell(coinId: string, qty: number) {
    const amount = Number(qty);
    if (!(amount > 0)) return;

    setHoldings(prev => {
      const old = prev[coinId];
      if (!old) return prev;

      // no negative positions
      const sellQty = Math.min(old.qty, amount);
      const newQty = old.qty - sellQty;

      if (newQty <= 0) {
        const { [coinId]: _omit, ...rest } = prev;
        return rest;
      }
      return { ...prev, [coinId]: { ...old, qty: newQty } };
    });
  }

  const clearAll = () => setHoldings({});
  const list = useMemo(() => Object.values(holdings), [holdings]);

  return { holdings, list, buy, sell, clearAll };
}
