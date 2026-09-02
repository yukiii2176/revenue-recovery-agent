import { useState } from 'react';
import { formatINR, formatPercent, formatAction, formatFailureReason } from '../utils/format';
import { fetchSimulateRecovery } from '../utils/api';
import SimulationResult from './SimulationResult';

export default function InvestigationView({ item, onBack }) {
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [inactionOpen, setInactionOpen] = useState(true);
  const [simulation, setSimulation] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState(null);

  if (!item) return null;

  const { amount, priority, recovery, investigation, inaction_risk, leakage } = item;

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

  return (
    <section className="investigation-view">
      <div className="inv-header">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8H3M3 8L7 4M3 8L7 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to opportunities
        </button>
        <h2 className="inv-title">Investigation: {item.payment_id}</h2>
      </div>

      <div className="inv-grid">
        <div className="inv-card">
          <span className="inv-card-label">Payment Amount</span>
          <span className="inv-card-value">{formatINR(amount)}</span>
        </div>
        <div className="inv-card">
          <span className="inv-card-label">Priority</span>
          <span className={`priority-badge priority-${priority.priority.toLowerCase()}`}>
            {priority.priority}
          </span>
        </div>
        <div className="inv-card">
          <span className="inv-card-label">Recovery Probability</span>
          <span className="inv-card-value">{formatPercent(recovery.recovery_probability)}</span>
        </div>
        <div className="inv-card">
          <span className="inv-card-label">Confidence</span>
          <span className="inv-card-value">{formatPercent(recovery.confidence)}</span>
        </div>
      </div>

      <div className="inv-section">
        <h3 className="inv-section-title">Why is this payment at risk?</h3>
        <p className="inv-section-text">
          This payment of <strong>{formatINR(amount)}</strong> failed due to{' '}
          <strong>{formatFailureReason(leakage.reason)}</strong>.{' '}
          {recovery.explanation}
        </p>
      </div>

      <div className="inv-section">
        <h3 className="inv-section-title">Recommended Recovery Action</h3>
        <div className="inv-action-card">
          <div className="inv-action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#0f62fe" strokeWidth="2" />
              <path d="M12 8V12L15 15" stroke="#0f62fe" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="inv-action-name">{formatAction(recovery.recommended_action)}</span>
            <span className="inv-action-desc">{recovery.explanation}</span>
          </div>
        </div>
      </div>

      <div className="inv-section">
        <button
          className="collapsible-toggle"
          onClick={() => setEvidenceOpen(!evidenceOpen)}
        >
          Evidence & Timeline
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
              strokeWidth="1.5"
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
                  <span className="evidence-event">{ev.event.replace(/_/g, ' ')}</span>
                  <span className="evidence-desc">{ev.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="inv-section inaction-section">
        <button
          className="collapsible-toggle"
          onClick={() => setInactionOpen(!inactionOpen)}
        >
          What happens if I do nothing?
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
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {inactionOpen && (
          <div className="inaction-body">
            <div className="inaction-grid">
              <div className="inaction-stat">
                <span className="inaction-stat-label">Potential Loss</span>
                <span className="inaction-stat-value danger">
                  {formatINR(inaction_risk.potential_loss)}
                </span>
              </div>
              <div className="inaction-stat inaction-stat--loss">
                <span className="inaction-stat-label">Expected Loss if Ignored</span>
                <span className="inaction-stat-value danger">
                  {formatINR(inaction_risk.expected_loss_if_ignored)}
                </span>
              </div>
              <div className="inaction-stat">
                <span className="inaction-stat-label">Recommendation</span>
                <span className="inaction-stat-value">
                  {inaction_risk.recommendation}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="inv-section inv-simulate">
        <h3 className="inv-section-title">Recovery Action</h3>
        {!simulation && (
          <button
            className="btn-primary btn-large"
            onClick={handleSimulate}
            disabled={simLoading}
          >
            {simLoading ? 'Simulating...' : 'Simulate Recovery'}
          </button>
        )}
        {simError && <p className="error-text">{simError}</p>}
        {simulation && <SimulationResult data={simulation} paymentId={item.payment_id} />}
      </div>
    </section>
  );
}
