import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navLinkCls = ({ isActive }) =>
  `font-semibold transition ${
    isActive ? "text-forest-600" : "text-ink-900/60 hover:text-forest-600"
  }`;

export default function Navbar() {
  const [menu, setMenu] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink-900/10 bg-cream-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 rotate-[-4deg] items-center justify-center rounded-2xl bg-forest-600 text-xl text-cream-50 shadow-stamp">
            🎓
          </div>
          <div className="text-left">
            <div className="font-display text-xl font-black tracking-tight text-ink-900">
              CampusCart
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-forest-600">
              The Student Exchange
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" end className={navLinkCls}>
            Home
          </NavLink>
          <NavLink to="/marketplace" className={navLinkCls}>
            Marketplace
          </NavLink>
          <NavLink to="/radar" className={navLinkCls}>
            Campus Radar
          </NavLink>
          {user && (
            <NavLink to="/wishlist" className={navLinkCls}>
              Wishlist
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" className={navLinkCls}>
              Orders
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            to="/cart"
            className="relative rounded-xl px-3 py-2 text-lg hover:bg-forest-50"
          >
            🛒
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay-500 text-[10px] font-black text-white">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/sell"
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-ink-900 shadow-stamp transition hover:bg-amber-400"
              >
                + List item
              </Link>
              <Link
                to="/profile"
                className="rounded-xl border-2 border-ink-900/10 bg-white px-4 py-2.5 text-sm font-bold text-ink-900 hover:bg-forest-50"
              >
                👤 {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-ink-900/50 hover:text-clay-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border-2 border-ink-900/10 bg-white px-4 py-2.5 text-sm font-bold hover:bg-forest-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-forest-600 px-5 py-2.5 text-sm font-black text-cream-50 shadow-stamp hover:bg-forest-700"
              >
                Join Campus
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenu(!menu)}
          className="rounded-xl border-2 border-ink-900/10 px-3 py-2 md:hidden"
        >
          ☰
        </button>
      </div>

      {menu && (
        <div className="border-t-2 border-ink-900/10 bg-cream-50 p-5 md:hidden">
          <div className="grid gap-3">
            <Link onClick={() => setMenu(false)} to="/marketplace" className="rounded-xl bg-white p-3 text-center font-bold">
              Marketplace
            </Link>
            <Link onClick={() => setMenu(false)} to="/radar" className="rounded-xl bg-white p-3 text-center font-bold">
              Campus Radar
            </Link>
            <Link onClick={() => setMenu(false)} to="/cart" className="rounded-xl bg-white p-3 text-center font-bold">
              Cart ({items.length})
            </Link>
            {user ? (
              <>
                <Link onClick={() => setMenu(false)} to="/wishlist" className="rounded-xl bg-white p-3 text-center font-bold">
                  Wishlist
                </Link>
                <Link onClick={() => setMenu(false)} to="/orders" className="rounded-xl bg-white p-3 text-center font-bold">
                  Orders
                </Link>
                <Link onClick={() => setMenu(false)} to="/sell" className="rounded-xl bg-amber-500 p-3 text-center font-black text-ink-900">
                  + List item
                </Link>
                <Link onClick={() => setMenu(false)} to="/profile" className="rounded-xl bg-forest-600 p-3 text-center font-bold text-cream-50">
                  My profile
                </Link>
                <button onClick={handleLogout} className="rounded-xl border-2 border-clay-500 p-3 font-bold text-clay-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setMenu(false)} to="/login" className="rounded-xl border-2 border-ink-900/10 bg-white p-3 text-center font-bold">
                  Login
                </Link>
                <Link onClick={() => setMenu(false)} to="/register" className="rounded-xl bg-forest-600 p-3 text-center font-bold text-cream-50">
                  Join Campus
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
