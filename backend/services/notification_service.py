from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from models.all_models import Notification, EmailLog, AuditLog

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notif_type: str = "GENERAL"
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def log_email(
    db: Session,
    recipient_email: str,
    subject: str,
    body: str,
    template_name: Optional[str] = "SYSTEM_NOTICE",
    sender_id: Optional[int] = None
) -> EmailLog:
    """
    Simulated development mode email logger to avoid hardcoding external SMTP credentials.
    Saves complete log into database email_logs.
    """
    log_entry = EmailLog(
        sender_id=sender_id,
        recipient_email=recipient_email,
        subject=subject,
        body=body,
        template_name=template_name,
        sent_at=datetime.utcnow(),
        status="SIMULATED_SENT"
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
