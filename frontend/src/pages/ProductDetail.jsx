import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Loader, EmptyState, PriceTag, TypeTag, ConditionDot, TrustBadge } from "../components/Bits";
import { CATEGORY_EMOJI } from "../components/ProductCard";
import CampusLoop from "../components/CampusLoop";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wished, setWished] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError(getErrorMessage(err, "This listing could not be found"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (user) {
      api.get("/wishlist").then(({ data }) => {
        setWished(data.some((item) => item.product?._id === id));
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleWish = async () => {
    if (!user) return showToast("Login to save items to your wishlist");
    try {
      if (wished) {
        await api.delete(`/wishlist/${id}`);
        showToast("Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: id });
        showToast("Added to wishlist ❤️");
      }
      setWished(!wished);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const requestItem = async () => {
    if (!user) return navigate("/login", { state: { from: `/product/${id}` } });
    setRequesting(true);
    try {
      await api.post("/orders", { productId: id });
      showToast(
        product.listingType === "free"
          ? "Pickup request sent 🎁"
          : product.listingType === "exchange"
          ? "Exchange request sent 🔄"
          : "Purchase request sent 🚀"
      );
      load();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not send request"), "error");
    } finally {
      setRequesting(false);
    }
  };

  const handleCart = () => {
    addItem(product);
    showToast("Added to your cart 🛒");
  };

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState
          icon="🕳️"
          title="Listing not found"
          text={error}
          action={
            <Link to="/marketplace" className="mt-5 inline-block rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50">
              Back to marketplace
            </Link>
          }
        />
      </div>
    );
  }

  const isOwner = user && product.seller?._id === user._id;
  const isSold = product.status !== "active";
  const inCart = items.some((item) => item._id === product._id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link to="/marketplace" className="text-sm font-bold text-ink-700/50 hover:text-forest-600">
        ← Back to marketplace
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        {/* IMAGE / EMOJI PANEL */}
        <div className="stitched relative flex h-80 items-center justify-center overflow-hidden rounded-[2rem] bg-forest-50 text-9xl lg:h-[26rem]">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <span className="animate-float-slow">{CATEGORY_EMOJI[product.category] || "📦"}</span>
          )}
          <div className="absolute left-5 top-5"><TypeTag listingType={product.listingType} /></div>
          {product.urgent && (
            <span className="stamp absolute right-5 top-5 rounded-full border-2 border-clay-600 bg-cream-50 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-clay-600">
              Urgent
            </span>
          )}
        </div>

        {/* DETAILS */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-forest-600">
              {product.category}
            </span>
            <ConditionDot condition={product.condition} />
          </div>

          <h1 className="mt-2 font-display text-3xl font-black text-ink-900 sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <PriceTag product={product} />
            {isSold && (
              <span className="rounded-full bg-clay-500/10 px-3 py-1 text-xs font-black text-clay-600">
                {product.status === "sold" ? "Already claimed" : "Reserved"}
              </span>
            )}
          </div>

          <p className="mt-5 leading-7 text-ink-700/70">{product.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 ring-2 ring-ink-900/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-700/40">Pickup</p>
              <b className="text-sm">📍 {product.meetupPoint}</b>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-2 ring-ink-900/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-700/40">College</p>
              <b className="truncate text-sm">🏫 {product.college}</b>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-2 ring-ink-900/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-700/40">Semester</p>
              <b className="text-sm">🗓️ {product.semesterTag}</b>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-2 ring-ink-900/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-700/40">Condition</p>
              <b className="text-sm">{product.condition}</b>
            </div>
          </div>

          {product.listingType === "exchange" && product.exchangeFor && (
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              Looking to trade for: {product.exchangeFor}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-dashed border-ink-900/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 font-display text-lg font-black text-forest-700">
              {product.seller?.name?.[0] || "S"}
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink-900">{product.seller?.name || "Student"}</p>
              <p className="text-xs text-ink-700/50">{product.seller?.college}</p>
            </div>
            <TrustBadge score={product.seller?.trustScore ?? 50} size="lg" />
          </div>

          {!isOwner ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={requestItem}
                disabled={isSold || requesting}
                className="flex-1 rounded-xl bg-forest-600 py-4 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSold
                  ? "No longer available"
                  : requesting
                  ? "Sending request..."
                  : product.listingType === "free"
                  ? "🎁 Request pickup"
                  : product.listingType === "exchange"
                  ? "🔄 Propose exchange"
                  : "🚀 Buy now"}
              </button>

              {product.listingType === "sell" && !isSold && (
                <button
                  onClick={handleCart}
                  disabled={inCart}
                  className="rounded-xl border-2 border-ink-900/10 bg-white px-6 py-4 font-black text-ink-900 hover:bg-forest-50 disabled:opacity-50"
                >
                  {inCart ? "✓ In cart" : "🛒 Add to cart"}
                </button>
              )}

              <button
                onClick={toggleWish}
                className={`rounded-xl border-2 px-6 py-4 font-black transition ${
                  wished ? "border-clay-500 bg-clay-500/10 text-clay-600" : "border-ink-900/10 bg-white text-ink-900 hover:bg-forest-50"
                }`}
              >
                {wished ? "♥ Saved" : "♡ Save"}
              </button>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={`/sell?edit=${product._id}`} className="flex-1 rounded-xl border-2 border-ink-900/10 bg-white py-4 text-center font-black text-ink-900 hover:bg-forest-50">
                ✏️ Edit listing
              </Link>
              <Link to="/orders" className="flex-1 rounded-xl bg-ink-900 py-4 text-center font-black text-cream-50 hover:bg-forest-600">
                View requests →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CAMPUSLOOP */}
      <div className="mt-14">
        <CampusLoop campusLoop={product.campusLoop} />
      </div>
    </div>
  );
}
