def calculate_priority(amount: float, recovery_probability: float, failure_reason: str = None):

    expected_recovery = amount * recovery_probability

    # Risk/urgency override: fraud requires immediate manual investigation
    if (failure_reason or "").lower() == "fraud_detected":
        priority = "CRITICAL"

    elif expected_recovery >= 10000:
        priority = "CRITICAL"

    elif expected_recovery >= 5000:
        priority = "HIGH"

    elif expected_recovery >= 1000:
        priority = "MEDIUM"

    else:
        priority = "LOW"

    return {
        "priority": priority,
        "expected_recovery": round(expected_recovery, 2)
    }