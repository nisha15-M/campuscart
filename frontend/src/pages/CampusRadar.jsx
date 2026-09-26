import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import { Loader, EmptyState } from "../components/Bits";

export default function CampusRadar() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const { showToast } = useToast();

  const load = (kw = "") => {
    setLoading(true);
    api.get("/products/radar", { params: kw ? { keyword: kw } : {} })
      .then(({ data }) => setGroups(data))
      .catch((err) => showToast(getErrorMessage(err, "Login to use Campus Radar"), "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">📡 CAMPUS RADAR</p>
      <h1 className="mt-2 font-display text-4xl font-black text-ink-900">Browse by pickup point</h1>
      <p className="mt-2 max-w-2xl text-ink-700/60">
        See everything available near a specific spot on campus — handy when
        you're already headed that way.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); load(keyword); }}
        className="mt-7 flex max-w-lg items-center rounded-2xl border-2 border-ink-900/10 bg-white p-2 shadow-card"
      >
        <span className="px-3 text-xl">🔍</span>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Filter by item name..."
          className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"
        />
        <button className="rounded-xl bg-ink-900 px-5 py-3 font-bold text-cream-50">Filter</button>
      </form>

      {loading && <Loader label="Scanning campus locations..." />}

      {!loading && groups.length === 0 && (
        <div className="mt-8">
          <EmptyState icon="📡" title="No active listings on your campus yet" text="Be the first to list something!" />
        </div>
      )}

      {!loading && groups.length > 0 && (
        <div className="mt-8 space-y-12">
          {groups.map((group) => (
            <div key={group.location}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-600 text-lg text-cream-50">📍</span>
                <h2 className="font-display text-2xl font-black text-ink-900">{group.location}</h2>
                <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-black text-forest-700">
                  {group.itemCount} item{group.itemCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.products.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
