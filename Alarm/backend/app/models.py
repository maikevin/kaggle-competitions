from sqlalchemy import Boolean, Column, Integer, String, Time, JSON
from .database import Base


class Alarm(Base):
    """Database model for alarms"""
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Alarm")
    time = Column(String, nullable=False)  # Format: "HH:MM"
    enabled = Column(Boolean, default=True)
    repeat_days = Column(JSON, default=list)  # List of days: [0-6] where 0=Sunday
    sound = Column(String, default="default")  # Sound file name or "default"
    snooze_enabled = Column(Boolean, default=True)
    snooze_duration = Column(Integer, default=5)  # Minutes
    vibrate = Column(Boolean, default=True)
