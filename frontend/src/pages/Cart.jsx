import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { EmptyState } from "../components/Bits";
import { CATEGORY_EMOJI } from "../components/ProductCard";

export default function Cart() {
  const { items, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const checkout = async () => {
    if (!user) return navigate("/login", { state: { from: "/cart" } });
    setCheckingOut(true);
    let succeeded = 0;
    for (const item of items) {
      try {
        await api.post("/orders", { productId: item._id });
        succeeded += 1;
      } catch {
        // an individual item may already be reserved by someone else - skip it
      }
    }
    setCheckingOut(false);
    clearCart();
    if (succeeded > 0) {
      showToast(`Requested ${succeeded} item${succeeded > 1 ? "s" : ""} 🚀`);
      navigate("/orders");
    } else {
      showToast("Those items are no longer available", "error");
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          text="Add items from the marketplace to request them together."
          action={<Link to="/marketplace" className="mt-5 inline-block rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50">Browse marketplace</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">READY TO REQUEST</p>
      <h1 className="mt-2 font-display text-3xl font-black text-ink-900">Your cart</h1>
      <p className="mt-2 text-ink-700/60">
        Checking out sends a purchase request to each seller — nothing is charged automatically.
      </p>

      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <div key={item._id} className="stitched flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-2xl">
              {CATEGORY_EMOJI[item.category] || "📦"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-ink-900">{item.title}</p>
              <p className="text-sm text-ink-700/50">📍 {item.meetupPoint}</p>
            </div>
            <b className="text-forest-600">₹{item.price?.toLocaleString("en-IN")}</b>
            <button onClick={() => removeItem(item._id)} className="rounded-full bg-ink-900/5 px-3 py-2 text-sm font-bold text-ink-700/60 hover:bg-clay-500/10 hover:text-clay-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="stitched mt-6 flex items-center justify-between rounded-2xl bg-ink-900 p-6 text-cream-50">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cream-50/50">Total</p>
          <b className="font-display text-2xl">₹{total.toLocaleString("en-IN")}</b>
        </div>
        <button
          onClick={checkout}
          disabled={checkingOut}
          className="rounded-xl bg-forest-500 px-6 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-400 disabled:opacity-60"
        >
          {checkingOut ? "Sending requests..." : "Request all items →"}
        </button>
      </div>
    </div>
  );
}
