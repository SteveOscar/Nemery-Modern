class ApiService {
  constructor() {
    this.baseURL = 'https://api.nemery.com'; // Replace with your actual API URL
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(username, password, email) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
    }
  }

  // User profile
  async getUserProfile() {
    return await this.request('/user/profile');
  }

  async updateUserProfile(data) {
    return await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Scores
  async submitScore(score, gameData) {
    return await this.request('/scores', {
      method: 'POST',
      body: JSON.stringify({ score, gameData }),
    });
  }

  async getScoreboard(limit = 50) {
    return await this.request(`/scores?limit=${limit}`);
  }

  async getUserScores() {
    return await this.request('/user/scores');
  }

  // Game state
  async saveGameState(gameState) {
    return await this.request('/game/state', {
      method: 'POST',
      body: JSON.stringify(gameState),
    });
  }

  async loadGameState() {
    return await this.request('/game/state');
  }

  // Statistics
  async getStatistics() {
    return await this.request('/user/statistics');
  }

  // Leaderboards
  async getLeaderboard(timeframe = 'all') {
    return await this.request(`/leaderboard?timeframe=${timeframe}`);
  }

  // Health check
  async healthCheck() {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService(); 