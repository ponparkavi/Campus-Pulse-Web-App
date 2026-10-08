from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from models.all_models import AuditLog

def log_audit(
    db: Session,
    action: str,
    entity: str,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    entity_id: Optional[str] = None,
    description: Optional[str] = None
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id is not None else None,
        description=description,
        timestamp=datetime.utcnow()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
