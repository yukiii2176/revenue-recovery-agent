import { useState } from 'react';
import {
  formatINR,
  formatPercent,
  formatAction,
  formatFailureReason,
  formatEventName,
  formatEvidenceDesc,
  generateAgentDiagnosis,
  getProblemDescription,
  getRecoveryRationale,
  getCaseStatusMeta,
} from '../utils/format';
import { fetchSimulateRecovery } from '../utils/api';
import SimulationResult from './SimulationResult';

export default function InvestigationView({
  item,
  onBack,
  status = 'action_required',
  onUpdateStatus,
}) {
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [inactionOpen, setInactionOpen] = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState(null);

  if (!item) return null;

  const { amount, priority, recovery, investigation, inaction_risk, leakage } = item;
  const isFraudCase =
    (leakage?.reason || '').toLowerCase() === 'fraud_detected' ||
    recovery?.recommended_action === 'manual_investigation';

  const statusMeta = getCaseStatusMeta(status);
  const agentDiagnosis = generateAgentDiagnosis(item);
  const problemDesc = getProblemDescription(item);
  const recoveryRationale = getRecoveryRationale(item);

  async function handleSimulate() {
    setSimLoading(true);
    setSimError(null);
    try {
      const data = await fetchSimulateRecovery();
      setSimulation(data);
    } catch (err) {
      setSimError(err.message);
    } finally {
      setSimLoading(false);
    }
  }

  function handleApplyPlaybook() {
    if (onUpdateStatus) {
      onUpdateStatus(item.payment_id, 'recovery_initiated');
    }
  }

  function handleEscalateOps() {
    if (onUpdateStatus) {
      onUpdateStatus(item.payment_id, 'manual_review_requested');
    }
  }

  return (
    <section className="investigation-view">
      {/* Investigation Top Navigation & Title */}
      <div className="inv-top-bar">
        <button className="btn-back" onClick={onBack} id="back-to-opportunities-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8H3M3 8L7 4M3 8L7 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Recovery Command
        </button>

        <div className="inv-title-container">
          <div className="inv-title-left">
            <span className="inv-eyebrow">Autonomous Case Investigation</span>
            <h2 className="inv-title">{item.payment_id}</h2>
          </div>
          <span className={`status-pill ${statusMeta.badgeClass}`}>
            {statusMeta.icon} {statusMeta.label}
          </span>
        </div>
      </div>

      {/* 1. Detection & Severity Metrics */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 1 · Detection & Severity</span>
        <div className="inv-grid">
          <div className="inv-card">
            <span className="inv-card-label">Amount at Risk</span>
            <span className="inv-card-value text-danger">{formatINR(amount)}</span>
            <span className="inv-card-sub">Transaction amount</span>
          </div>

          <div className="inv-card">
            <span className="inv-card-label">Priority Level</span>
            <div className="inv-card-badge-wrap">
              <span className={`priority-badge priority-${priority.priority.toLowerCase()}`}>
                {priority.priority}
              </span>
            </div>
            <span className="inv-card-sub">Weighted urgency</span>
          </div>

          <div className="inv-card">
            <span className="inv-card-label">Expected Recovery</span>
            <span className="inv-card-value text-success">
              {formatINR(priority.expected_recovery)}
            </span>
            <span className="inv-card-sub">{formatPercent(recovery.recovery_probability)} probability</span>
          </div>

          <div className="inv-card">
            <span className="inv-card-label">Payment Rail & Cust ID</span>
            <span className="inv-card-value font-mono">
              {item.payment_method?.toUpperCase()} · {item.customer_id}
            </span>
            <span className="inv-card-sub">Failure: {formatFailureReason(leakage.reason)}</span>
          </div>
        </div>
      </div>

      {/* 2. Agent Diagnosis & Rationale */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 2 · Agent Diagnosis</span>
        <div className="inv-diagnosis-card">
          <div className="inv-diagnosis-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z" />
            </svg>
            <span className="inv-diagnosis-title">Autonomous Assessment</span>
          </div>
          <p className="inv-diagnosis-body">{agentDiagnosis}</p>
        </div>
      </div>

      {/* 3. Root Cause Problem Analysis */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 3 · Root Cause Investigation</span>
        <div className="inv-section">
          <h3 className="inv-section-title">Why is this revenue at risk?</h3>
          <p className="inv-section-text">{problemDesc}</p>
        </div>
      </div>

      {/* 4. Evidence & Timeline */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 4 · Telemetry Evidence & Signals</span>
        <div className="inv-section">
          <button
            className="collapsible-toggle"
            onClick={() => setEvidenceOpen(!evidenceOpen)}
            id="toggle-evidence-timeline-btn"
          >
            <span className="inv-section-title" style={{ margin: 0 }}>
              Evidence & Timeline ({investigation.evidence?.length || 0} signals)
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`toggle-chevron ${evidenceOpen ? 'open' : ''}`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {evidenceOpen && (
            <div className="evidence-timeline">
              {investigation.evidence.map((ev, i) => (
                <div key={i} className="evidence-item">
                  <div className={`evidence-dot evidence-dot-${ev.status}`} />
                  <div className="evidence-content">
                    <div className="evidence-header-line">
                      <span className="evidence-event">{formatEventName(ev.event)}</span>
                      <span className={`evidence-status-pill pill-${ev.status}`}>{ev.status}</span>
                    </div>
                    <span className="evidence-desc">
                      {formatEvidenceDesc(ev.description)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommended Recovery Action & Confidence */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 5 · Recovery Playbook Recommendation</span>
        <div className="inv-action-card">
          <div className="inv-action-top">
            <div className="inv-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f62fe" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div>
              <span className="inv-action-tag">Recommended Recovery Playbook</span>
              <span className="inv-action-name">{formatAction(recovery.recommended_action)}</span>
            </div>
          </div>

          <p className="inv-action-rationale">{recoveryRationale}</p>

          <div className="inv-confidence-grid">
            <div className="inv-conf-item">
              <span className="inv-conf-label">Recovery Probability</span>
              <span className="inv-conf-value">{formatPercent(recovery.recovery_probability)}</span>
            </div>

            <div className="inv-conf-item">
              <span className="inv-conf-label">Model Confidence</span>
              <span className="inv-conf-value">{formatPercent(recovery.confidence)}</span>
            </div>

            <div className="inv-conf-item">
              <span className="inv-conf-label">Projected Yield</span>
              <span className="inv-conf-value text-success">
                {formatINR(priority.expected_recovery)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. What happens if I do nothing? */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 6 · Financial Inaction Exposure</span>
        <div className="inv-section inaction-section">
          <button
            className="collapsible-toggle"
            onClick={() => setInactionOpen(!inactionOpen)}
            id="toggle-inaction-risk-btn"
          >
            <span className="inv-section-title" style={{ margin: 0, color: 'var(--color-critical)' }}>
              What happens if I do nothing?
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`toggle-chevron ${inactionOpen ? 'open' : ''}`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {inactionOpen && (
            <div className="inaction-body">
              <p className="inaction-narrative">
                If you take no action, the expected recoverable revenue you are giving up is{' '}
                <strong className="text-danger">{formatINR(priority.expected_recovery)}</strong>{' '}
                (out of total {formatINR(amount)} at risk). Delaying recovery increases the risk of losing this recoverable revenue permanently.
              </p>

              <div className="inaction-grid">
                <div className="inaction-stat">
                  <span className="inaction-stat-label">Expected Recoverable Forfeited</span>
                  <span className="inaction-stat-value danger">
                    {formatINR(priority.expected_recovery)}
                  </span>
                  <span className="inaction-stat-sub">Immediate lost opportunity</span>
                </div>

                <div className="inaction-stat">
                  <span className="inaction-stat-label">Total Payment Exposure</span>
                  <span className="inaction-stat-value">
                    {formatINR(amount)}
                  </span>
                  <span className="inaction-stat-sub">Gross uncollected revenue</span>
                </div>

                <div className="inaction-stat">
                  <span className="inaction-stat-label">Agent Inaction Advisory</span>
                  <span className="inaction-stat-value advisory-text">
                    {inaction_risk.recommendation}
                  </span>
                  <span className="inaction-stat-sub">Automated risk verdict</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. Recovery Playbook Execution / Simulation */}
      <div className="inv-sequence-block">
        <span className="sequence-label">Step 7 · Recovery Playbook & Execution</span>
        <div className="inv-section inv-simulate">
          <h3 className="inv-section-title">Playbook Actions</h3>

          {/* FRAUD BRANCH */}
          {isFraudCase ? (
            <div className="fraud-handling-card">
              <div className="fraud-header">
                <span className="fraud-badge">CRITICAL · Manual Investigation Required</span>
              </div>
              <p className="fraud-explanation">
                Automated recovery is blocked because fraud risk was detected on this transaction.
                This case must be reviewed by the merchant risk & operations team before any customer
                contact or payment recovery attempt is initiated.
              </p>

              {status === 'manual_review_requested' ? (
                <div className="execution-confirmation review-confirmed">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div>
                    <span className="exec-title">Operations Review Requested</span>
                    <span className="exec-desc">
                      Case #{item.payment_id} has been escalated to operations for security and identity verification.
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  className="btn-escalate-ops"
                  onClick={handleEscalateOps}
                  id="escalate-ops-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Escalate to Operations
                </button>
              )}
            </div>
          ) : (
            /* NORMAL RECOVERABLE CASE BRANCH */
            <div className="playbook-execution-container">
              {/* Playbook Execution State */}
              {status === 'recovery_initiated' ? (
                <div className="execution-confirmation success-confirmed">
                  <div className="exec-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="exec-details">
                    <span className="exec-title">Recovery Playbook Applied — Simulation</span>
                    <span className="exec-desc">
                      Playbook <strong>{formatAction(recovery.recommended_action)}</strong> is active for {item.payment_id}.
                      Expected recoverable amount of <strong>{formatINR(priority.expected_recovery)}</strong> projected. No real payment was processed.
                    </span>
                    <div className="exec-tags">
                      <span className="exec-tag">Status: Recovery Initiated (Simulation)</span>
                      <span className="exec-tag">Confidence: {formatPercent(recovery.confidence)}</span>
                      <span className="exec-tag">No Real Funds Moved</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="playbook-actions-group">
                  <button
                    className="btn-apply-playbook"
                    onClick={handleApplyPlaybook}
                    id="apply-playbook-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Apply Recovery Playbook — Simulated
                  </button>
                  <span className="playbook-subnote">
                    MVP simulation · Transitions case to simulated recovery pipeline · Does not move real money
                  </span>
                </div>
              )}

              {/* Simulation Option */}
              <div className="simulation-sub-section">
                <div className="sim-trigger-row">
                  <div>
                    <span className="sim-sub-title">Probabilistic Simulation Engine</span>
                    <span className="sim-sub-desc">
                      Project likely recovery outcomes using the agent's recovery probabilities.
                    </span>
                  </div>

                  {!simulation && (
                    <button
                      className="btn-outline-sim"
                      onClick={handleSimulate}
                      disabled={simLoading}
                      id="simulate-recovery-btn"
                    >
                      {simLoading ? 'Simulating...' : 'Simulate Recovery Projection'}
                    </button>
                  )}
                </div>

                {simError && <p className="error-text">{simError}</p>}
                {simulation && (
                  <SimulationResult
                    data={simulation}
                    paymentId={item.payment_id}
                    isFraud={isFraudCase}
                    targetCase={item}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
