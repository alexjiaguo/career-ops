import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import JobList from './components/JobList';
import JobModal from './components/JobModal';

const STATUSES = ['all', 'new', 'evaluated', 'applied', 'interviewing', 'offered', 'rejected', 'discarded'];

export default function App() {
  // ── State ────────────────────────────────────────────────
  const [jds, setJds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('sample');

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJdId, setSelectedJdId] = useState(null);
  const [selectedJd, setSelectedJd] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ── Fetch JDs ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jdsRes, statsRes] = await Promise.all([
        fetch('/api/jds'),
        fetch('/api/stats'),
      ]);

      if (!jdsRes.ok) throw new Error(`API error: ${jdsRes.status}`);
      const jdsData = await jdsRes.json();
      const statsData = await statsRes.json();

      setJds(jdsData.jds || []);
      setSource(jdsData.source || 'sample');
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Open modal with full JD details ──────────────────────
  const openModal = useCallback(async (id) => {
    setSelectedJdId(id);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/jds/${id}`);
      if (!res.ok) throw new Error('Failed to load JD');
      const data = await res.json();
      setSelectedJd(data);
    } catch (err) {
      console.error('Modal load error:', err);
      setSelectedJd(null);
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setSelectedJdId(null);
    setSelectedJd(null);
  }, []);

  // ── Keyboard shortcut to close modal ─────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && selectedJdId) closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedJdId, closeModal]);

  // ── Filter & search logic ────────────────────────────────
  const filteredJds = useMemo(() => {
    let result = jds;

    if (activeFilter !== 'all') {
      result = result.filter((jd) => jd.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (jd) =>
          (jd.title || '').toLowerCase().includes(q) ||
          (jd.company || '').toLowerCase().includes(q) ||
          (jd.location || '').toLowerCase().includes(q) ||
          (jd.archetype || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [jds, activeFilter, searchQuery]);

  // ── Status counts for sidebar ────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: jds.length };
    STATUSES.forEach((s) => {
      if (s !== 'all') counts[s] = 0;
    });
    jds.forEach((jd) => {
      const s = jd.status || 'new';
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [jds]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="app">
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        statusCounts={statusCounts}
        source={source}
      />

      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header__left">
            <h1>Pipeline Dashboard</h1>
            <p>
              {source === 'vault' ? 'Connected to Obsidian Vault' : 'Showing sample data'}&nbsp;·&nbsp;
              {jds.length} total leads
            </p>
          </div>
          <div className="header__search">
            <span className="header__search-icon">🔍</span>
            <input
              id="search-input"
              className="header__search-input"
              type="text"
              placeholder="Search jobs, companies, locations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Stats */}
        {stats && !loading && <StatsBar stats={stats} />}

        {/* Filter Tabs */}
        {!loading && !error && (
          <div className="filter-tabs">
            {STATUSES.filter((s) => s === 'all' || statusCounts[s] > 0).map((status) => (
              <button
                key={status}
                className={`filter-tab ${activeFilter === status ? 'filter-tab--active' : ''}`}
                onClick={() => setActiveFilter(status)}
              >
                {status === 'all' ? 'All Leads' : status}
                {statusCounts[status] > 0 && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>({statusCounts[status]})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Job List */}
        <JobList
          jds={filteredJds}
          loading={loading}
          error={error}
          onRetry={fetchData}
          onCardClick={openModal}
        />
      </main>

      {/* Modal */}
      {selectedJdId && (
        <JobModal
          jd={selectedJd}
          loading={modalLoading}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
