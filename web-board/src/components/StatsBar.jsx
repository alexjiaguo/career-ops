export default function StatsBar({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      modifier: 'total',
      label: 'Total Leads',
      value: stats.total,
      sub: `from ${stats.source === 'vault' ? 'Obsidian vault' : 'sample data'}`,
    },
    {
      modifier: 'evaluated',
      label: 'Evaluated',
      value: stats.byStatus?.evaluated || 0,
      sub: stats.byStatus?.new ? `${stats.byStatus.new} awaiting review` : 'all reviewed',
    },
    {
      modifier: 'applied',
      label: 'In Progress',
      value: (stats.byStatus?.applied || 0) + (stats.byStatus?.interviewing || 0),
      sub: stats.byStatus?.interviewing ? `${stats.byStatus.interviewing} interviewing` : 'no active interviews',
    },
    {
      modifier: 'score',
      label: 'Avg Score',
      value: stats.avgScore ? `${stats.avgScore}/5` : '—',
      sub: stats.byTier?.['Tier 1'] ? `${stats.byTier['Tier 1']} Tier 1 roles` : 'no scores yet',
    },
  ];

  return (
    <div className="stats-bar">
      {cards.map((card) => (
        <div key={card.modifier} className={`stat-card stat-card--${card.modifier}`}>
          <div className="stat-card__label">{card.label}</div>
          <div className="stat-card__value">{card.value}</div>
          <div className="stat-card__sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
