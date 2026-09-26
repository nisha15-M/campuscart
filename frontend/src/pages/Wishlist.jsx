import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import { Loader, EmptyState } from "../components/Bits";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get("/wishlist").then(({ data }) => setItems(data.filter((i) => i.product)))
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems((current) => current.filter((i) => i.product._id !== productId));
      showToast("Removed from wishlist");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">SAVED FOR LATER</p>
      <h1 className="mt-2 font-display text-3xl font-black text-ink-900">Your wishlist</h1>

      {loading && <Loader />}

      {!loading && items.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon="🤍"
            title="Your wishlist is empty"
            text="Save items you're eyeing so you don't lose track of them."
            action={<Link to="/marketplace" className="mt-5 inline-block rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50">Browse marketplace</Link>}
          />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item._id}
              product={item.product}
              wished
              onToggleWish={(p) => remove(p._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
