import { formatINR, formatPercent } from '../utils/format';

export default function SimulationResult({ data, paymentId, isFraud = false, targetCase = null }) {
  if (!data && !isFraud) return null;

  const action = data?.actions?.find((a) => a.payment_id === paymentId);

  const probValue = targetCase?.recovery?.recovery_probability;
  const probFormatted = probValue !== undefined ? formatPercent(probValue) : null;
  const expectedValue = action?.expected_recovery ?? targetCase?.priority?.expected_recovery;
  const expectedFormatted = expectedValue !== undefined ? formatINR(expectedValue) : null;

  return (
    <div className="simulation-result-card">
      <div className="sim-header">
        <div className="sim-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <span className="sim-title">Recovery Simulation Projection</span>
          <span className="sim-subtitle">Forward-looking probabilistic simulation</span>
        </div>
      </div>

      {/* Primary Section: THIS PAYMENT */}
      <div className="sim-primary-box">
        <div className="sim-section-tag">Target Case Analysis · {paymentId}</div>
        {action ? (
          <>
            <div className="sim-metrics-row">
              <div className="sim-metric-block">
                <span className="sim-label">Simulated Scenario Outcome</span>
                <span className={`sim-outcome-pill ${action.outcome === 'recovered' ? 'outcome-success' : 'outcome-failed'}`}>
                  {action.outcome === 'recovered' ? 'Recovered in This Simulation Run' : 'No Recovery in This Simulation Run'}
                </span>
              </div>

              <div className="sim-metric-block">
                <span className="sim-label">Transaction Amount</span>
                <span className="sim-val">{formatINR(action.amount)}</span>
              </div>

              <div className="sim-metric-block">
                <span className="sim-label">Expected Recovery Value</span>
                <span className="sim-val recovery-highlight">{formatINR(action.expected_recovery)}</span>
              </div>

              <div className="sim-metric-block">
                <span className="sim-label">Simulated Scenario Yield</span>
                <span className={`sim-val ${action.recovered_amount > 0 ? 'text-success' : 'text-neutral'}`}>
                  {formatINR(action.recovered_amount)}
                </span>
              </div>
            </div>

            <div className="sim-scenario-note">
              This is one simulated outcome. The agent's estimated recovery probability remains{' '}
              <strong>{probFormatted || '65%'}</strong>, with an expected recovery value of{' '}
              <strong>{expectedFormatted || formatINR(action.expected_recovery)}</strong>.
            </div>
          </>
        ) : isFraud ? (
          <div className="sim-blocked-notice">
            <span className="sim-notice-title">Automated Simulation Excluded</span>
            <p className="sim-notice-desc">
              This case was excluded from automated recovery simulation because it is classified as a fraud risk. Programmatic retries are blocked to protect merchant chargeback metrics.
            </p>
          </div>
        ) : (
          <p className="sim-no-match">This transaction was not processed by the automated simulation engine.</p>
        )}
      </div>

      {/* Secondary Section: ALL ELIGIBLE CASES */}
      {data && (
        <div className="sim-secondary-box">
          <div className="sim-section-tag">Portfolio-Wide Benchmark (All Eligible Recoverable Cases)</div>
          <div className="sim-portfolio-grid">
            <div className="sim-portfolio-item">
              <span className="sim-portfolio-label">Eligible Cases Simulated</span>
              <span className="sim-portfolio-val">{data.total_cases}</span>
            </div>

            <div className="sim-portfolio-item">
              <span className="sim-portfolio-label">Portfolio Expected Recovery</span>
              <span className="sim-portfolio-val">{formatINR(data.expected_recovery)}</span>
            </div>

            <div className="sim-portfolio-item">
              <span className="sim-portfolio-label">Projected Recovered Yield</span>
              <span className="sim-portfolio-val text-success">
                {formatINR(data.simulated_recovered_amount)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="sim-disclaimer">
        Simulation note: This model projects outcome probabilities based on decline reason and payment rails. No actual funds have moved or been charged.
      </div>
    </div>
  );
}
