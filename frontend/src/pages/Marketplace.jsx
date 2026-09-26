import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ProductCard from "../components/ProductCard";
import { Loader, EmptyState } from "../components/Bits";

const CATEGORIES = [
  "All",
  "Books",
  "Electronics",
  "Lab Equipment",
  "Furniture",
  "Clothing",
  "Sports",
  "Stationery",
  "Other",
];

const PER_PAGE = 9;

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(params.get("keyword") || "");
  const [category, setCategory] = useState(
    params.get("category") || "All"
  );
  const [listingType, setListingType] = useState(
    params.get("listingType") || "All"
  );
  const [sameCollegeOnly, setSameCollegeOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const query = {};

      if (search.trim()) {
        query.keyword = search.trim();
      }

      if (category !== "All") {
        query.category = category;
      }

      if (listingType !== "All") {
        query.listingType = listingType;
      }

      query.sameCollegeOnly = sameCollegeOnly ? "true" : "false";

      const { data } = await api.get("/products", {
        params: query,
      });

      setProducts(data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not load the marketplace")
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }

    try {
      const { data } = await api.get("/wishlist");

      setWishlistIds(
        new Set(
          data
            .map((item) => item.product?._id)
            .filter(Boolean)
        )
      );
    } catch {
      // silently ignore - wishlist icons just won't be pre-filled
    }
  };

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, category, listingType, sameCollegeOnly]);

  // Fetch wishlist whenever user changes
  useEffect(() => {
    fetchWishlist();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reset pagination whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, listingType, sameCollegeOnly]);

  // Toggle wishlist
  const toggleWish = async (product) => {
    if (!user) {
      showToast("Login to save items to your wishlist");
      return;
    }

    const isWished = wishlistIds.has(product._id);

    try {
      if (isWished) {
        await api.delete(`/wishlist/${product._id}`);

        setWishlistIds((current) => {
          const next = new Set(current);
          next.delete(product._id);
          return next;
        });

        showToast("Removed from wishlist");
      } else {
        await api.post("/wishlist", {
          productId: product._id,
        });

        setWishlistIds((current) => {
          return new Set(current).add(product._id);
        });

        showToast("Added to wishlist ❤️");
      }
    } catch (err) {
      showToast(
        getErrorMessage(err, "Wishlist update failed"),
        "error"
      );
    }
  };

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(products.length / PER_PAGE)
  );

  const pageItems = useMemo(
    () =>
      products.slice(
        (page - 1) * PER_PAGE,
        page * PER_PAGE
      ),
    [products, page]
  );

  // Search
  const runSearch = (e) => {
    e?.preventDefault();

    fetchProducts();

    const newParams = {};

    if (search.trim()) {
      newParams.keyword = search.trim();
    }

    if (category !== "All") {
      newParams.category = category;
    }

    if (listingType !== "All") {
      newParams.listingType = listingType;
    }

    setParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setListingType("All");
    setSameCollegeOnly(false);
    setParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-black tracking-widest text-forest-600">
            CAMPUS MARKETPLACE
          </p>

          <h1 className="mt-2 font-display text-4xl font-black text-ink-900">
            What do you need?
          </h1>

          <p className="mt-2 text-ink-700/60">
            Everything useful, already around your campus.
          </p>
        </div>
      </div>

      {/* Search */}
      <form
        onSubmit={runSearch}
        className="mt-8 flex items-center rounded-2xl border-2 border-ink-900/10 bg-white p-2 shadow-card"
      >
        <span className="px-3 text-xl">🔍</span>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books, calculators, hostel items..."
          className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"
        />

        <button
          type="submit"
          className="rounded-xl bg-ink-900 px-5 py-3 font-bold text-cream-50"
        >
          Search
        </button>
      </form>

      {/* Categories */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              category === item
                ? "bg-forest-600 text-cream-50"
                : "bg-white text-ink-700/70 ring-2 ring-ink-900/10 hover:bg-forest-50"
            }`}
          >
            {item}
          </button>
        ))}

        {/* Listing Type */}
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className="rounded-full border-2 border-ink-900/10 bg-white px-5 py-2.5 text-sm font-bold outline-none"
        >
          <option value="All">All types</option>
          <option value="sell">For sale</option>
          <option value="exchange">Exchange</option>
          <option value="free">Free</option>
        </select>

        {/* Same College */}
        {user && (
          <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-700/70 ring-2 ring-ink-900/10">
            <input
              type="checkbox"
              checked={sameCollegeOnly}
              onChange={(e) =>
                setSameCollegeOnly(e.target.checked)
              }
              className="h-4 w-4 accent-forest-600"
            />

            My college only
          </label>
        )}
      </div>

      {/* Result count */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-700/50">
          {loading
            ? "Loading..."
            : `Showing ${
                products.length === 0
                  ? 0
                  : (page - 1) * PER_PAGE + 1
              }-${Math.min(
                page * PER_PAGE,
                products.length
              )} of ${products.length} items`}
        </p>

        {(search ||
          category !== "All" ||
          listingType !== "All" ||
          sameCollegeOnly) && (
          <button
            onClick={clearFilters}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink-700/70 ring-2 ring-ink-900/10 hover:bg-forest-50"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && <Loader />}

      {/* Error */}
      {!loading && error && (
        <EmptyState
          icon="⚠️"
          title="Couldn't load listings"
          text={error}
        />
      )}

      {/* No products */}
      {!loading &&
        !error &&
        pageItems.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No items found"
            text="Try another search, category or listing type."
            action={
              <button
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-forest-600 px-5 py-3 font-bold text-cream-50"
              >
                Show all items
              </button>
            }
          />
        )}

      {/* Products */}
      {!loading &&
        !error &&
        pageItems.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                wished={wishlistIds.has(product._id)}
                onToggleWish={toggleWish}
              />
            ))}
          </div>
        )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
            className="rounded-xl border-2 border-ink-900/10 bg-white px-5 py-3 font-bold text-ink-700 shadow-stamp transition hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-11 w-11 rounded-xl font-bold transition ${
                  page === p
                    ? "bg-forest-600 text-cream-50 shadow-stamp"
                    : "border-2 border-ink-900/10 bg-white text-ink-700 hover:bg-forest-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            className="rounded-xl bg-ink-900 px-5 py-3 font-bold text-cream-50 transition hover:bg-forest-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
