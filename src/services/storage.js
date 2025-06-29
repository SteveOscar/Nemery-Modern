import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  // Keys for different types of data
  static KEYS = {
    USER_TOKEN: 'user_token',
    USER_PROFILE: 'user_profile',
    GAME_STATE: 'game_state',
    BEST_SCORE: 'best_score',
    GAME_STATISTICS: 'game_statistics',
    SETTINGS: 'settings',
    SOUND_ENABLED: 'sound_enabled',
    VIBRATION_ENABLED: 'vibration_enabled',
  };

  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // User authentication
  async saveUserToken(token) {
    return await this.setItem(StorageService.KEYS.USER_TOKEN, token);
  }

  async getUserToken() {
    return await this.getItem(StorageService.KEYS.USER_TOKEN);
  }

  async removeUserToken() {
    return await this.removeItem(StorageService.KEYS.USER_TOKEN);
  }

  async saveUserProfile(profile) {
    return await this.setItem(StorageService.KEYS.USER_PROFILE, profile);
  }

  async getUserProfile() {
    return await this.getItem(StorageService.KEYS.USER_PROFILE);
  }

  // Game state
  async saveGameState(gameState) {
    return await this.setItem(StorageService.KEYS.GAME_STATE, gameState);
  }

  async getGameState() {
    return await this.getItem(StorageService.KEYS.GAME_STATE);
  }

  async clearGameState() {
    return await this.removeItem(StorageService.KEYS.GAME_STATE);
  }

  // Scores
  async saveBestScore(score) {
    const currentBest = await this.getBestScore();
    if (score > currentBest) {
      return await this.setItem(StorageService.KEYS.BEST_SCORE, score);
    }
    return false;
  }

  async getBestScore() {
    return await this.getItem(StorageService.KEYS.BEST_SCORE, 0);
  }

  // Statistics
  async saveGameStatistics(statistics) {
    return await this.setItem(StorageService.KEYS.GAME_STATISTICS, statistics);
  }

  async getGameStatistics() {
    return await this.getItem(StorageService.KEYS.GAME_STATISTICS, {
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      highestTile: 0,
      totalMoves: 0,
    });
  }

  async updateGameStatistics(gameResult) {
    const currentStats = await this.getGameStatistics();
    const newStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      totalScore: currentStats.totalScore + gameResult.score,
      averageScore: Math.round((currentStats.totalScore + gameResult.score) / (currentStats.gamesPlayed + 1)),
      highestTile: Math.max(currentStats.highestTile, gameResult.highestTile),
      totalMoves: currentStats.totalMoves + gameResult.moves,
    };
    return await this.saveGameStatistics(newStats);
  }

  // Settings
  async saveSettings(settings) {
    return await this.setItem(StorageService.KEYS.SETTINGS, settings);
  }

  async getSettings() {
    return await this.getItem(StorageService.KEYS.SETTINGS, {
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'light',
      difficulty: 'normal',
    });
  }

  async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    return await this.saveSettings(settings);
  }

  // Sound settings
  async setSoundEnabled(enabled) {
    return await this.setItem(StorageService.KEYS.SOUND_ENABLED, enabled);
  }

  async isSoundEnabled() {
    return await this.getItem(StorageService.KEYS.SOUND_ENABLED, true);
  }

  // Vibration settings
  async setVibrationEnabled(enabled) {
    return await this.setItem(StorageService.KEYS.VIBRATION_ENABLED, enabled);
  }

  async isVibrationEnabled() {
    return await this.getItem(StorageService.KEYS.VIBRATION_ENABLED, true);
  }

  // Utility methods
  async isFirstLaunch() {
    const hasLaunched = await this.getItem('has_launched');
    if (!hasLaunched) {
      await this.setItem('has_launched', true);
      return true;
    }
    return false;
  }

  async getAppVersion() {
    return await this.getItem('app_version');
  }

  async setAppVersion(version) {
    return await this.setItem('app_version', version);
  }
}

export default new StorageService(); 