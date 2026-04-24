import JobCard from './JobCard';

export default function JobList({ jds, loading, error, onRetry, onCardClick }) {
  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner" />
        <div className="loading__text">Connecting to pipeline…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-state__icon">⚠️</div>
        <div className="error-state__title">Connection Failed</div>
        <div className="error-state__desc">
          Could not reach the API server. Make sure <code>npm run dev</code> is running.
        </div>
        <button className="error-state__retry" onClick={onRetry}>
          Retry Connection
        </button>
      </div>
    );
  }

  if (jds.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔎</div>
        <div className="empty-state__title">No leads found</div>
        <div className="empty-state__desc">
          Try adjusting the filter or search, or run <code>scan</code> in Career Ops to discover new roles.
        </div>
      </div>
    );
  }

  return (
    <div className="job-grid">
      {jds.map((jd, i) => (
        <JobCard
          key={jd.id}
          jd={jd}
          index={i}
          onClick={() => onCardClick(jd.id)}
        />
      ))}
    </div>
  );
}
