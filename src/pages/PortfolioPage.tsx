export default function PortfolioPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Portfolio</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" opacity="0.25">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h2>Coming Soon</h2>
        <p>Portfolio management is currently under development.</p>
      </div>
    </div>
  );
}
