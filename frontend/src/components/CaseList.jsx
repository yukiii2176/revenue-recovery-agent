import { useState } from 'react';
import { formatINR, formatAction, formatFailureReason } from '../utils/format';

function CaseRow({ item, onInvestigate }) {
  return (
    <div className="case-row">
      <div className="case-row-left">
        <span className="case-row-id">{item.payment_id}</span>
        <span className={`priority-badge priority-${item.priority.priority.toLowerCase()}`}>
          {item.priority.priority}
        </span>
      </div>
      <div className="case-row-center">
        <span className="case-row-issue">
          {formatFailureReason(item.leakage.reason)}
        </span>
        <span className="case-row-action">
          {formatAction(item.recovery.recommended_action)}
        </span>
      </div>
      <div className="case-row-right">
        <span className="case-row-amount">{formatINR(item.amount)}</span>
        <button
          className="btn-link"
          onClick={() => onInvestigate(item)}
        >
          View
        </button>
      </div>
    </div>
  );
}

export default function CaseList({ cases, onInvestigate }) {
  const [expanded, setExpanded] = useState(false);

  if (!cases || cases.length === 0) return null;

  return (
    <section className="case-list">
      <button className="case-list-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="section-label" style={{ margin: 0 }}>
          Other Cases ({cases.length})
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`toggle-chevron ${expanded ? 'open' : ''}`}
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
      {expanded && (
        <div className="case-list-body">
          {cases.map((item) => (
            <CaseRow
              key={item.payment_id}
              item={item}
              onInvestigate={onInvestigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
