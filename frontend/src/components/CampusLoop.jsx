const TX_LABEL = {
  initial_listing: "First listed",
  sale: "Bought",
  exchange: "Exchanged",
  giveaway: "Given away",
};

const TX_ICON = {
  initial_listing: "📌",
  sale: "💸",
  exchange: "🔄",
  giveaway: "🎁",
};

// Rough, campus-relatable estimate of what one reuse avoids sending to a landfill.
const CO2_PER_LOOP_KG = 2.5;

export default function CampusLoop({ campusLoop }) {
  const history = campusLoop?.ownershipHistory || [];
  const resaleCount = campusLoop?.resaleCount || 0;

  if (history.length === 0) return null;

  const co2Saved = (resaleCount * CO2_PER_LOOP_KG).toFixed(1);

  return (
    <div className="stitched relative overflow-hidden rounded-3xl bg-forest-900 p-6 text-cream-50 sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-blob bg-forest-700/50" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-black tracking-widest text-amber-300">
          ♻️ CAMPUSLOOP · OWNERSHIP JOURNEY
        </span>

        <h3 className="mt-4 font-display text-2xl font-black">
          This item's life on campus
        </h3>
        <p className="mt-1 max-w-lg text-sm text-cream-50/60">
          Every CampusCart listing carries its full history — so you know
          exactly how many students have already given it a second life.
        </p>

        <div className="ledger-scroll mt-6 flex gap-4 overflow-x-auto pb-2">
          {history.map((entry, i) => (
            <div key={i} className="flex shrink-0 items-center gap-4">
              <div className="w-36 rounded-2xl border border-cream-50/15 bg-white/5 p-4">
                <div className="text-2xl">{TX_ICON[entry.transactionType] || "📦"}</div>
                <p className="mt-2 text-xs font-black uppercase tracking-wide text-amber-300">
                  {TX_LABEL[entry.transactionType] || entry.transactionType}
                </p>
                <p className="mt-1 truncate text-sm font-bold">
                  {entry.owner?.name || "Student"}
                </p>
                {entry.acquiredAt && (
                  <p className="mt-1 text-[10px] text-cream-50/40">
                    {new Date(entry.acquiredAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              {i < history.length - 1 && (
                <span className="text-xl text-cream-50/30">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:w-80">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-cream-50/50">
              Times reused
            </p>
            <b className="font-display text-2xl">{resaleCount}</b>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-cream-50/50">
              Est. waste avoided
            </p>
            <b className="font-display text-2xl text-forest-100">{co2Saved}kg</b>
          </div>
        </div>
      </div>
    </div>
  );
}
