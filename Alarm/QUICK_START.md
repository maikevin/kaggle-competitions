# Quick Start Guide - Web App

Get your Alarm web app running in 2 minutes!

## Prerequisites

- **Node.js** (v16+): [Download here](https://nodejs.org/)
- **Python** (v3.8+): [Download here](https://www.python.org/)

---

## Step 1: Start Backend (Terminal 1)

Open **Git Bash** or **Command Prompt** and run:

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
# OR
venv\Scripts\activate.bat         # Windows CMD
# OR
source venv/bin/activate          # Mac/Linux

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend running:** http://localhost:8000
📚 **API docs:** http://localhost:8000/docs

---

## Step 2: Start Web App (Terminal 2)

Open a **NEW terminal** and run:

```bash
cd mobile
npm install
npm run web
```

✅ **Web app running:** http://localhost:8081

---

## Step 3: Open Browser

Go to: **http://localhost:8081**

🎉 **Your alarm app is live!**

---

## Quick Commands (Next Time)

**Terminal 1 - Backend:**
```bash
cd backend && source venv/Scripts/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd mobile && npm run web
```

---

## Features Available

- ✅ Create/Edit/Delete alarms
- ✅ Digital clock time picker (00:00 - 23:59)
- ✅ Repeat on specific days (Sun-Sat)
- ✅ Multiple alarm sounds (select 1-10+ songs)
- ✅ Sound preview button (▶️ icon)
- ✅ Test alarm button (🔔 triggers in 5 seconds)
- ✅ Adjustable font sizes (Settings)
- ✅ Snooze configuration

---

## How to Use

1. **Create Alarm:** Click the purple "+" button → Set time → Pick songs → Save
2. **Edit Alarm:** Click the pencil ✏️ icon on any alarm card
3. **Toggle On/Off:** Use the switch on each alarm
4. **Preview Sound:** Click the play ▶️ button to hear the alarm sound
5. **Test Alarm:** Click the green 🔔 button (alarm fires in 5 seconds!)
6. **Delete:** Click the trash 🗑️ icon

---

## Troubleshooting

### Port Already in Use?

**Backend (Port 8000):**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
Then update `mobile/src/services/apiService.ts` to use port 8001.

**Frontend (Port 8081):**
```bash
npx expo start --web --port 8082
```

### Can't See Alarms?

1. Check backend is running: http://localhost:8000/docs
2. Check browser console (F12) for errors
3. Verify API URL in `mobile/src/services/apiService.ts` (should be `http://localhost:8000`)

### Module Not Found?

```bash
cd backend
pip install -r requirements.txt
```

---

## Adding Custom Alarm Sounds

1. Place `.mp3` or `.wav` file in `mobile/assets/sounds/`
2. Edit `mobile/src/services/musicLibraryService.ts`
3. Add to `AVAILABLE_SOUNDS` array:
   ```typescript
   {
     filename: 'MySong.mp3',
     displayName: 'My Song',
     duration: '3:45',
     durationSeconds: 225
   },
   ```
4. Restart web app

---

## Project Structure

```
Alarm/
├── backend/                    # FastAPI backend
│   ├── app/main.py            # API endpoints
│   ├── app/models.py          # Database models
│   └── requirements.txt
│
└── mobile/                     # React Native web app
    ├── src/screens/           # Main UI screens
    ├── src/services/          # API & notification logic
    ├── assets/sounds/         # Alarm sound files
    └── package.json
```

---

**Happy alarming! 🎉**