# Development Tips & Best Practices

Helpful tips for developing and maintaining the Alarm app.

## Backend Development (FastAPI)

### Testing the API

Use these tools to test your API endpoints:

**1. Built-in Swagger UI:**
- Visit `http://localhost:8000/docs` while server is running
- Interactive API documentation
- Test endpoints directly in browser

**2. Using curl:**
```bash
# Get all alarms
curl http://localhost:8000/alarms/

# Create an alarm
curl -X POST http://localhost:8000/alarms/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wake Up",
    "time": "07:30",
    "enabled": true,
    "repeat_days": [1,2,3,4,5],
    "sound": "default",
    "snooze_enabled": true,
    "snooze_duration": 5,
    "vibrate": true
  }'

# Update an alarm
curl -X PUT http://localhost:8000/alarms/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Alarm"}'

# Delete an alarm
curl -X DELETE http://localhost:8000/alarms/1
```

**3. Using Python requests:**
```python
import requests

# Get all alarms
response = requests.get('http://localhost:8000/alarms/')
print(response.json())

# Create alarm
alarm_data = {
    "title": "Morning Alarm",
    "time": "06:00",
    "enabled": True,
    "repeat_days": [1, 2, 3, 4, 5],
    "sound": "default",
    "snooze_enabled": True,
    "snooze_duration": 10,
    "vibrate": True
}
response = requests.post('http://localhost:8000/alarms/', json=alarm_data)
print(response.json())
```

### Adding New Endpoints

Example: Add an endpoint to get today's alarms

1. Edit `backend/app/main.py`:
```python
from datetime import datetime

@app.get("/alarms/today", response_model=List[schemas.Alarm])
def get_today_alarms(db: Session = Depends(get_db)):
    """Get alarms scheduled for today"""
    today = datetime.now().weekday()  # 0=Monday in Python
    # Convert to 0=Sunday format
    today_index = (today + 1) % 7

    alarms = db.query(models.Alarm).filter(
        models.Alarm.enabled == True
    ).all()

    # Filter for alarms that include today
    today_alarms = [
        alarm for alarm in alarms
        if not alarm.repeat_days or today_index in alarm.repeat_days
    ]

    return today_alarms
```

### Database Migrations

When you modify models, you need to update the database:

**Simple approach (for development):**
```bash
# Delete the database and recreate
rm backend/alarms.db
# Restart the server - tables will be recreated
```

**Production approach (use Alembic):**
```bash
cd backend
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add new field"

# Apply migration
alembic upgrade head
```

## Mobile App Development

### React Native DevTools

**Reload the App:**
- Android: Press `R` twice or shake device
- iOS: Press `Cmd + R` or shake device

**Open Developer Menu:**
- Android: Press `Ctrl + M` (Windows/Linux) or `Cmd + M` (Mac)
- iOS: Press `Cmd + D`
- Physical device: Shake the device

**Enable Hot Reload:**
- Open dev menu → Enable "Fast Refresh"

### Debugging

**1. Console Logs:**
```typescript
console.log('Debug info:', variable);
console.error('Error:', error);
console.warn('Warning:', warning);
```

View logs in terminal where `npx expo start` is running

**2. React DevTools:**
```bash
# Install
npm install -g react-devtools

# Run
react-devtools
```

**3. Remote Debugging:**
- Open dev menu
- Select "Debug Remote JS"
- Opens Chrome DevTools

### Adding New Features

#### Example: Add a Sound Picker

1. **Install audio picker package:**
```bash
cd mobile
npx expo install expo-document-picker
```

2. **Create sound picker component** (`mobile/src/components/SoundPicker.tsx`):
```typescript
import React from 'react';
import { Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

interface SoundPickerProps {
  onSoundSelected: (sound: string) => void;
}

export default function SoundPicker({ onSoundSelected }: SoundPickerProps) {
  const pickSound = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
    });

    if (result.type === 'success') {
      onSoundSelected(result.uri);
    }
  };

  return (
    <Button mode="outlined" onPress={pickSound}>
      Choose Custom Sound
    </Button>
  );
}
```

3. **Use in AddEditAlarmScreen:**
```typescript
import SoundPicker from '../components/SoundPicker';

// In your component:
const [sound, setSound] = useState('default');

// In your render:
<SoundPicker onSoundSelected={setSound} />
```

### Testing Notifications

**Grant Permissions:**
- Android: Notifications are usually allowed by default
- iOS: System prompt appears first time

