
from fastapi import FastAPI
from models.payment import Payment
from services.leakage_detector import detect_leakage
from services.recovery_engine import assess_recovery
from services.priority_engine import calculate_priority
from services.investigation_engine import investigate_payment
from services.risk_engine import calculate_inaction_risk
from data.sample_payments import sample_payments
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Revenue Recovery Agent is running!"}


@app.post("/payments")
def create_payment(payment: Payment):
    leakage = detect_leakage(payment)
    recovery = assess_recovery(payment)
    priority = calculate_priority(
        payment.amount,
        recovery["recovery_probability"],
        payment.failure_reason
    )
    investigation = investigate_payment(payment)
    inaction_risk =  calculate_inaction_risk(
        payment.amount,
        recovery["recovery_probability"]
    )
    return {
        "message": "Payment received",
        "payment": payment,
        "leakage":leakage,
        "recovery" : recovery,
        "priority" : priority,
        "investigation" : investigation,
        "inaction_risk" : inaction_risk
    }
@app.post("/investigate")
def investigate_payment_endpoint(payment: Payment):

    leakage = detect_leakage(payment)

    recovery = assess_recovery(payment)

    priority = calculate_priority(
        payment.amount,
        recovery["recovery_probability"],
        payment.failure_reason
    )

    investigation = investigate_payment(payment)

    inaction_risk = calculate_inaction_risk(
        payment.amount,
        recovery["recovery_probability"]
    )

    return {
        "payment": payment,
        "leakage": leakage,
        "recovery": recovery,
        "priority": priority,
        "investigation": investigation,
        "inaction_risk": inaction_risk
    }
@app.get("/investigate-all")
def investigate_all_payments():

    results = []

    total_revenue_at_risk = 0
    total_expected_recovery = 0
    total_expected_loss = 0
    recoverable_cases = 0

    for payment in sample_payments:

        leakage = detect_leakage(payment)

        recovery = assess_recovery(payment)

        priority = calculate_priority(
            payment.amount,
            recovery["recovery_probability"],
            payment.failure_reason
        )

        investigation = investigate_payment(payment)

        inaction_risk = calculate_inaction_risk(
            payment.amount,
            recovery["recovery_probability"]
        )

        total_revenue_at_risk += payment.amount

        total_expected_recovery += (
            payment.amount * recovery["recovery_probability"]
        )

        total_expected_loss += (
            inaction_risk["expected_loss_if_ignored"]
        )

        if leakage["recoverable"]:
            recoverable_cases += 1

        results.append({
            "payment_id": payment.payment_id,
            "customer_id": payment.customer_id,
            "amount": payment.amount,
            "leakage": leakage,
            "recovery": recovery,
            "priority": priority,
            "investigation": investigation,
            "inaction_risk": inaction_risk
        })

    results.sort(
        key=lambda x: x["priority"]["expected_recovery"],
        reverse=True
    )

    return {
        "summary": {
            "total_cases": len(results),
            "revenue_at_risk": round(total_revenue_at_risk, 2),
            "expected_recovery": round(total_expected_recovery, 2),
            "expected_loss_if_ignored": round(total_expected_loss, 2),
            "recoverable_cases": recoverable_cases,
            "top_opportunity": {
                "payment_id": results[0]["payment_id"],
                "amount": results[0]["amount"],
                "expected_recovery": results[0]["priority"]["expected_recovery"],
                "recommended_action": results[0]["recovery"]["recommended_action"]
            }
        },
        "cases": results
    }
@app.get("/recovery-plan")
def recovery_plan():

    actions = []
    total_expected_recovery = 0

    for payment in sample_payments:

        leakage = detect_leakage(payment)
        recovery = assess_recovery(payment)

        if not leakage["recoverable"]:
            continue

        # Do not automatically recover suspicious payments
        if recovery["recommended_action"] == "manual_investigation":
            continue

        expected_recovery = (
            payment.amount * recovery["recovery_probability"]
        )

        actions.append({
            "payment_id": payment.payment_id,
            "customer_id": payment.customer_id,
            "amount": payment.amount,
            "action": recovery["recommended_action"],
            "expected_recovery": round(expected_recovery, 2),
            "confidence": recovery["confidence"],
            "reason": recovery["explanation"]
        })

        total_expected_recovery += expected_recovery

    actions.sort(
        key=lambda x: x["expected_recovery"],
        reverse=True
    )

    return {
        "message": "Recovery plan generated",
        "total_actions": len(actions),
        "total_expected_recovery": round(total_expected_recovery, 2),
        "recommended_actions": actions
    }
@app.get("/simulate-recovery")
def simulate_recovery():

    actions = []
    total_expected_recovery = 0
    total_recovered = 0

    for payment in sample_payments:

        leakage = detect_leakage(payment)
        recovery = assess_recovery(payment)

        if not leakage["recoverable"]:
            continue

        if recovery["recommended_action"] == "manual_investigation":
            continue

        expected_recovery = (
            payment.amount * recovery["recovery_probability"]
        )

        # Simulate whether recovery succeeds
        if recovery["recovery_probability"] >= 0.8:
            outcome = "recovered"
            recovered_amount = payment.amount
        else:
            outcome = "recovery_failed"
            recovered_amount = 0

        actions.append({
            "payment_id": payment.payment_id,
            "action": recovery["recommended_action"],
            "amount": payment.amount,
            "expected_recovery": round(expected_recovery, 2),
            "outcome": outcome,
            "recovered_amount": recovered_amount
        })

        total_expected_recovery += expected_recovery
        total_recovered += recovered_amount

    return {
        "message": "Recovery simulation completed",
        "total_cases": len(actions),
        "expected_recovery": round(total_expected_recovery, 2),
        "simulated_recovered_amount": round(total_recovered, 2),
        "actions": actions
    }