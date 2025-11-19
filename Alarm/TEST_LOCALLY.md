# Testing Locally on Your Computer

Complete guide to test the alarm app on your computer before deploying to mobile devices.

## Step 1: Test Backend API (No Phone Needed)

### A. Start the Backend Server

1. Open **Git Bash** or **Command Prompt** in your project folder:
```bash
cd C:/Users/km111/Python_Projects/Alarm/backend
```

2. Create and activate virtual environment:
```bash
# Create virtual environment (only needed once)
python -m venv venv

# Activate it
# On Windows Git Bash:
source venv/Scripts/activate
# On Windows CMD:
venv\Scripts\activate
```

3. Install dependencies (only needed once):
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### B. Test Backend in Browser

**Open your browser and visit these URLs:**

1. **Health Check:**
   - URL: http://localhost:8000
   - Expected: `{"status":"ok","message":"Alarm API is running"}`

2. **Interactive API Documentation (Swagger UI):**
   - URL: http://localhost:8000/docs
   - This gives you a full interactive API testing interface!

3. **Get All Alarms:**
   - URL: http://localhost:8000/alarms/
   - Expected: `[]` (empty list initially)

### C. Test API with Swagger UI (Easiest Method)

1. Go to http://localhost:8000/docs

2. **Create an Alarm:**
   - Click on `POST /alarms/`
   - Click "Try it out"
   - Use this test data:
   ```json
   {
     "title": "Test Alarm",
     "time": "09:00",
     "enabled": true,
     "repeat_days": [1, 2, 3, 4, 5],
     "sound": "default",
     "snooze_enabled": true,
     "snooze_duration": 5,
     "vibrate": true
   }
   ```
   - Click "Execute"
   - You should get a 200 response with the created alarm (including an `id`)

3. **Get All Alarms:**
   - Click on `GET /alarms/`
   - Click "Try it out"
   - Click "Execute"
   - You should see your test alarm in the list

4. **Update the Alarm:**
   - Click on `PUT /alarms/{alarm_id}`
   - Enter the alarm ID (probably `1`)
   - Change the title or time
   - Click "Execute"

5. **Delete the Alarm:**
   - Click on `DELETE /alarms/{alarm_id}`
   - Enter the alarm ID
   - Click "Execute"

### D. Test API with curl (Command Line)

Open a **new terminal** (keep the server running in the first one):

```bash
# Get all alarms
curl http://localhost:8000/alarms/

# Create an alarm
curl -X POST http://localhost:8000/alarms/ \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Morning Alarm\",\"time\":\"07:30\",\"enabled\":true,\"repeat_days\":[1,2,3,4,5],\"sound\":\"default\",\"snooze_enabled\":true,\"snooze_duration\":5,\"vibrate\":true}"

# Get all alarms again (should show the new alarm)
curl http://localhost:8000/alarms/

# Update alarm (change ID to match yours)
curl -X PUT http://localhost:8000/alarms/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Alarm\"}"

# Delete alarm
curl -X DELETE http://localhost:8000/alarms/1
```

### E. Test API with Python Script

Create a test script:

```python
# test_api.py
import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing Alarm API...\n")

# 1. Health check
response = requests.get(f"{BASE_URL}/")
print(f"1. Health Check: {response.json()}\n")

# 2. Get all alarms (should be empty initially)
response = requests.get(f"{BASE_URL}/alarms/")
print(f"2. Get All Alarms (initial): {response.json()}\n")

# 3. Create an alarm
alarm_data = {
    "title": "Test Alarm",
    "time": "08:00",
    "enabled": True,
    "repeat_days": [1, 2, 3, 4, 5],  # Monday to Friday
    "sound": "default",
    "snooze_enabled": True,
    "snooze_duration": 10,
    "vibrate": True
}
response = requests.post(f"{BASE_URL}/alarms/", json=alarm_data)
created_alarm = response.json()
print(f"3. Create Alarm: {json.dumps(created_alarm, indent=2)}\n")

alarm_id = created_alarm['id']

# 4. Get the alarm by ID
response = requests.get(f"{BASE_URL}/alarms/{alarm_id}")
print(f"4. Get Alarm by ID: {json.dumps(response.json(), indent=2)}\n")

# 5. Update the alarm
update_data = {"title": "Updated Test Alarm", "time": "09:30"}
response = requests.put(f"{BASE_URL}/alarms/{alarm_id}", json=update_data)
print(f"5. Update Alarm: {json.dumps(response.json(), indent=2)}\n")

# 6. Toggle alarm
response = requests.patch(f"{BASE_URL}/alarms/{alarm_id}/toggle")
print(f"6. Toggle Alarm: {json.dumps(response.json(), indent=2)}\n")

# 7. Get all alarms (should show the updated alarm)
response = requests.get(f"{BASE_URL}/alarms/")
print(f"7. Get All Alarms (after updates): {json.dumps(response.json(), indent=2)}\n")

# 8. Delete the alarm
response = requests.delete(f"{BASE_URL}/alarms/{alarm_id}")
print(f"8. Delete Alarm: {response.json()}\n")

# 9. Verify deletion
response = requests.get(f"{BASE_URL}/alarms/")
print(f"9. Get All Alarms (after deletion): {response.json()}\n")

print("✅ All tests completed!")
```

