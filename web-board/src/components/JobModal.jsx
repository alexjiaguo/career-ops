import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';

export default function JobModal({ jd, loading, onClose }) {
  const overlayRef = useRef(null);

  // Close on overlay click (not on modal body click)
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="modal">
          <div className="loading" style={{ padding: '80px 0' }}>
            <div className="loading__spinner" />
            <div className="loading__text">Loading job details…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!jd) {
    return (
      <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="modal">
          <div className="empty-state" style={{ padding: '60px 0' }}>
            <div className="empty-state__icon">😕</div>
            <div className="empty-state__title">Could not load job details</div>
            <div className="empty-state__desc">Please try again later.</div>
          </div>
        </div>
      </div>
    );
  }

  const fm = jd.frontmatter || {};
  const status = fm.status || 'new';

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal">
        {/* Header */}
        <div className="modal__header">
          <div className="modal__header-info">
            <div className="modal__company">{fm.company || 'Company'}</div>
            <h2 className="modal__title">{fm.title || 'Untitled Role'}</h2>
            <div className="modal__meta">
              <span className={`pill pill--${status}`}>{status}</span>
              {fm.tier && (
                <span className={`tier-badge tier-badge--${fm.tier}`}>{fm.tier}</span>
              )}
              {fm.location && (
                <span className="modal__meta-item">📍 {fm.location}</span>
              )}
              {fm.score && (
                <span className="modal__meta-item">★ {fm.score}/5</span>
              )}
              {fm.archetype && (
                <span className="modal__meta-item">🏷️ {fm.archetype}</span>
              )}
            </div>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body — Markdown rendered */}
        <div className="modal__body">
          <Markdown>{jd.body || '*No description available.*'}</Markdown>
        </div>

        {/* Footer */}
        <div className="modal__footer">
          {fm.url && (
            <a
              className="modal__btn modal__btn--primary"
              href={fm.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 Open Job Posting
            </a>
          )}
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
