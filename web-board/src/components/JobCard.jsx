export default function JobCard({ jd, index, onClick }) {
  const status = jd.status || 'new';
  const delay = Math.min(index * 60, 400);

  return (
    <article
      className="job-card"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Header: title + tier */}
      <div className="job-card__header">
        <div>
          <div className="job-card__company">{jd.company || 'Unknown'}</div>
          <div className="job-card__title">{jd.title || 'Untitled Role'}</div>
        </div>
        {jd.tier && (
          <span className={`tier-badge tier-badge--${jd.tier}`}>{jd.tier}</span>
        )}
      </div>

      {/* Meta: location, archetype, status */}
      <div className="job-card__meta">
        {jd.location && (
          <span className="job-card__location">📍 {jd.location}</span>
        )}
        {jd.archetype && (
          <span className="job-card__archetype">{jd.archetype}</span>
        )}
        <span className={`pill pill--${status}`}>{status}</span>
      </div>

      {/* Footer: score + date */}
      <div className="job-card__footer">
        <div className="job-card__score">
          {jd.score ? (
            <>
              <span className="job-card__score-value">★ {jd.score}</span>
              <span className="job-card__score-label">/ 5</span>
            </>
          ) : (
            <span className="job-card__score-label">Not scored</span>
          )}
        </div>
        {jd.date_discovered && (
          <span className="job-card__date">{jd.date_discovered}</span>
        )}
      </div>
    </article>
  );
}
