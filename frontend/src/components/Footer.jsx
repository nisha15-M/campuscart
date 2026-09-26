export default function Footer() {
  return (
    <footer className="border-t-2 border-ink-900/10 bg-cream-50">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center">
        <div>
          <b className="font-display text-lg text-ink-900">🎓 CampusCart</b>
          <p className="mt-1 text-sm text-ink-700/60">
            Your campus. Your marketplace. Every item gets a second life.
          </p>
        </div>
        <p className="text-sm text-ink-700/50">
          © 2026 CampusCart · CodeAlpha Internship Project
        </p>
      </div>
    </footer>
  );
}
