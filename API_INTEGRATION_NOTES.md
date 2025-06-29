# API Integration Notes

## Current Status: MOCK MODE

The app is currently running in **MOCK MODE** with fake data. All API calls are stubbed out to allow development without a backend.

## Files Modified for Mock Mode

### 1. `src/services/api.js`
- **Status**: Mock API service implemented
- **Key Changes**:
  - Added `isMockMode = true` flag
  - Created mock data for users and high scores
  - All API methods return fake successful responses
  - Real API code is commented out with `// TODO:` markers

### 2. Font Issues Fixed
- **Problem**: Missing font files causing loading errors
- **Solution**: Replaced all `American-Typewriter` and `Iowan-Old-Style` references with `System` font
- **Files Modified**:
  - `App.js` - Commented out font loading
  - `Button.js` - Updated font references
  - `GameScreen.js` - Updated font references
  - `LoginScreen.js` - Updated font references
  - `MenuScreen.js` - Updated font references
  - `ScoreboardScreen.js` - Updated font references

### 3. Audio Configuration Fixed
- **Problem**: Invalid audio interruption mode values
- **Solution**: Removed problematic audio settings from `SoundContext.js`

## When Ready to Connect Real API

### 1. Update API Service (`src/services/api.js`)
```javascript
// Change this line:
this.isMockMode = true; // TODO: Set to false when API is ready

// To:
this.isMockMode = false;
```

### 2. Uncomment Real API Code
In `src/services/api.js`, uncomment the real API implementation:
```javascript
// TODO: Uncomment this section when API is ready
/*
const url = `${API_BASE_URL}${endpoint}`;
// ... rest of real API code
*/
```

### 3. Set API Endpoint
Update the API base URL:
```javascript
// TODO: Replace with your actual API endpoint when backend is ready
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';
```

### 4. Implement Real Caching
Uncomment and implement the caching methods:
- `getCachedData()`
- `setCachedData()`
- `queueScoreSubmission()`
- `syncQueuedScores()`

### 5. Add Font Files (Optional)
If you want to use the original fonts:
1. Add font files to `assets/fonts/`:
   - `AmericanTypewriter.ttf`
   - `IowanOldStyle.ttf`
2. Uncomment font loading in `App.js`
3. Update font references back to original names

## Mock Data Structure

### User Object
```javascript
const MOCK_USER = {
  id: 'mock-user-123',
  name: 'Player',
  device: 'mock-device',
  token: 'mock-token-123',
  createdAt: new Date().toISOString(),
};
```

### High Scores Array
```javascript
const MOCK_HIGH_SCORES = [
  { id: 1, name: 'Alice', score: 1500, difficulty: 'Hard', date: '2024-01-15' },
  { id: 2, name: 'Bob', score: 1200, difficulty: 'Medium', date: '2024-01-14' },
  // ... more scores
];
```

## API Endpoints Expected

The mock service expects these endpoints:
- `POST /users` - User login/registration
- `GET /users/{deviceId}` - Check existing user
- `GET /scores/{deviceId}` - Get high scores
- `POST /scores/new/{deviceId}` - Submit new score

## Testing

The app should now run without any API errors. You can:
1. Login with any username (validation still works)
2. Play the game
3. View mock high scores
4. Submit scores (stored locally)

All functionality works with mock data until you're ready to connect the real API. 