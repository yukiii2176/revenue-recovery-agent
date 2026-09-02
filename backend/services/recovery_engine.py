from models.payment import Payment


def assess_recovery(payment: Payment):

    reason = (payment.failure_reason or "").lower()

    if reason == "bank_declined":
        return {
            "recommended_action": "retry_payment",
            "recovery_probability": 0.78,
            "confidence": 0.91,
            "explanation": "The bank declined the payment. A retry may successfully recover the transaction."
        }

    elif reason == "insufficient_funds":
        return {
            "recommended_action": "retry_later",
            "recovery_probability": 0.65,
            "confidence": 0.86,
            "explanation": "The customer may succeed after funds are available."
        }

    elif reason == "expired_card":
        return {
            "recommended_action": "request_payment_method_update",
            "recovery_probability": 0.72,
            "confidence": 0.89,
            "explanation": "The customer's payment method needs to be updated before another attempt."
        }

    elif reason == "network_error":
        return {
            "recommended_action": "retry_payment",
            "recovery_probability": 0.90,
            "confidence": 0.94,
            "explanation": "The failure appears temporary, so an automatic retry is recommended."
        }

    elif reason == "fraud_detected":
        return {
            "recommended_action": "manual_investigation",
            "recovery_probability": 0.10,
            "confidence": 0.96,
            "explanation": "The payment should not be retried automatically because fraud was detected."
        }

    else:
        return {
            "recommended_action": "manual_investigation",
            "recovery_probability": 0.30,
            "confidence": 0.50,
            "explanation": "The failure reason is unknown, so manual investigation is recommended."
        }