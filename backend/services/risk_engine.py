def calculate_inaction_risk(
    amount: float,
    recovery_probability: float
):

    expected_recovery = amount * recovery_probability
    potential_loss = amount

    return {
        "potential_loss": round(potential_loss, 2),
        "expected_recovery": round(expected_recovery, 2),
        "expected_loss_if_ignored": round(
            potential_loss - expected_recovery, 2
        ),
        "recommendation": (
            "Take recovery action"
            if recovery_probability >= 0.5
            else "Investigation required before recovery"
        )
    }