import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-brz-line bg-brz-charcoal">
      <div className="h-1.5 checker-flag" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={56} />
              <span className="font-display text-xl font-bold uppercase tracking-wider text-brz-white">
                Team <span className="text-brz-red">Brz</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-brz-mute">
              A riding family for people who love two wheels — tours,
              meetups, gear, and the road ahead.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-2 font-display uppercase tracking-wide text-brz-white">
                Club
              </p>
              <ul className="space-y-1.5 text-brz-mute">
                <li>
                  <a href="/events" className="hover:text-brz-red">
                    Events
                  </a>
                </li>
                <li>
                  <a href="/members" className="hover:text-brz-red">
                    Members
                  </a>
                </li>
                <li>
                  <a href="/register" className="hover:text-brz-red">
                    Join
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-display uppercase tracking-wide text-brz-white">
                Marketplace
              </p>
              <ul className="space-y-1.5 text-brz-mute">
                <li>
                  <a
                    href="/marketplace?type=BIKE"
                    className="hover:text-brz-red"
                  >
                    Bikes
                  </a>
                </li>
                <li>
                  <a
                    href="/marketplace?type=ACCESSORY"
                    className="hover:text-brz-red"
                  >
                    Accessories
                  </a>
                </li>
                <li>
                  <a
                    href="/marketplace/new"
                    className="hover:text-brz-red"
                  >
                    Sell an item
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-display uppercase tracking-wide text-brz-white">
                Feeds
              </p>
              <ul className="space-y-1.5 text-brz-mute">
                <li>
                  <a href="/feed.xml" className="hover:text-brz-red">
                    Events RSS
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-xs text-brz-mute">
          © {new Date().getFullYear()} Team Brz. Ride safe, ride together.
        </p>
      </div>
    </footer>
  );
}
