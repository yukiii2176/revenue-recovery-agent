import { formatINR, formatPercent, formatAction, formatFailureReason } from '../utils/format';

export default function NextBestAction({ topCase, onInvestigate }) {
  if (!topCase) return null;

  const { amount, priority, recovery, leakage } = topCase;

  return (
    <section className="next-best-action">
      <h2 className="section-label">Next Best Action</h2>
      <div className="nba-card">
        <div className="nba-header">
          <div className="nba-payment-info">
            <span className="nba-payment-id">{topCase.payment_id}</span>
            <span className={`priority-badge priority-${priority.priority.toLowerCase()}`}>
              {priority.priority}
            </span>
          </div>
          <span className="nba-amount">{formatINR(amount)}</span>
        </div>

        <div className="nba-body">
          <div className="nba-detail">
            <span className="nba-detail-label">Issue</span>
            <span className="nba-detail-value">
              {formatFailureReason(leakage.reason)}
            </span>
          </div>
          <div className="nba-detail">
            <span className="nba-detail-label">Action</span>
            <span className="nba-detail-value">{formatAction(recovery.recommended_action)}</span>
          </div>
          <div className="nba-detail">
            <span className="nba-detail-label">Expected Recovery</span>
            <span className="nba-detail-value nba-recovery">
              {formatINR(priority.expected_recovery)}
            </span>
          </div>
          <div className="nba-detail">
            <span className="nba-detail-label">Recovery Probability</span>
            <span className="nba-detail-value">{formatPercent(recovery.recovery_probability)}</span>
          </div>
          <div className="nba-detail">
            <span className="nba-detail-label">Confidence</span>
            <span className="nba-detail-value">{formatPercent(recovery.confidence)}</span>
          </div>
        </div>

        <div className="nba-footer">
          <button className="btn-primary" onClick={() => onInvestigate(topCase)}>
            Investigate case
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 6 }}>
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
