export default function Header() {
  return (
    <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-surface border-bottom">
      <div className="d-flex align-items-center gap-3">
        <div className="logo-icon text-primary">
          <svg fill="none" viewBox="0 0 48 48" width="32" height="32">
            <path
              fill="currentColor"
              d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
            />
          </svg>
        </div>
        <h2 className="text-white fw-bold mb-0">Gourmet Garden</h2>
      </div>
    </header>
  );
}
