from models.payment import Payment


def investigate_payment(payment: Payment):

    evidence = [
        {
            "event": "payment_attempt",
            "description": f"Payment of ₹{payment.amount} was attempted.",
            "status": "observed"
        },
        {
            "event": "payment_failure",
            "description": f"Payment failed because of {payment.failure_reason}.",
            "status": "failure"
        }
    ]

    if payment.failure_reason == "bank_declined":
        evidence.append({
            "event": "recovery_signal",
            "description": "Bank decline detected. A retry may recover the payment.",
            "status": "actionable"
        })

    return {
        "evidence_count": len(evidence),
        "evidence": evidence
    }