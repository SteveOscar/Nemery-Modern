import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Generic storage methods
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.warn('Error saving to storage:', error);
      return false;
    }
  }

  static async getItem(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development')
        console.warn('Error reading from storage:', error);
      return defaultValue;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development')
        console.warn('Error removing from storage:', error);
      return false;
    }
  }

  static async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.warn('Error clearing storage:', error);
      return false;
    }
  }

  // User authentication
  static async saveUserToken(token) {
    return StorageService.setItem(StorageService.KEYS.USER_TOKEN, token);
  }

  static async getUserToken() {
    return StorageService.getItem(StorageService.KEYS.USER_TOKEN);
  }

  static async removeUserToken() {
    return StorageService.removeItem(StorageService.KEYS.USER_TOKEN);
  }

  static async saveUserProfile(profile) {
    return StorageService.setItem(StorageService.KEYS.USER_PROFILE, profile);
  }

  static async getUserProfile() {
    return StorageService.getItem(StorageService.KEYS.USER_PROFILE);
  }

  // Game state
  static async saveGameState(gameState) {
    return StorageService.setItem(StorageService.KEYS.GAME_STATE, gameState);
  }

  static async getGameState() {
    return StorageService.getItem(StorageService.KEYS.GAME_STATE);
  }

  static async clearGameState() {
    return StorageService.removeItem(StorageService.KEYS.GAME_STATE);
  }

  // Scores
  static async saveBestScore(score) {
    const currentBest = await StorageService.getBestScore();
    if (score > currentBest) {
      return StorageService.setItem(StorageService.KEYS.BEST_SCORE, score);
    }
    return false;
  }

  static async getBestScore() {
    return StorageService.getItem(StorageService.KEYS.BEST_SCORE, 0);
  }

  // Statistics
  static async saveGameStatistics(statistics) {
    return StorageService.setItem(StorageService.KEYS.GAME_STATISTICS, statistics);
  }

  static async getGameStatistics() {
    return StorageService.getItem(StorageService.KEYS.GAME_STATISTICS, {
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      highestTile: 0,
      totalMoves: 0,
    });
  }

  async updateGameStatistics(gameResult) {
    const currentStats = await StorageService.getGameStatistics();
    const newStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      totalScore: currentStats.totalScore + gameResult.score,
      averageScore: Math.round(
        (currentStats.totalScore + gameResult.score) / (currentStats.gamesPlayed + 1)
      ),
      highestTile: Math.max(currentStats.highestTile, gameResult.highestTile),
      totalMoves: currentStats.totalMoves + gameResult.moves,
    };
    return this.saveGameStatistics(newStats);
  }

  // Settings
  static async saveSettings(settings) {
    return StorageService.setItem(StorageService.KEYS.SETTINGS, settings);
  }

  static async getSettings() {
    return StorageService.getItem(StorageService.KEYS.SETTINGS, {
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'light',
      difficulty: 'normal',
    });
  }

  async updateSetting(key, value) {
    const settings = await StorageService.getSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  }

  // Sound settings
  static async setSoundEnabled(enabled) {
    return StorageService.setItem(StorageService.KEYS.SOUND_ENABLED, enabled);
  }

  static async isSoundEnabled() {
    return StorageService.getItem(StorageService.KEYS.SOUND_ENABLED, true);
  }

  // Vibration settings
  static async setVibrationEnabled(enabled) {
    return StorageService.setItem(StorageService.KEYS.VIBRATION_ENABLED, enabled);
  }

  static async isVibrationEnabled() {
    return StorageService.getItem(StorageService.KEYS.VIBRATION_ENABLED, true);
  }

  // Utility methods
  static async isFirstLaunch() {
    const hasLaunched = await StorageService.getItem('has_launched');
    if (!hasLaunched) {
      await StorageService.setItem('has_launched', true);
      return true;
    }
    return false;
  }

  static async getAppVersion() {
    return StorageService.getItem('app_version');
  }

  static async setAppVersion(version) {
    return StorageService.setItem('app_version', version);
  }
}

StorageService.KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  GAME_STATE: 'game_state',
  BEST_SCORE: 'best_score',
  GAME_STATISTICS: 'game_statistics',
  SETTINGS: 'settings',
  SOUND_ENABLED: 'sound_enabled',
  VIBRATION_ENABLED: 'vibration_enabled',
};

export default new StorageService();
