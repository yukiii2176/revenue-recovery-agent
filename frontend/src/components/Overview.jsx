import { formatINR } from '../utils/format';

export default function Overview({ summary, inProgressCount = 0 }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Revenue at Risk',
      value: formatINR(summary.revenue_at_risk),
      subtitle: 'Total failed transactions',
      className: 'metric-danger',
    },
    {
      label: 'Expected Recovery',
      value: formatINR(summary.expected_recovery),
      subtitle: 'Weighted probabilistic yield',
      className: 'metric-success',
    },
    {
      label: 'Active Cases',
      value: inProgressCount > 0 ? `${summary.total_cases - inProgressCount} Open (${inProgressCount} in play)` : summary.total_cases,
      subtitle: `${summary.recoverable_cases} recoverable opportunities`,
      className: 'metric-neutral',
    },
    {
      label: 'Loss if Ignored',
      value: formatINR(summary.expected_recovery),
      subtitle: 'Recoverable revenue forfeited without action',
      className: 'metric-warning',
    },
  ];

  return (
    <section className="overview">
      <div className="overview-header-row">
        <h2 className="section-label">Revenue Recovery Command</h2>
        <span className="overview-badge">Autonomous Pipeline Active</span>
      </div>
      <div className="metrics-grid">
        {cards.map((card) => (
          <div key={card.label} className={`metric-card ${card.className}`}>
            <span className="metric-label">{card.label}</span>
            <span className="metric-value">{card.value}</span>
            <span className="metric-subtitle">{card.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
