export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

export function formatAction(action) {
  const map = {
    retry_payment: 'Retry Payment',
    retry_later: 'Retry Later',
    request_payment_method_update: 'Update Payment Method',
    manual_investigation: 'Manual Investigation',
  };
  return map[action] || action;
}

export function formatFailureReason(reason) {
  if (!reason) return 'Unknown';
  return reason
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
