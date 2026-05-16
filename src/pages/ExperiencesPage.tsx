export default function ExperiencesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Experiences</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" opacity="0.25">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            <line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" strokeLinecap="round" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <h2>Coming Soon</h2>
        <p>Experiences management is currently under development.</p>
      </div>
    </div>
  );
}
