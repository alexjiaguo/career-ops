const NAV_ITEMS = [
  { key: 'all', icon: '📋', label: 'All Leads' },
  { key: 'new', icon: '✨', label: 'New' },
  { key: 'evaluated', icon: '🔍', label: 'Evaluated' },
  { key: 'applied', icon: '📤', label: 'Applied' },
  { key: 'interviewing', icon: '🎯', label: 'Interviewing' },
  { key: 'offered', icon: '🎉', label: 'Offered' },
  { key: 'rejected', icon: '⛔', label: 'Rejected' },
];

export default function Sidebar({ activeFilter, onFilterChange, statusCounts, source }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">C</div>
        <div>
          <div className="sidebar__title">Career Ops</div>
          <div className="sidebar__subtitle">Job Pipeline</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Pipeline</div>
        {NAV_ITEMS.map(({ key, icon, label }) => {
          const count = statusCounts[key] || 0;
          if (key !== 'all' && count === 0) return null;

          return (
            <div
              key={key}
              className={`sidebar__nav-item ${activeFilter === key ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => onFilterChange(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onFilterChange(key)}
            >
              <span className="sidebar__nav-icon">{icon}</span>
              <span>{label}</span>
              {count > 0 && <span className="sidebar__nav-count">{count}</span>}
            </div>
          );
        })}
      </nav>

      {/* Footer / Data Source */}
      <div className="sidebar__footer">
        <div className="sidebar__source">
          <span
            className={`sidebar__source-dot ${
              source === 'vault' ? 'sidebar__source-dot--vault' : 'sidebar__source-dot--sample'
            }`}
          />
          <span>
            {source === 'vault' ? 'Obsidian Vault Connected' : 'Sample Data Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
}