**Test Locally:**
```typescript
// Test immediate notification
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Alarm",
    body: "This is a test",
  },
  trigger: {
    seconds: 5,  // Fire in 5 seconds
  },
});
```

**Debug Scheduled Notifications:**
```typescript
// Check scheduled notifications
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Scheduled notifications:', scheduled);
```

### Performance Optimization

**1. Use React.memo for components:**
```typescript
export default React.memo(AlarmCard);
```

**2. Optimize FlatList:**
```typescript
<FlatList
  data={alarms}
  renderItem={renderItem}
  keyExtractor={item => item.id.toString()}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={10}
/>
```

**3. Use AsyncStorage for local caching:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache alarms locally
await AsyncStorage.setItem('alarms', JSON.stringify(alarms));

// Load from cache
const cached = await AsyncStorage.getItem('alarms');
if (cached) {
  setAlarms(JSON.parse(cached));
}
```

## Common Customizations

### Change App Colors

Edit theme in `mobile/App.tsx`:
```typescript
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',      // Main app color
    secondary: '#03dac4',    // Accent color
    background: '#ffffff',   // Background color
  },
};

<PaperProvider theme={theme}>
  {/* ... */}
</PaperProvider>
```

### Add Dark Mode

```typescript
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      {/* ... */}
    </PaperProvider>
  );
}
```

### Add More Alarm Sounds

1. Create `mobile/assets/sounds/` directory

2. Add MP3 files:
```
mobile/assets/sounds/
  ├── alarm1.mp3
  ├── alarm2.mp3
  ├── alarm3.mp3
  └── alarm4.mp3
```

3. Update `mobile/app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": [
            "./assets/sounds/alarm1.mp3",
            "./assets/sounds/alarm2.mp3",
            "./assets/sounds/alarm3.mp3",
            "./assets/sounds/alarm4.mp3"
          ]
        }
      ]
    ]
  }
}
```

4. Update AddEditAlarmScreen with sound picker

### Add User Authentication

If you want to add user accounts:

**Backend:**
```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

Create user models, authentication endpoints, and JWT tokens.

**Mobile:**
```bash
npm install @react-native-async-storage/async-storage
```

Store auth tokens and add authentication to API calls.

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-dark-mode

# Make changes and commit
git add .
git commit -m "Add dark mode support"

# Push to remote
git push origin feature/add-dark-mode

# Create pull request on GitHub
# Merge after review
```

## Environment Variables

### Backend

Create `backend/.env`:
```
DATABASE_URL=sqlite:///./alarms.db
SECRET_KEY=your-secret-key-here
DEBUG=True
```

Load in `backend/app/main.py`:
```python
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", "False") == "True"
```

### Mobile

Create `mobile/.env`:
```
API_URL=http://10.0.2.2:8000
```

Install package:
```bash
npm install react-native-dotenv
```

Use in code:
```typescript
import { API_URL } from '@env';
```

## Useful VS Code Extensions

- **Python** - Python language support
- **Pylance** - Python type checking
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **React Native Tools** - React Native development
- **GitLens** - Enhanced Git integration
- **Thunder Client** - API testing (alternative to Postman)

## Code Formatting

### Backend (Black)

```bash
pip install black
black backend/
```

### Mobile (Prettier)

```bash
npm install --save-dev prettier
npx prettier --write "src/**/*.{ts,tsx}"
```

## Monitoring & Analytics

Add analytics to track app usage:

```bash
npm install expo-firebase-analytics
```

Or use a service like:
- Google Analytics
- Mixpanel
- Amplitude

## Resources

### Official Documentation
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### Learning Resources
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [React Native Express](https://www.reactnative.express/)
- [Expo Snacks](https://snack.expo.dev/) - Try React Native in browser

### Community
- [React Native Community](https://github.com/react-native-community)
- [Expo Forums](https://forums.expo.dev/)
- [FastAPI Discord](https://discord.gg/fastapi)

## Troubleshooting Tips

1. **Clear caches when things break:**
   ```bash
   # Backend
   find . -type d -name __pycache__ -exec rm -rf {} +

   # Mobile
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

2. **Check versions:**
   ```bash
   python --version  # Should be 3.8+
   node --version    # Should be 16+
   npm --version
   ```

3. **Read error messages carefully** - they usually tell you exactly what's wrong

4. **Google the error** - someone has probably solved it before

5. **Check GitHub issues** for the packages you're using

Happy coding! 🚀
