import {
  formatINR,
  formatPercent,
  formatAction,
  formatFailureReason,
  generateAgentDiagnosis,
  getCaseStatusMeta,
} from '../utils/format';

export default function NextBestAction({ topCase, onInvestigate, status = 'action_required' }) {
  if (!topCase) return null;

  const { amount, priority, recovery, leakage } = topCase;
  const statusMeta = getCaseStatusMeta(status);
  const agentDiagnosis = generateAgentDiagnosis(topCase);

  return (
    <section className="next-best-action-section">
      <div className="nba-card-hero">
        <div className="nba-hero-header">
          <div className="nba-tag-row">
            <span className="nba-spotlight-pill">
              <span className="pulse-dot" />
              Next Best Action · Priority Spotlight
            </span>
            <span className={`status-pill ${statusMeta.badgeClass}`}>
              {statusMeta.icon} {statusMeta.label}
            </span>
          </div>

          <div className="nba-hero-title-row">
            <div className="nba-hero-id-group">
              <span className="nba-payment-id">{topCase.payment_id}</span>
              <span className={`priority-badge priority-${priority.priority.toLowerCase()}`}>
                {priority.priority}
              </span>
            </div>
            <div className="nba-hero-amount-group">
              <span className="nba-amount-label">Revenue at Risk</span>
              <span className="nba-amount-value">{formatINR(amount)}</span>
            </div>
          </div>
        </div>

        {/* AI Agent Diagnosis Banner */}
        <div className="nba-diagnosis-box">
          <div className="nba-diagnosis-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z" />
            </svg>
            <span className="nba-diagnosis-title">Agent Diagnosis & Priority Rationale</span>
          </div>
          <p className="nba-diagnosis-text">{agentDiagnosis}</p>
        </div>

        {/* Balanced Metrics Grid */}
        <div className="nba-specs-grid">
          <div className="nba-spec-item">
            <span className="nba-spec-label">Failure Reason</span>
            <span className="nba-spec-value">{formatFailureReason(leakage.reason)}</span>
          </div>

          <div className="nba-spec-item">
            <span className="nba-spec-label">Recommended Playbook</span>
            <span className="nba-spec-value nba-spec-action">
              {formatAction(recovery.recommended_action)}
            </span>
          </div>

          <div className="nba-spec-item highlight-recovery">
            <span className="nba-spec-label">Expected Recovery</span>
            <span className="nba-spec-value recovery-val">
              {formatINR(priority.expected_recovery)}
            </span>
          </div>

          <div className="nba-spec-item">
            <span className="nba-spec-label">Recovery Probability</span>
            <span className="nba-spec-value">{formatPercent(recovery.recovery_probability)}</span>
          </div>

          <div className="nba-spec-item">
            <span className="nba-spec-label">Model Confidence</span>
            <span className="nba-spec-value">{formatPercent(recovery.confidence)}</span>
          </div>

          <div className="nba-spec-item">
            <span className="nba-spec-label">Payment Method</span>
            <span className="nba-spec-value payment-method-tag">
              {topCase.payment_method?.toUpperCase() || 'CARD'}
            </span>
          </div>
        </div>

        <div className="nba-hero-footer">
          <div className="nba-footer-note">
            Highest recoverable revenue opportunity ranked by expected return.
          </div>
          <button
            className="btn-primary btn-hero"
            onClick={() => onInvestigate(topCase)}
            id="investigate-top-case-btn"
          >
            Investigate Case & Playbook
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.8"
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
