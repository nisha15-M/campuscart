import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import ActivityTicker from "../components/ActivityTicker";
import { PriceTag, TypeTag } from "../components/Bits";
import { CATEGORY_EMOJI } from "../components/ProductCard";

const CATEGORIES = [
  "Books", "Electronics", "Lab Equipment", "Furniture",
  "Clothing", "Sports", "Stationery", "Other",
];
const CONDITIONS = ["New", "Like New", "Used", "Heavily Used"];
const MEETUPS = [
  "Library", "Main Gate", "Hostel Block A", "Hostel Block B",
  "Canteen", "Academic Block", "Sports Complex", "Other",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [trending, setTrending] = useState([]);
  const [impact, setImpact] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // CampusMatch form state
  const [mKeyword, setMKeyword] = useState("");
  const [mCategory, setMCategory] = useState("");
  const [mBudget, setMBudget] = useState("");
  const [mCondition, setMCondition] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [mUrgent, setMUrgent] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get("/products/impact").then(({ data }) => setImpact(data)).catch(() => {});
  }, []);

  const runSearch = () => {
    if (search.trim()) navigate(`/marketplace?keyword=${encodeURIComponent(search.trim())}`);
    else navigate("/marketplace");
  };

  const findMatches = async () => {
    if (!mKeyword.trim() && !mCategory) {
      showToast("Tell us what you're looking for 🔎");
      return;
    }
    try {
      setMatchLoading(true);
      setSearched(true);
      const { data } = await api.post("/campus-match", {
        keyword: mKeyword.trim(),
        category: mCategory,
        budget: mBudget,
        condition: mCondition,
        meetupPoint: mLocation,
        urgent: mUrgent,
      });
      setMatches(data.matches || []);
      showToast(
        data.matches?.length
          ? `${data.matches.length} smart matches found ✨`
          : "No close matches yet 😕"
      );
    } catch (error) {
      showToast(getErrorMessage(error, "CampusMatch failed"), "error");
    } finally {
      setMatchLoading(false);
    }
  };

  const clearMatch = () => {
    setMKeyword(""); setMCategory(""); setMBudget("");
    setMCondition(""); setMLocation(""); setMUrgent(false);
    setMatches([]); setSearched(false);
  };

  return (
    <div>
      <ActivityTicker />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-forest-200 bg-forest-50 px-4 py-2 text-sm font-black text-forest-700">
              🛡️ Verified student community
            </div>

            <h1 className="max-w-3xl font-display text-5xl font-black leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-[4.2rem]">
              Don't buy new.
              <span className="squiggle-underline block pb-2 text-forest-600">
                Find it on campus.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-700/70">
              Buy, sell, exchange, or give away college essentials with
              students you can trust — and see exactly whose hands each item
              has passed through.
            </p>

            <div className="mt-8 flex max-w-2xl items-center rounded-2xl border-2 border-ink-900/10 bg-white p-2 shadow-card">
              <span className="px-3 text-xl">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search books, calculators, hostel items..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"
              />
              <button
                onClick={runSearch}
                className="hidden rounded-xl bg-ink-900 px-5 py-3 font-bold text-cream-50 sm:block"
              >
                Search
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="rounded-xl bg-forest-600 px-6 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700"
              >
                Explore marketplace →
              </Link>
              <Link
                to="/sell"
                className="rounded-xl border-2 border-ink-900/10 bg-white px-6 py-3.5 font-black text-ink-900 hover:bg-forest-50"
              >
                + List an item
              </Link>
            </div>

            {impact && (
              <div className="mt-10 flex flex-wrap gap-8">
                <div>
                  <b className="font-display text-2xl text-ink-900">{impact.itemsInLoop}+</b>
                  <p className="text-sm text-ink-700/60">Items in the reuse loop</p>
                </div>
                <div>
                  <b className="font-display text-2xl text-ink-900">₹{impact.moneySaved.toLocaleString("en-IN")}</b>
                  <p className="text-sm text-ink-700/60">Moved between students</p>
                </div>
                <div>
                  <b className="font-display text-2xl text-forest-600">{impact.co2SavedKg}kg</b>
                  <p className="text-sm text-ink-700/60">Waste avoided</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="stitched rounded-[2rem] bg-white p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-ink-700/40">
                    Live on campus
                  </p>
                  <h2 className="font-display text-2xl font-black text-ink-900">
                    Trending now
                  </h2>
                </div>
                <div className="rounded-full bg-forest-50 px-3 py-2 text-xs font-black text-forest-700">
                  ● Live feed
                </div>
              </div>

              <TrendingList onLoaded={setTrending} items={trending} />

              <div className="mt-4 rounded-2xl bg-ink-900 p-5 text-cream-50">
                <p className="text-xs font-bold uppercase tracking-widest text-cream-50/50">
                  CampusLoop reuse rate
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-2xl font-black">
                    {impact ? `${impact.totalResales} reuses` : "—"}
                  </span>
                  <span>♻️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAMPUS MATCH */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="stitched overflow-hidden rounded-[2rem] bg-forest-900 text-cream-50">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[.85fr_1.15fr] lg:p-12">
            <div>
              <span className="inline-flex rounded-full bg-amber-400/15 px-4 py-2 text-xs font-black tracking-widest text-amber-300">
                ✨ SMART CAMPUS FEATURE
              </span>
              <h2 className="mt-5 font-display text-3xl font-black leading-tight sm:text-4xl">
                Find what you need.
                <span className="block text-forest-200">Not just what's listed.</span>
              </h2>
              <p className="mt-4 max-w-lg leading-7 text-cream-50/60">
                CampusMatch scores every active listing against your budget,
                category, condition, pickup point and urgency — and shows you
                exactly why each result matched.
              </p>
              <div className="mt-7 grid gap-3 text-sm text-cream-50/80">
                <div className="flex items-center gap-3"><span className="rounded-lg bg-white/10 p-2">🎯</span> Explainable match percentage</div>
                <div className="flex items-center gap-3"><span className="rounded-lg bg-white/10 p-2">💰</span> Budget-aware matching</div>
                <div className="flex items-center gap-3"><span className="rounded-lg bg-white/10 p-2">📍</span> Campus pickup matching</div>
              </div>
            </div>

            <div className="rounded-3xl bg-cream-50 p-5 text-ink-900 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-black tracking-wide text-ink-700/50">WHAT DO YOU NEED?</label>
                  <input
                    value={mKeyword}
                    onChange={(e) => setMKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && findMatches()}
                    placeholder="e.g. DBMS book under 400 near library"
                    className="w-full rounded-xl border-2 border-ink-900/10 bg-white px-4 py-3.5 outline-none transition focus:border-forest-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black tracking-wide text-ink-700/50">CATEGORY</label>
                  <select value={mCategory} onChange={(e) => setMCategory(e.target.value)} className="w-full rounded-xl border-2 border-ink-900/10 bg-white px-4 py-3.5 outline-none focus:border-forest-500">
                    <option value="">Any category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black tracking-wide text-ink-700/50">MAX BUDGET</label>
                  <input type="number" min="0" value={mBudget} onChange={(e) => setMBudget(e.target.value)} placeholder="₹ e.g. 500" className="w-full rounded-xl border-2 border-ink-900/10 bg-white px-4 py-3.5 outline-none focus:border-forest-500" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black tracking-wide text-ink-700/50">CONDITION</label>
                  <select value={mCondition} onChange={(e) => setMCondition(e.target.value)} className="w-full rounded-xl border-2 border-ink-900/10 bg-white px-4 py-3.5 outline-none focus:border-forest-500">
                    <option value="">Any condition</option>
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black tracking-wide text-ink-700/50">PICKUP POINT</label>
                  <select value={mLocation} onChange={(e) => setMLocation(e.target.value)} className="w-full rounded-xl border-2 border-ink-900/10 bg-white px-4 py-3.5 outline-none focus:border-forest-500">
                    <option value="">Any location</option>
                    {MEETUPS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-4 sm:col-span-2">
                  <input type="checkbox" checked={mUrgent} onChange={(e) => setMUrgent(e.target.checked)} className="h-5 w-5 accent-forest-600" />
                  <span><b className="block text-sm">🚨 Urgent need</b><small className="text-ink-700/50">Prioritize listings marked urgent.</small></span>
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button onClick={findMatches} disabled={matchLoading} className="flex-1 rounded-xl bg-forest-600 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {matchLoading ? "Finding matches..." : "✨ Find my campus match"}
                </button>
                {(searched || mKeyword || mCategory) && (
                  <button onClick={clearMatch} className="rounded-xl border-2 border-ink-900/10 px-5 py-3.5 font-bold text-ink-700/70 hover:bg-white">
                    Clear
                  </button>
                )}
              </div>

              {searched && !matchLoading && (
                <div className="mt-7 border-t-2 border-dashed border-ink-900/10 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black tracking-widest text-forest-600">MATCH RESULTS</p>
                      <h3 className="mt-1 font-display text-xl font-black">
                        {matches.length} smart match{matches.length === 1 ? "" : "es"}
                      </h3>
                    </div>
                    <span className="rounded-full bg-forest-50 px-3 py-1.5 text-xs font-black text-forest-700">CampusMatch</span>
                  </div>

                  {matches.length > 0 ? (
                    <div className="mt-5 grid gap-4">
                      {matches.map((product) => (
                        <div key={product._id} className="rounded-2xl border-2 border-ink-900/10 p-4 transition hover:border-forest-300 hover:shadow-card">
                          <div className="flex gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-3xl">
                              {CATEGORY_EMOJI[product.category] || "📦"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-display font-black">{product.title}</h4>
                                  <p className="mt-1 text-xs text-ink-700/50">
                                    {product.category} · {product.condition} · 📍 {product.meetupPoint}
                                  </p>
                                </div>
                                <span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-black text-forest-700">
                                  🎯 {product.matchScore}% match
                                </span>
                              </div>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <PriceTag product={product} />
                                <Link to={`/product/${product._id}`} className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-cream-50 hover:bg-forest-600">
                                  View item →
                                </Link>
                              </div>
                              {product.matchReasons?.length > 0 && (
                                <div className="mt-3 rounded-xl bg-forest-50/60 p-3">
                                  <p className="text-[10px] font-black tracking-widest text-ink-700/40">WHY THIS MATCH?</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {product.matchReasons.map((reason, i) => (
                                      <span key={i} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-700 ring-1 ring-ink-900/10">
                                        ✓ {reason}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-white/60 p-6 text-center">
                      <div className="text-3xl">🔎</div>
                      <p className="mt-2 font-bold">No close matches yet</p>
                      <p className="mt-1 text-sm text-ink-700/50">Try a broader keyword, category, or budget.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK TYPES */}
      <section className="border-y-2 border-ink-900/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-4">
          {[
            ["🛍️", "sell", "Buy", "Find useful items"],
            ["🔄", "exchange", "Exchange", "Trade with students"],
            ["🎁", "free", "Free", "Give things away"],
            ["📡", "radar", "Campus Radar", "Browse by location"],
          ].map(([icon, value, title, text]) => (
            <Link
              key={title}
              to={value === "radar" ? "/radar" : `/marketplace?listingType=${value}`}
              className="flex items-center gap-4 rounded-2xl p-4 text-left hover:bg-forest-50"
            >
              <span className="text-3xl">{icon}</span>
              <span>
                <b className="text-ink-900">{title}</b>
                <small className="block text-ink-700/50">{text}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="bg-ink-900 text-cream-50">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-black tracking-widest text-forest-300">BUILT FOR TRUST</p>
              <h2 className="mt-3 font-display text-4xl font-black sm:text-5xl">
                Your campus should feel like a community.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-cream-50/60">
                CampusCart is built around verified students, transparent
                listings, safe campus pickup points, and a trust score that
                grows with every completed exchange.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["🛡️", "Verified students", "College-based accounts"],
                ["⭐", "Trust score", "Build your reputation"],
                ["📍", "Campus pickup", "No shipping hassle"],
                ["♻️", "CampusLoop", "See an item's full journey"],
              ].map(([icon, title, text]) => (
                <div key={title} className="rounded-2xl border border-cream-50/10 bg-white/5 p-6">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-4 font-display font-black">{title}</h3>
                  <p className="mt-1 text-sm text-cream-50/50">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="text-center">
          <p className="font-black tracking-widest text-forest-600">SIMPLE PROCESS</p>
          <h2 className="mt-2 font-display text-4xl font-black text-ink-900">
            From unused to useful.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["01", "List", "Post your unused books, electronics, or hostel items in a minute."],
            ["02", "Connect", "Find a verified student on your campus who needs what you have."],
            ["03", "Exchange", "Meet at a safe campus pickup point, then rate the exchange."],
          ].map(([number, title, text]) => (
            <div key={number} className="stitched rounded-3xl bg-white p-8">
              <span className="font-display text-5xl font-black text-forest-100">{number}</span>
              <h3 className="mt-5 font-display text-2xl font-black text-ink-900">{title}</h3>
              <p className="mt-3 leading-7 text-ink-700/60">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrendingList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products", { params: { sameCollegeOnly: "false" } })
      .then(({ data }) => setProducts(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  if (products.length === 0) {
    return (
      <p className="mt-5 rounded-2xl bg-forest-50 p-6 text-center text-sm text-ink-700/50">
        Login to see live listings from your campus.
      </p>
    );
  }

  return (
    <div className="mt-5 grid gap-3">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="flex items-center gap-4 rounded-2xl border border-ink-900/5 bg-forest-50/60 p-3 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-card"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-2xl">
            {CATEGORY_EMOJI[product.category] || "📦"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink-900">{product.title}</p>
            <p className="mt-1 text-sm text-ink-700/50">
              {product.meetupPoint} · {product.seller?.trustScore ?? 100}% trust
            </p>
          </div>
          <PriceTag product={product} />
        </Link>
      ))}
    </div>
  );
}
