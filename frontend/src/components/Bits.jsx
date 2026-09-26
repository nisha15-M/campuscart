// A handful of tiny, shared presentational components kept together
// so pages don't need a dozen one-line imports.

export function TrustBadge({ score = 50, size = "sm" }) {
  const level =
    score >= 90 ? "forest" : score >= 70 ? "amber" : "clay";
  const palette = {
    forest: "bg-forest-50 text-forest-700 ring-forest-200",
    amber: "bg-amber-50 text-amber-600 ring-amber-200",
    clay: "bg-clay-500/10 text-clay-600 ring-clay-500/30",
  }[level];
  const pad = size === "lg" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-black ring-1 ${palette} ${pad}`}
    >
      🛡️ {score}% trust
    </span>
  );
}

export function TypeTag({ listingType }) {
  const config = {
    sell: { label: "For sale", cls: "bg-ink-900 text-cream-50" },
    free: { label: "Free", cls: "bg-forest-600 text-cream-50" },
    exchange: { label: "Exchange", cls: "bg-amber-500 text-ink-900" },
  }[listingType] || { label: listingType, cls: "bg-ink-900 text-cream-50" };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black tracking-wide ${config.cls}`}
    >
      {config.label}
    </span>
  );
}

export function Loader({ label = "Loading campus listings..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-forest-700">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest-200 border-t-forest-600" />
      <p className="font-bold">{label}</p>
    </div>
  );
}

export function EmptyState({ icon = "🔍", title, text, action }) {
  return (
    <div className="stitched rounded-3xl bg-white/70 p-14 text-center">
      <div className="text-5xl">{icon}</div>
      <h3 className="mt-4 font-display text-xl font-black text-ink-900">
        {title}
      </h3>
      {text && <p className="mt-2 text-ink-700/70">{text}</p>}
      {action}
    </div>
  );
}

export function PriceTag({ product }) {
  if (product.listingType === "free") {
    return <b className="font-display text-2xl text-forest-600">FREE</b>;
  }
  if (product.listingType === "exchange") {
    return (
      <b className="font-display text-lg text-amber-600">
        ↔ {product.exchangeFor ? `For: ${product.exchangeFor}` : "Exchange"}
      </b>
    );
  }
  return (
    <b className="font-display text-2xl text-forest-600">
      ₹{product.price?.toLocaleString("en-IN")}
    </b>
  );
}

export function ConditionDot({ condition }) {
  const color =
    {
      New: "bg-forest-500",
      "Like New": "bg-forest-400",
      Used: "bg-amber-500",
      "Heavily Used": "bg-clay-500",
    }[condition] || "bg-ink-700";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700/70">
      <span className={`h-2 w-2 rounded-full ${color}`} /> {condition}
    </span>
  );
}
