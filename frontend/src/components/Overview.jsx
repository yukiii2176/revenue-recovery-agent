import { formatINR } from '../utils/format';

export default function Overview({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Revenue at Risk',
      value: formatINR(summary.revenue_at_risk),
      className: 'metric-danger',
    },
    {
      label: 'Expected Recovery',
      value: formatINR(summary.expected_recovery),
      className: 'metric-success',
    },
    {
      label: 'Active Cases',
      value: summary.total_cases,
      className: 'metric-neutral',
    },
    {
      label: 'Expected Loss if Ignored',
      value: formatINR(summary.expected_loss_if_ignored),
      className: 'metric-warning',
    },
  ];

  return (
    <section className="overview">
      <h2 className="section-label">Overview</h2>
      <div className="metrics-grid">
        {cards.map((card) => (
          <div key={card.label} className={`metric-card ${card.className}`}>
            <span className="metric-label">{card.label}</span>
            <span className="metric-value">{card.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
