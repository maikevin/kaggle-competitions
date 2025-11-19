from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Alarm API",
    description="Backend API for managing alarms",
    version="1.0.0"
)

# Configure CORS for mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your mobile app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Alarm API is running"}


@app.post("/alarms/", response_model=schemas.Alarm)
def create_alarm(alarm: schemas.AlarmCreate, db: Session = Depends(get_db)):
    """Create a new alarm"""
    db_alarm = models.Alarm(**alarm.model_dump())
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    return db_alarm


@app.get("/alarms/", response_model=List[schemas.Alarm])
def get_alarms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all alarms"""
    alarms = db.query(models.Alarm).offset(skip).limit(limit).all()
    return alarms


@app.get("/alarms/{alarm_id}", response_model=schemas.Alarm)
def get_alarm(alarm_id: int, db: Session = Depends(get_db)):
    """Get a specific alarm by ID"""
    alarm = db.query(models.Alarm).filter(models.Alarm.id == alarm_id).first()
    if alarm is None:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return alarm


@app.put("/alarms/{alarm_id}", response_model=schemas.Alarm)
def update_alarm(
    alarm_id: int,
    alarm_update: schemas.AlarmUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing alarm"""
    db_alarm = db.query(models.Alarm).filter(models.Alarm.id == alarm_id).first()
    if db_alarm is None:
        raise HTTPException(status_code=404, detail="Alarm not found")

    # Update only provided fields
    update_data = alarm_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_alarm, field, value)

    db.commit()
    db.refresh(db_alarm)
    return db_alarm


@app.delete("/alarms/{alarm_id}")
def delete_alarm(alarm_id: int, db: Session = Depends(get_db)):
    """Delete an alarm"""
    db_alarm = db.query(models.Alarm).filter(models.Alarm.id == alarm_id).first()
    if db_alarm is None:
        raise HTTPException(status_code=404, detail="Alarm not found")

    db.delete(db_alarm)
    db.commit()
    return {"message": "Alarm deleted successfully"}


@app.patch("/alarms/{alarm_id}/toggle", response_model=schemas.Alarm)
def toggle_alarm(alarm_id: int, db: Session = Depends(get_db)):
    """Toggle alarm enabled/disabled state"""
    db_alarm = db.query(models.Alarm).filter(models.Alarm.id == alarm_id).first()
    if db_alarm is None:
        raise HTTPException(status_code=404, detail="Alarm not found")

    db_alarm.enabled = not db_alarm.enabled
    db.commit()
    db.refresh(db_alarm)
    return db_alarm
