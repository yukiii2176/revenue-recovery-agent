export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Math.round(value * 100)}%`;
}

export function formatAction(action) {
  const map = {
    retry_payment: 'Retry Payment',
    retry_later: 'Retry Later',
    request_payment_method_update: 'Update Payment Method',
    manual_investigation: 'Manual Investigation',
  };
  return map[action] || action?.replace(/_/g, ' ') || 'Unknown Action';
}

export function formatFailureReason(reason) {
  if (!reason) return 'Unknown Reason';
  return reason
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatEventName(event) {
  const map = {
    payment_attempt: 'Payment Attempt',
    payment_failure: 'Payment Failure',
    recovery_signal: 'Recovery Signal',
  };
  return map[event] || event?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Event';
}

export function formatEvidenceDesc(desc) {
  if (!desc) return '';
  // Replace raw floats like ₹12500.0 with formatted currency
  let cleaned = desc.replace(/₹(\d+(?:\.\d+)?)/g, (_, num) => formatINR(parseFloat(num)));
  // Replace raw failure reasons like insufficient_funds with title case
  cleaned = cleaned.replace(/because of ([a-z_]+)/g, (_, reason) => `due to ${formatFailureReason(reason)}`);
  return cleaned;
}

export function generateAgentDiagnosis(item) {
  if (!item) return '';
  const reason = (item.leakage?.reason || '').toLowerCase();
  const formattedAmount = formatINR(item.amount);
  const expectedRec = formatINR(item.priority?.expected_recovery || 0);
  const prob = formatPercent(item.recovery?.recovery_probability || 0);

  if (reason === 'fraud_detected') {
    return 'Critical risk detected. Automated recovery is blocked to protect merchant chargeback standing. Manual operations review is required before contacting the customer.';
  }

  if (reason === 'network_error') {
    return `High-confidence recovery (${prob}). The failure was caused by a transient network timeout. An immediate retry has the highest probability of recapturing ${expectedRec} without customer friction.`;
  }

  if (reason === 'insufficient_funds') {
    return `High-value recovery opportunity. Transaction failed due to temporary insufficient funds. Retrying later in sync with standard deposit windows provides an estimated ${expectedRec} in recoverable revenue.`;
  }

  if (reason === 'expired_card') {
    return `Recoverable leakage (${prob}). The customer's card expired; delivering an automated payment method update link is the recommended recovery path for ${formattedAmount}.`;
  }

  if (reason === 'bank_declined') {
    return `Standard issuer decline observed. The recommended retry playbook has a ${prob} recovery probability for this transaction category.`;
  }

  return `Recoverable opportunity. Prioritize this transaction to recover ${expectedRec} based on a ${prob} historical probability.`;
}

export function getProblemDescription(item) {
  if (!item) return '';
  const reason = (item.leakage?.reason || '').toLowerCase();
  const formattedAmount = formatINR(item.amount);

  const problemMap = {
    insufficient_funds: `This transaction of ${formattedAmount} was declined due to temporary insufficient balance on the cardholder account. The customer account is valid and in good standing.`,
    network_error: `This payment of ${formattedAmount} encountered a network timeout during gateway handoff. The customer intended to pay, but authorization could not complete.`,
    expired_card: `This payment of ${formattedAmount} failed because the card on file reached its expiration date. No successful charge can occur until credentials are updated.`,
    bank_declined: `This payment of ${formattedAmount} was declined by the customer's bank during authentication. This typically reflects transient bank-side limits or 3DS verification timeouts.`,
    fraud_detected: `This transaction of ${formattedAmount} triggered automated fraud and velocity safeguards. Automated retries are suspended to prevent chargeback liabilities.`,
  };

  return problemMap[reason] || `This payment of ${formattedAmount} failed due to ${formatFailureReason(reason)}.`;
}

export function getRecoveryRationale(item) {
  if (!item) return '';
  const reason = (item.leakage?.reason || '').toLowerCase();
  const action = item.recovery?.recommended_action;

  const rationaleMap = {
    retry_payment: 'The payment was declined by the bank. Based on the recovery model for this decline category, a retry has an estimated 78% probability of recovery.',
    retry_later: 'Scheduling an automated retry in 24–48 hours maximizes success once payroll or banking account balances refresh.',
    request_payment_method_update: 'Prompting the customer via SMS/Email with a secure 1-click update link allows seamless payment credential renewal.',
    manual_investigation: 'Flagged for operational review. An investigator must verify customer legitimacy before any communication or recovery action.',
  };

  return rationaleMap[action] || rationaleMap[reason] || item.recovery?.explanation || 'Apply standard recovery playbook based on historical success models.';
}

export function getCaseStatusMeta(status) {
  switch (status) {
    case 'recovery_initiated':
      return { label: 'Recovery Initiated', badgeClass: 'status-badge-in-progress', icon: '⚡' };
    case 'manual_review_requested':
      return { label: 'Operations Review Requested', badgeClass: 'status-badge-review', icon: '🛡️' };
    case 'action_required':
    default:
      return { label: 'Action Required', badgeClass: 'status-badge-pending', icon: '⚠️' };
  }
}
