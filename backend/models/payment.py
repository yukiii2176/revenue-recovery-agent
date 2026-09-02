from pydantic import BaseModel
from typing import Optional


class Payment(BaseModel):
    payment_id: str
    customer_id: str
    amount: float
    status: str
    payment_method: str
    failure_reason: Optional[str] = None