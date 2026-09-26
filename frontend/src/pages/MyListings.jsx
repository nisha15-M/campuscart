import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Loader, EmptyState, PriceTag, TypeTag } from "../components/Bits";
import { CATEGORY_EMOJI } from "../components/ProductCard";

const STATUS_STYLE = {
  active: "bg-forest-50 text-forest-700",
  reserved: "bg-amber-50 text-amber-600",
  sold: "bg-ink-900/5 text-ink-700/50",
  archived: "bg-ink-900/5 text-ink-700/50",
};

export default function MyListings() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/products/mine").then(({ data }) => setProducts(data))
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((current) => current.filter((p) => p._id !== id));
      showToast("Listing deleted");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-black tracking-widest text-forest-600">MY LISTINGS</p>
          <h1 className="mt-2 font-display text-3xl font-black text-ink-900">Everything you've posted</h1>
        </div>
        <Link to="/sell" className="rounded-xl bg-amber-500 px-5 py-3 font-black text-ink-900 shadow-stamp hover:bg-amber-400">
          + List a new item
        </Link>
      </div>

      {loading && <Loader />}

      {!loading && products.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon="📦"
            title="You haven't listed anything yet"
            text="Post your first item and give it a second life on campus."
            action={<Link to="/sell" className="mt-5 inline-block rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50">List an item</Link>}
          />
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-8 grid gap-4">
          {products.map((product) => (
            <div key={product._id} className="stitched flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-3xl">
                {CATEGORY_EMOJI[product.category] || "📦"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-black text-ink-900">{product.title}</h3>
                  <TypeTag listingType={product.listingType} />
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${STATUS_STYLE[product.status]}`}>
                    {product.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-700/50">
                  {product.category} · 📍 {product.meetupPoint}
                  {product.campusLoop?.resaleCount > 0 && ` · ♻️ ${product.campusLoop.resaleCount}× reused`}
                </p>
              </div>
              <PriceTag product={product} />
              <div className="flex gap-2">
                <Link to={`/product/${product._id}`} className="rounded-xl border-2 border-ink-900/10 px-4 py-2.5 text-sm font-bold hover:bg-forest-50">
                  View
                </Link>
                <Link to={`/sell?edit=${product._id}`} className="rounded-xl border-2 border-ink-900/10 px-4 py-2.5 text-sm font-bold hover:bg-forest-50">
                  Edit
                </Link>
                <button onClick={() => handleDelete(product._id)} className="rounded-xl border-2 border-clay-500/30 px-4 py-2.5 text-sm font-bold text-clay-600 hover:bg-clay-500/5">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
