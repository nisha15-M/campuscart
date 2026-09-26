import { useState } from "react";
import { Link } from "react-router-dom";
import { PriceTag, TypeTag, ConditionDot } from "./Bits";

export const CATEGORY_EMOJI = {
  Books: "📚",
  Electronics: "🔌",
  "Lab Equipment": "🧪",
  Furniture: "🪑",
  Clothing: "👕",
  Sports: "🏸",
  Stationery: "✏️",
  Other: "📦",
};

export default function ProductCard({
  product,
  wished,
  onToggleWish,
  compact = false,
}) {
  const resales = product.campusLoop?.resaleCount || 0;
  const image = product.images?.[0];

  // Track whether the image actually failed to load, so we can
  // fall back to the emoji instead of showing a broken image / huge alt text.
  const [imgError, setImgError] = useState(false);

  const showImage = image && !imgError;

  return (
    <article className="group ticket-stub stitched relative overflow-hidden rounded-3xl bg-white transition hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-forest-50">
        {showImage ? (
          <img
            src={image}
            alt={product.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="animate-float-slow text-7xl">
            {CATEGORY_EMOJI[product.category] || "📦"}
          </span>
        )}

        {onToggleWish && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWish(product);
            }}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-stamp transition ${
              wished ? "text-clay-600" : "text-ink-900/40 hover:text-clay-500"
            }`}
            aria-label="Toggle wishlist"
          >
            {wished ? "♥" : "♡"}
          </button>
        )}

        <div className="absolute left-3 top-3">
          <TypeTag listingType={product.listingType} />
        </div>

        {product.urgent && (
          <span className="stamp absolute bottom-3 left-3 rounded-full border-2 border-clay-600 bg-cream-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-clay-600">
            Urgent
          </span>
        )}

        {resales > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink-900/90 px-2.5 py-1 text-[10px] font-black text-cream-50">
            ♻️ {resales}× reused
          </span>
        )}
      </div>

      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-forest-600">
            {product.category}
          </span>
          <ConditionDot condition={product.condition} />
        </div>

        <h3 className="mt-2 line-clamp-1 font-display text-lg font-bold text-ink-900">
          {product.title}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <PriceTag product={product} />
          {product.seller?.trustScore != null && (
            <span className="text-xs font-bold text-forest-600">
              🛡️ {product.seller.trustScore}%
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink-900/10 pt-3 text-xs text-ink-700/70">
          <span className="truncate">👤 {product.seller?.name || "Student"}</span>
          <span>📍 {product.meetupPoint}</span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="mt-4 block rounded-xl bg-ink-900 py-3 text-center text-sm font-bold text-cream-50 transition group-hover:bg-forest-600"
        >
          View item →
        </Link>
      </div>
    </article>
  );
}
