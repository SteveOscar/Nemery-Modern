// src/services/api.js
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

// You should update this to your new API endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api.com';

class ApiService {
  constructor() {
    this.deviceId = null;
    this.token = null;
  }

  async init() {
    // Get device ID
    this.deviceId = Device.osBuildId || Device.modelId || 'unknown';
    
    // Get saved auth token
    this.token = await SecureStore.getItemAsync('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': this.deviceId,
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
      
    } catch (error) {
      console.error('API request failed:', error);
      
      // Check if we have cached data for this request
      if (options.cacheKey) {
        const cachedData = await this.getCachedData(options.cacheKey);
        if (cachedData) {
          return { success: true, data: cachedData, fromCache: true };
        }
      }
      
      return { 
        success: false, 
        error: error.message,
        isNetworkError: !navigator.onLine,
      };
    }
  }

  async getCachedData(key) {
    try {
      const cached = await SecureStore.getItemAsync(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading cache:', error);
    }
    return null;
  }

  async setCachedData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await SecureStore.setItemAsync(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error setting cache:', error);
    }
  }

  // Auth methods
  async login(username) {
    const result = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: username,
        device: this.deviceId,
      }),
    });

    if (result.success && result.data.token) {
      this.token = result.data.token;
      await SecureStore.setItemAsync('authToken', this.token);
      await SecureStore.setItemAsync('user', JSON.stringify(result.data));
    }

    return result;
  }

  async checkUser() {
    const result = await this.request(`/users/${this.deviceId}`);
    
    if (result.success && result.data) {
      await SecureStore.setItemAsync('user', JSON.stringify(result.data));
    }
    
    return result;
  }

  // Score methods
  async getHighScores() {
    const result = await this.request(`/scores/${this.deviceId}`, {
      cacheKey: 'highScores',
    });

    if (result.success) {
      await this.setCachedData('highScores', result.data);
    }

    return result;
  }

  async submitScore(score) {
    const user = await SecureStore.getItemAsync('user');
    const userId = user ? JSON.parse(user).id : null;
    
    if (!userId) {
      return { success: false, error: 'No user logged in' };
    }

    const result = await this.request(`/scores/new/${this.deviceId}`, {
      method: 'POST',
      body: JSON.stringify({
        user: userId,
        score: score,
      }),
    });

    // If offline, queue the score submission
    if (!result.success && result.isNetworkError) {
      await this.queueScoreSubmission(score);
    }

    return result;
  }

  async queueScoreSubmission(score) {
    try {
      const queuedScores = await SecureStore.getItemAsync('queuedScores');
      const scores = queuedScores ? JSON.parse(queuedScores) : [];
      scores.push({ score, timestamp: Date.now() });
      await SecureStore.setItemAsync('queuedScores', JSON.stringify(scores));
    } catch (error) {
      console.error('Error queuing score:', error);
    }
  }

  async syncQueuedScores() {
    try {
      const queuedScores = await SecureStore.getItemAsync('queuedScores');
      if (!queuedScores) return;

      const scores = JSON.parse(queuedScores);
      const successfulSubmissions = [];

      for (const { score, timestamp } of scores) {
        const result = await this.submitScore(score);
        if (result.success) {
          successfulSubmissions.push(timestamp);
        }
      }

      // Remove successfully submitted scores from queue
      const remainingScores = scores.filter(
        s => !successfulSubmissions.includes(s.timestamp)
      );
      
      if (remainingScores.length === 0) {
        await SecureStore.deleteItemAsync('queuedScores');
      } else {
        await SecureStore.setItemAsync('queuedScores', JSON.stringify(remainingScores));
      }
    } catch (error) {
      console.error('Error syncing queued scores:', error);
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Initialize on app start
export const initializeApi = async () => {
  await apiService.init();
  
  // Try to sync any queued scores
  await apiService.syncQueuedScores();
};

export default apiService;