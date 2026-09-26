import { useEffect, useState } from "react";
import api from "../api/axios";

const ICON = {
  listed: "📌",
  sold: "🤝",
  wishlisted: "❤️",
  exchanged: "🔄",
};

const VERB = {
  listed: "just listed",
  sold: "just sold",
  wishlisted: "wishlisted",
  exchanged: "exchanged",
};

export default function ActivityTicker() {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      api
        .get("/activity?limit=12")
        .then(({ data }) => mounted && setActivity(data))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (activity.length === 0) return null;

  // duplicate the list so the CSS marquee can loop seamlessly
  const looped = [...activity, ...activity];

  return (
    <div className="overflow-hidden border-y-2 border-ink-900/10 bg-forest-900 py-3">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap px-4">
        {looped.map((item, i) => (
          <span
            key={`${item._id || item.itemName}-${i}`}
            className="flex items-center gap-2 text-sm font-semibold text-cream-50/90"
          >
            <span>{ICON[item.type] || "✨"}</span>
            <b className="text-amber-400">{item.userName}</b>
            {VERB[item.type] || item.type}
            <b>{item.itemName}</b>
            {item.price > 0 && <span className="text-forest-100">₹{item.price}</span>}
            {item.location && (
              <span className="text-cream-50/50">· 📍 {item.location}</span>
            )}
            <span className="text-cream-50/20">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
