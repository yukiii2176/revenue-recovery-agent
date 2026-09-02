export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#0f62fe" />
              <path
                d="M8 14.5L12 18.5L20 10.5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="header-title">Revenue Recovery Agent</span>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          Live
        </div>
      </div>
    </header>
  );
}
