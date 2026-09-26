import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Loader } from "../components/Bits";

const CATEGORIES = ["Books", "Electronics", "Lab Equipment", "Furniture", "Clothing", "Sports", "Stationery", "Other"];
const CONDITIONS = ["New", "Like New", "Used", "Heavily Used"];
const MEETUPS = ["Library", "Main Gate", "Hostel Block A", "Hostel Block B", "Canteen", "Academic Block", "Sports Complex", "Other"];

const EMPTY = {
  title: "", description: "", category: "Books", listingType: "sell",
  price: "", exchangeFor: "", condition: "Like New", meetupPoint: "Library", urgent: false,
};
const IMAGE_MAP = {
  "Engineering Mathematics Books": "/images/products/engineering-mathematics-books.png",
  "Scientific Calculator": "/images/products/scientific-calculator.png",
  "DBMS Textbook Exchange": "/images/products/dbms-textbook.png",
  "Study Lamp": "/images/products/study-lamp.png",
  "College Backpack": "/images/products/college-backpack.png",
  "Lab Coat": "/images/products/lab-coat.png",
  "Data Structures Textbook": "/images/products/data-structures-textbook.png",
  "Python Programming Book": "/images/products/python-programming-book.png",
  "Wireless Mouse": "/images/products/wireless-mouse.png",
  "USB Keyboard": "/images/products/usb-keyboard.png",
  "College Hoodie": "/images/products/college-hoodie.png",
  "Hostel Table Fan": "/images/products/hostel-table-fan.png",
  "Drawing Sheet Pack": "/images/products/drawing-sheet-pack.png",
  "Operating Systems Book": "/images/products/operating-systems-book.png",
  "Arduino Project Kit": "/images/products/arduino-project-kit.png",
  "College Shoes": "/images/products/college-shoes.png",
  "Hostel Mattress": "/images/products/hostel-mattress.png",
  "Java Programming Notes": "/images/products/java-programming-notes.png",
};

export default function Sell() {
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!editId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editId) return;
    api.get(`/products/${editId}`).then(({ data }) => {
      setForm({
        title: data.title, description: data.description, category: data.category,
        listingType: data.listingType, price: data.price || "", exchangeFor: data.exchangeFor || "",
        condition: data.condition, meetupPoint: data.meetupPoint, urgent: data.urgent,
      });
    }).catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
  ...form,
  price: form.listingType === "sell" ? Number(form.price) || 0 : 0,
  images: IMAGE_MAP[form.title] ? [IMAGE_MAP[form.title]] : [],
};
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        showToast("Listing updated ✏️");
      } else {
        await api.post("/products", payload);
        showToast("Your item is now listed 🎉");
      }
      navigate("/my-listings");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save this listing"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${editId}`);
      showToast("Listing deleted");
      navigate("/my-listings");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  if (loading) return <Loader label="Loading listing..." />;

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <p className="font-black tracking-widest text-forest-600">{editId ? "EDIT LISTING" : "NEW LISTING"}</p>
      <h1 className="mt-2 font-display text-3xl font-black text-ink-900">
        {editId ? "Update your item" : "Give your unused item a second life"}
      </h1>
      <p className="mt-2 text-ink-700/60">Fill in the details so your campus can find it.</p>

      <form onSubmit={handleSubmit} className="stitched mt-8 space-y-4 rounded-[2rem] bg-white p-7 shadow-card">
        <input
          required value={form.title} onChange={update("title")} placeholder="Item title"
          className="w-full rounded-xl border-2 border-ink-900/10 p-3 outline-none focus:border-forest-500"
        />
        <textarea
          required value={form.description} onChange={update("description")} placeholder="Describe the item, its condition, and anything a buyer should know"
          rows={4}
          className="w-full rounded-xl border-2 border-ink-900/10 p-3 outline-none focus:border-forest-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.listingType} onChange={update("listingType")} className="rounded-xl border-2 border-ink-900/10 p-3 outline-none">
            <option value="sell">For sale</option>
            <option value="exchange">Exchange</option>
            <option value="free">Free</option>
          </select>
          <select value={form.category} onChange={update("category")} className="rounded-xl border-2 border-ink-900/10 p-3 outline-none">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {form.listingType === "sell" && (
          <input
            type="number" min="0" value={form.price} onChange={update("price")} placeholder="Price ₹"
            className="w-full rounded-xl border-2 border-ink-900/10 p-3 outline-none focus:border-forest-500"
          />
        )}

        {form.listingType === "exchange" && (
          <input
            value={form.exchangeFor} onChange={update("exchangeFor")} placeholder="What would you like in exchange?"
            className="w-full rounded-xl border-2 border-ink-900/10 p-3 outline-none focus:border-forest-500"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <select value={form.condition} onChange={update("condition")} className="rounded-xl border-2 border-ink-900/10 p-3 outline-none">
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.meetupPoint} onChange={update("meetupPoint")} className="rounded-xl border-2 border-ink-900/10 p-3 outline-none">
            {MEETUPS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-clay-500/5 p-4">
          <input type="checkbox" checked={form.urgent} onChange={update("urgent")} className="h-5 w-5 accent-clay-600" />
          <span><b className="block text-sm">🚨 Mark as urgent</b><small className="text-ink-700/50">Urgent listings are shown first in the marketplace.</small></span>
        </label>

        <button disabled={submitting} className="w-full rounded-xl bg-forest-600 py-3.5 font-black text-cream-50 shadow-stamp transition hover:bg-forest-700 disabled:opacity-60">
          {submitting ? "Saving..." : editId ? "Save changes" : "Publish listing 🚀"}
        </button>

        {editId && (
          <button type="button" onClick={handleDelete} className="w-full rounded-xl border-2 border-clay-500 py-3 font-bold text-clay-600 hover:bg-clay-500/5">
            Delete listing
          </button>
        )}
      </form>
    </div>
  );
}
