import { useState } from 'react';
import {
  formatINR,
  formatAction,
  formatFailureReason,
  getCaseStatusMeta,
} from '../utils/format';

function CaseRow({ item, onInvestigate, status = 'action_required' }) {
  const statusMeta = getCaseStatusMeta(status);

  return (
    <div className="case-row">
      <div className="case-row-left">
        <span className="case-row-id">{item.payment_id}</span>
        <span className={`priority-badge priority-${item.priority.priority.toLowerCase()}`}>
          {item.priority.priority}
        </span>
        <span className={`status-pill-small ${statusMeta.badgeClass}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="case-row-center">
        <span className="case-row-issue">
          {formatFailureReason(item.leakage.reason)}
        </span>
        <span className="case-row-action">
          Rec: {formatAction(item.recovery.recommended_action)}
        </span>
      </div>

      <div className="case-row-right">
        <div className="case-row-amounts">
          <span className="case-row-amount">{formatINR(item.amount)}</span>
          <span className="case-row-expected">
            Exp: {formatINR(item.priority.expected_recovery)}
          </span>
        </div>
        <button
          className="btn-outline-sm"
          onClick={() => onInvestigate(item)}
          id={`view-case-${item.payment_id}`}
        >
          Investigate
        </button>
      </div>
    </div>
  );
}

export default function CaseList({ cases, onInvestigate, caseStatuses = {} }) {
  const [expanded, setExpanded] = useState(true);

  if (!cases || cases.length === 0) return null;

  const criticalCases = cases.filter(
    (item) => item.priority?.priority === 'CRITICAL'
  );

  const otherCases = cases.filter(
    (item) => item.priority?.priority !== 'CRITICAL'
  );

  return (
    <>
      {criticalCases.length > 0 && (
        <section className="critical-case-section">
          <div className="critical-case-header">
            <div>
              <span className="section-label critical-label">
                CRITICAL CASES REQUIRING ATTENTION
              </span>
              <p className="critical-case-hint">
                Manual investigation is required before recovery action.
              </p>
            </div>
          </div>

          <div className="critical-case-body">
            {criticalCases.map((item) => (
              <CaseRow
                key={item.payment_id}
                item={item}
                onInvestigate={onInvestigate}
                status={caseStatuses[item.payment_id] || 'action_required'}
              />
            ))}
          </div>
        </section>
      )}

      {otherCases.length > 0 && (
        <section className="case-list">
          <button
            className="case-list-toggle"
            onClick={() => setExpanded(!expanded)}
            id="toggle-other-cases-btn"
          >
            <div className="case-list-toggle-left">
              <span className="section-label" style={{ margin: 0 }}>
                Other Recovery Opportunities ({otherCases.length})
              </span>
              <span className="case-list-hint">
                Ranked by expected recovery value
              </span>
            </div>

            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              className={`toggle-chevron ${expanded ? 'open' : ''}`}
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

          {expanded && (
            <div className="case-list-body">
              {otherCases.map((item) => (
                <CaseRow
                  key={item.payment_id}
                  item={item}
                  onInvestigate={onInvestigate}
                  status={caseStatuses[item.payment_id] || 'action_required'}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}