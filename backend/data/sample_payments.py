from models.payment import Payment


sample_payments = [
    Payment(
        payment_id="pay_001",
        customer_id="cust_101",
        amount=499.0,
        status="failed",
        payment_method="card",
        failure_reason="bank_declined"
    ),

    Payment(
        payment_id="pay_002",
        customer_id="cust_102",
        amount=12500.0,
        status="failed",
        payment_method="card",
        failure_reason="insufficient_funds"
    ),

    Payment(
        payment_id="pay_003",
        customer_id="cust_103",
        amount=2500.0,
        status="failed",
        payment_method="card",
        failure_reason="expired_card"
    ),

    Payment(
        payment_id="pay_004",
        customer_id="cust_104",
        amount=8500.0,
        status="failed",
        payment_method="upi",
        failure_reason="network_error"
    ),

    Payment(
        payment_id="pay_005",
        customer_id="cust_105",
        amount=15000.0,
        status="failed",
        payment_method="card",
        failure_reason="fraud_detected"
    ),

    Payment(
        payment_id="pay_006",
        customer_id="cust_106",
        amount=750.0,
        status="failed",
        payment_method="upi",
        failure_reason="bank_declined"
    )
]