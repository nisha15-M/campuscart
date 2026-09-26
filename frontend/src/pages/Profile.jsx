import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/Bits";

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    api.get("/products/mine").then(({ data }) => setMyProducts(data)).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Loader />;

  const trust = user.trustScore ?? 50;
  const totalReuses = myProducts.reduce((sum, p) => sum + (p.campusLoop?.resaleCount || 0), 0);
  const activeCount = myProducts.filter((p) => p.status === "active").length;
  const soldCount = myProducts.filter((p) => p.status === "sold").length;

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - trust / 100);

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">MY PROFILE</p>
      <h1 className="mt-2 font-display text-3xl font-black text-ink-900">Hey, {user.name?.split(" ")[0]} 👋</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[.9fr_1.1fr]">
        {/* TRUST GAUGE */}
        <div className="stitched flex flex-col items-center rounded-[2rem] bg-ink-900 p-8 text-cream-50">
          <p className="text-xs font-black uppercase tracking-widest text-cream-50/50">Campus trust score</p>
          <div className="relative mt-4 h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke="#EFAD3E" strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <b className="font-display text-3xl">{trust}%</b>
              <span className="text-[10px] text-cream-50/50">trust</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-cream-50/60">
            {user.ratingsCount > 0
              ? `Based on ${user.ratingsCount} completed exchange${user.ratingsCount === 1 ? "" : "s"}`
              : "Complete your first exchange to build your score"}
          </p>
          {user.isVerified && (
            <span className="mt-3 rounded-full bg-forest-500/20 px-3 py-1.5 text-xs font-black text-forest-200">
              🛡️ Verified student
            </span>
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-4">
          <div className="stitched rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 font-display text-xl font-black text-forest-700">
                {user.name?.[0]}
              </div>
              <div>
                <p className="font-display text-lg font-black text-ink-900">{user.name}</p>
                <p className="text-sm text-ink-700/50">{user.email}</p>
                <p className="text-sm text-ink-700/50">🏫 {user.college}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Active listings" value={loading ? "…" : activeCount} />
            <StatCard label="Items sold" value={loading ? "…" : soldCount} />
            <StatCard label="CampusLoop reuses" value={loading ? "…" : totalReuses} accent />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/my-listings" className="rounded-2xl bg-white p-4 text-center font-bold text-ink-900 shadow-card hover:bg-forest-50">
              📦 My listings
            </Link>
            <Link to="/orders" className="rounded-2xl bg-white p-4 text-center font-bold text-ink-900 shadow-card hover:bg-forest-50">
              🧾 Orders
            </Link>
            <Link to="/wishlist" className="rounded-2xl bg-white p-4 text-center font-bold text-ink-900 shadow-card hover:bg-forest-50">
              🤍 Wishlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stitched rounded-2xl bg-white p-4 text-center shadow-card">
      <b className={`font-display text-2xl ${accent ? "text-forest-600" : "text-ink-900"}`}>{value}</b>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink-700/40">{label}</p>
    </div>
  );
}
