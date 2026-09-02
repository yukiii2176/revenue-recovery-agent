from models.payment import Payment


def detect_leakage(payment: Payment):
    if payment.status.lower() == "failed":
        return {
            "is_leakage": True,
            "lost_amount": payment.amount,
            "reason": payment.failure_reason,
            "recoverable": True
        }

    return {
        "is_leakage": False,
        "lost_amount": 0,
        "reason": None,
        "recoverable": False
    }