Run it:
```bash
python test_api.py
```

---

## Step 2: Test Mobile App on Computer

You have **three options** to test the mobile app on your computer:

### Option A: Android Emulator (Windows/Mac/Linux)

**Prerequisites:**
- Android Studio installed
- Android SDK installed

**Steps:**

1. **Start Android Emulator:**
   - Open Android Studio
   - Go to `Tools` → `AVD Manager`
   - Click ▶ on any virtual device (or create one)
   - Wait for emulator to boot up

2. **Start the mobile app:**

   Open a **new terminal**:
   ```bash
   cd C:/Users/km111/Python_Projects/Alarm/mobile
   npm install
   npx expo start
   ```

3. **Launch on emulator:**
   - Press `a` in the terminal
   - Or scan QR code from emulator

**Configure API URL for Android Emulator:**

Edit `mobile/src/services/apiService.ts` line 9:
```typescript
const API_URL = 'http://10.0.2.2:8000';
```

`10.0.2.2` is the special IP that Android emulator uses to access your computer's localhost.

### Option B: iOS Simulator (Mac Only)

**Prerequisites:**
- macOS computer
- Xcode installed

**Steps:**

1. **Start the mobile app:**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

2. **Launch on iOS Simulator:**
   - Press `i` in the terminal
   - Or click "Run on iOS Simulator" in Expo DevTools

**Configure API URL for iOS Simulator:**

Edit `mobile/src/services/apiService.ts` line 9:
```typescript
const API_URL = 'http://localhost:8000';
```

iOS simulator can use `localhost` directly.

### Option C: Web Browser (Limited Functionality)

**Steps:**

1. Start the mobile app:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

2. Press `w` to open in web browser

**Note:** Web version has limitations:
- Notifications won't work properly
- Some mobile-specific features may not work
- Good for UI testing only

**Configure API URL for Web:**
```typescript
const API_URL = 'http://localhost:8000';
```

---

## Step 3: Full Testing Workflow

### A. Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
source venv/Scripts/activate  # or venv\Scripts\activate on Windows CMD
uvicorn app.main:app --reload
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npx expo start
```

**Terminal 3 - Android Emulator (if using):**
```bash
# In Expo terminal, press 'a'
```

### B. Test the Complete Flow

1. **Open the mobile app** (emulator, simulator, or web)

2. **Create an alarm:**
   - Tap the "+" (FAB button)
   - Set a time (try 2-3 minutes from now)
   - Enter a title
   - Leave "Enabled" on
   - Tap "Create Alarm"

3. **Verify in backend:**
   - Visit http://localhost:8000/alarms/
   - You should see your alarm

4. **Test toggle:**
   - Toggle the switch off/on
   - Refresh backend URL to verify

5. **Test edit:**
   - Tap the pencil icon
   - Change the title or time
   - Tap "Update Alarm"

6. **Test delete:**
   - Tap the trash icon
   - Confirm deletion
   - Verify it's gone from list

7. **Test recurring alarm:**
   - Create a new alarm
   - Select multiple days
   - Verify it shows the correct repeat pattern

8. **Test notifications** (only on emulator/simulator, not web):
   - Create an alarm for 2 minutes from now
   - Close or minimize the app
   - Wait for the alarm to trigger
   - You should receive a notification

### C. Monitor Backend Logs

Watch your backend terminal for API requests:
```
INFO:     127.0.0.1:xxxxx - "GET /alarms/ HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /alarms/ HTTP/1.1" 200 OK
```

This shows every request from the mobile app.

---

## Troubleshooting

### Backend Issues

**"Address already in use" error:**
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001

# Update mobile app API_URL to match!
```

