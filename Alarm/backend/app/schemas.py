from pydantic import BaseModel, Field
from typing import List, Optional


class AlarmBase(BaseModel):
    """Base alarm schema"""
    title: str = "Alarm"
    time: str = Field(..., pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")  # HH:MM format
    enabled: bool = True
    repeat_days: List[int] = Field(default_factory=list)  # 0=Sunday, 1=Monday, etc.
    sound: str = "default"
    snooze_enabled: bool = True
    snooze_duration: int = Field(default=5, ge=1, le=60)  # 1-60 minutes
    vibrate: bool = True


class AlarmCreate(AlarmBase):
    """Schema for creating a new alarm"""
    pass


class AlarmUpdate(BaseModel):
    """Schema for updating an alarm (all fields optional)"""
    title: Optional[str] = None
    time: Optional[str] = Field(None, pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    enabled: Optional[bool] = None
    repeat_days: Optional[List[int]] = None
    sound: Optional[str] = None
    snooze_enabled: Optional[bool] = None
    snooze_duration: Optional[int] = Field(None, ge=1, le=60)
    vibrate: Optional[bool] = None


class Alarm(AlarmBase):
    """Schema for returning alarm data"""
    id: int

    class Config:
        from_attributes = True
