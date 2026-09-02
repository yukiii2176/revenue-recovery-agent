import { formatINR } from '../utils/format';

export default function SimulationResult({ data, paymentId }) {
  if (!data) return null;

  const action = data.actions.find((a) => a.payment_id === paymentId);

  return (
    <div className="simulation-result">
      <div className="sim-header">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="#16a34a" strokeWidth="2" />
          <path d="M6 10L9 13L14 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sim-title">Simulation Complete</span>
      </div>

      <div className="sim-section">
        <span className="sim-section-label">This Payment</span>
        {action ? (
          <div className="sim-card">
            <div className="sim-card-row">
              <span className="sim-label">Outcome</span>
              <span className={`sim-outcome sim-outcome-${action.outcome}`}>
                {action.outcome === 'recovered' ? 'Recovered' : 'Recovery Failed'}
              </span>
            </div>
            <div className="sim-card-row">
              <span className="sim-label">Amount</span>
              <span className="sim-value">{formatINR(action.amount)}</span>
            </div>
            <div className="sim-card-row">
              <span className="sim-label">Expected Recovery</span>
              <span className="sim-value">{formatINR(action.expected_recovery)}</span>
            </div>
            {action.recovered_amount > 0 && (
              <div className="sim-card-row">
                <span className="sim-label">Recovered Amount</span>
                <span className="sim-value success">{formatINR(action.recovered_amount)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="sim-no-match">This payment was not part of the simulation.</p>
        )}
      </div>

      <div className="sim-section">
        <span className="sim-section-label">All Eligible Cases</span>
        <div className="sim-summary">
          <div className="sim-summary-item">
            <span className="sim-summary-label">Total Cases Simulated</span>
            <span className="sim-summary-value">{data.total_cases}</span>
          </div>
          <div className="sim-summary-item">
            <span className="sim-summary-label">Total Expected Recovery</span>
            <span className="sim-summary-value">{formatINR(data.expected_recovery)}</span>
          </div>
          <div className="sim-summary-item">
            <span className="sim-summary-label">Simulated Recovered</span>
            <span className="sim-summary-value success">
              {formatINR(data.simulated_recovered_amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