**"No module named 'fastapi'":**
```bash
# Make sure virtual environment is activated
source venv/Scripts/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Mobile App Issues

**"Unable to connect to server":**
1. Check backend is running (visit http://localhost:8000)
2. Verify API_URL is correct in `apiService.ts`:
   - Android emulator: `http://10.0.2.2:8000`
   - iOS simulator: `http://localhost:8000`
   - Web: `http://localhost:8000`
3. Check firewall isn't blocking port 8000

**"Metro bundler failed to start":**
```bash
cd mobile
npx expo start --clear
```

**Android emulator not detected:**
```bash
# Check if adb can see the emulator
adb devices

# Should show something like:
# emulator-5554   device
```

**iOS simulator not opening:**
```bash
# Make sure Xcode command line tools are installed
xcode-select --install

# Try opening simulator manually first
open -a Simulator
```

### Network Issues

**Can't reach backend from emulator:**

Test from within emulator:
```bash
# Android emulator
adb shell
curl http://10.0.2.2:8000

# Should return: {"status":"ok","message":"Alarm API is running"}
```

---

## Quick Testing Checklist

Before deploying, verify:

### Backend ✅
- [ ] Server starts without errors
- [ ] Can access http://localhost:8000
- [ ] Swagger UI loads at /docs
- [ ] Can create alarm via Swagger
- [ ] Can get alarms via Swagger
- [ ] Can update alarm via Swagger
- [ ] Can delete alarm via Swagger

### Mobile App ✅
- [ ] App launches without crashes
- [ ] Can see empty alarm list
- [ ] Can create new alarm
- [ ] Alarm appears in list
- [ ] Can toggle alarm on/off
- [ ] Can edit alarm
- [ ] Can delete alarm
- [ ] Recurring alarms show correct days
- [ ] Time picker works
- [ ] Navigation works

### Integration ✅
- [ ] Mobile app connects to backend
- [ ] Data persists after app restart
- [ ] Multiple alarms can be created
- [ ] Changes sync between app and backend

---

## Next Steps

Once local testing is complete:

1. **Test on real device** (optional):
   - See `QUICK_START.md` for Expo Go setup
   - More accurate than emulator/simulator

2. **Build for distribution:**
   - **Android**: See `ANDROID_BUILD_GUIDE.md`
   - **iOS**: See `IOS_BUILD_GUIDE.md`

3. **Deploy backend** (if using cloud sync):
   - Heroku, Railway, or DigitalOcean
   - Update mobile app API_URL to production URL

---

## Monitoring Tools

### Backend Monitoring

**View database:**
```bash
# Install SQLite browser
# Windows: https://sqlitebrowser.org/
# Open: backend/alarms.db
```

**API client tools:**
- Swagger UI (built-in): http://localhost:8000/docs
- Postman: https://www.postman.com/
- Insomnia: https://insomnia.rest/
- Thunder Client (VS Code extension)

### Mobile Monitoring

**React DevTools:**
```bash
npm install -g react-devtools
react-devtools
```

**Expo DevTools:**
- Opens automatically when you run `npx expo start`
- View logs, restart app, toggle inspector

---

## Performance Testing

### Load Testing Backend

Test with multiple requests:

```python
# load_test.py
import requests
import concurrent.futures
import time

BASE_URL = "http://localhost:8000"

def create_alarm(i):
    alarm_data = {
        "title": f"Alarm {i}",
        "time": f"{7 + i % 12:02d}:00",
        "enabled": True,
        "repeat_days": [],
        "sound": "default",
        "snooze_enabled": True,
        "snooze_duration": 5,
        "vibrate": True
    }
    response = requests.post(f"{BASE_URL}/alarms/", json=alarm_data)
    return response.status_code

start_time = time.time()

# Create 100 alarms concurrently
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(create_alarm, range(100)))

end_time = time.time()

print(f"Created 100 alarms in {end_time - start_time:.2f} seconds")
print(f"Success rate: {results.count(200)}/100")
```

Run:
```bash
pip install requests
python load_test.py
```

---

## Summary

**To test everything locally:**

1. **Backend**: Start server, test at http://localhost:8000/docs
2. **Mobile**: Use Android emulator, iOS simulator, or web
3. **Integration**: Create alarms in mobile app, verify in backend
4. **Notifications**: Test with real-time alarms (only on emulator/simulator)

**Best testing approach:**
1. Test backend API first with Swagger UI
2. Test mobile app UI on emulator/simulator
3. Test full integration
4. Test on real device before deploying

You're ready to test! 🚀
