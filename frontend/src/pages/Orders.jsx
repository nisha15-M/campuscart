import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Loader, EmptyState } from "../components/Bits";

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-600",
  accepted: "bg-forest-50 text-forest-700",
  completed: "bg-ink-900/5 text-ink-700/60",
  cancelled: "bg-clay-500/10 text-clay-600",
};

export default function Orders() {
  const [tab, setTab] = useState("purchases");
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/orders/purchases"), api.get("/orders/sales")])
      .then(([p, s]) => { setPurchases(p.data); setSales(s.data); })
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const respond = async (id, action) => {
    try {
      await api.put(`/orders/${id}/respond`, { action });
      showToast(action === "accept" ? "Order accepted ✅" : "Order rejected");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const complete = async (id) => {
    const ratingInput = window.prompt("Rate the seller 1-5 stars (optional)", "5");
    const sellerRating = ratingInput ? Math.min(5, Math.max(1, Number(ratingInput))) : undefined;
    try {
      await api.put(`/orders/${id}/complete`, { sellerRating });
      showToast("Order marked complete 🎉");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const list = tab === "purchases" ? purchases : sales;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">MY EXCHANGES</p>
      <h1 className="mt-2 font-display text-3xl font-black text-ink-900">Orders</h1>

      <div className="mt-6 inline-flex rounded-xl bg-white p-1 ring-2 ring-ink-900/10">
        {["purchases", "sales"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2.5 text-sm font-black capitalize transition ${
              tab === t ? "bg-forest-600 text-cream-50" : "text-ink-700/60"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && list.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon="🧾"
            title={`No ${tab} yet`}
            text={tab === "purchases" ? "Items you request will show up here." : "Requests from buyers will show up here."}
            action={<Link to="/marketplace" className="mt-5 inline-block rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50">Browse marketplace</Link>}
          />
        </div>
      )}

      {!loading && list.length > 0 && (
        <div className="mt-8 space-y-4">
          {list.map((order) => (
            <div key={order._id} className="stitched rounded-2xl bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-black text-ink-900">
                    {order.product?.title || "Item removed"}
                  </h3>
                  <p className="mt-1 text-sm text-ink-700/50">
                    {tab === "purchases"
                      ? `Seller: ${order.seller?.name || "Student"}`
                      : `Buyer: ${order.buyer?.name || "Student"}`}
                    {order.meetupPoint && ` · 📍 ${order.meetupPoint}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black capitalize ${STATUS_STYLE[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <b className="text-forest-600">
                  {order.listingType === "free" ? "FREE" : order.listingType === "exchange" ? "Exchange" : `₹${order.price}`}
                </b>
                {order.sellerRating && (
                  <span className="text-sm text-amber-500">{"⭐".repeat(order.sellerRating)}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tab === "sales" && order.status === "pending" && (
                  <>
                    <button onClick={() => respond(order._id, "accept")} className="rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-bold text-cream-50 hover:bg-forest-700">
                      Accept
                    </button>
                    <button onClick={() => respond(order._id, "reject")} className="rounded-xl border-2 border-clay-500/30 px-4 py-2.5 text-sm font-bold text-clay-600 hover:bg-clay-500/5">
                      Reject
                    </button>
                  </>
                )}
                {tab === "purchases" && order.status === "accepted" && (
                  <button onClick={() => complete(order._id)} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-amber-400">
                    Mark as picked up & rate
                  </button>
                )}
                {order.product?._id && (
                  <Link to={`/product/${order.product._id}`} className="rounded-xl border-2 border-ink-900/10 px-4 py-2.5 text-sm font-bold hover:bg-forest-50">
                    View item
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
