# API Integration Notes

## Current Status: REAL API MODE

The app is now fully integrated with the real API. All user, score, and authentication operations are performed against the live backend.

## API Endpoints Used
- `POST /users` - User login/registration
- `GET /users/{deviceId}` - Check existing user
- `GET /scores/{deviceId}` - Get high scores
- `POST /scores/new/{deviceId}` - Submit new score

## Configuration
- The API base URL and API key are set via environment variables:
  - `EXPO_PUBLIC_API_BASE_URL`
  - `EXPO_PUBLIC_NEMERY_API_KEY`
- These are loaded in `src/services/api.js` and used for all requests.

## Caching & Offline
- The app uses SecureStore to cache high scores and queue score submissions if offline.
- When the app starts, it attempts to sync any queued scores.

## Troubleshooting
- If you encounter network or API errors, check the API base URL and key in your environment configuration.
- All API errors are logged to the console for debugging.

## Font & Audio Notes
- Custom fonts and audio are loaded from the assets directory.
- If you want to use additional fonts, add them to `assets/fonts/` and update font references in the code.

---

If you need to update endpoints or add new API features, see `src/services/api.js` for the integration points. 