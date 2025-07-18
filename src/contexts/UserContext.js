// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import apiService from '../services/api';
import { getUserByDevice, signupUser } from '../services/api';

const UserContext = createContext({});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const getDeviceId = () => {
  return (
    Device.osBuildId || Device.modelId || Device.osInternalBuildId || Device.deviceName || 'unknown'
  );
};

const normalizeUser = (rawData) => {
  if (!rawData) return null;

  let userData = rawData;
  // Handle potential nesting from API responses
  if (rawData.data) userData = rawData.data;
  if (userData.data) userData = userData.data; // For double-nested cases

  if (userData.attributes) {
    return {
      ...userData.attributes,
      id: userData.id,
    };
  }

  return userData;
};

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Initialize user on app start
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize API service
      await apiService.init();

      const deviceId = getDeviceId();
      const savedUserJson = await SecureStore.getItemAsync('user');
      let userData;

      if (savedUserJson) {
        const parsed = JSON.parse(savedUserJson);
        userData = normalizeUser(parsed);
      }

      // Always attempt to fetch/verify from server using device ID
      const apiResponse = await getUserByDevice(deviceId);
      userData = normalizeUser(apiResponse);

      // If we reach here, user exists on server
      setUser(userData);
      setIsAuthenticated(true);
      setMessage(`Welcome back ${userData.name || ''}!`);

      // Save normalized user
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    } catch (err) {
      // If error (e.g., user not found), clear any local data if it existed
      if (await SecureStore.getItemAsync('user')) {
        await SecureStore.deleteItemAsync('user');
      }
      setUser(null);
      setIsAuthenticated(false);
      console.error('Error initializing user:', err);
      // Only set error if it's not a "not found" case (assuming API throws specific error for not found)
      setError('Failed to initialize user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (username) => {
    try {
      setIsLoading(true);
      setError(null);
      setMessage('');

      // Validate username
      if (!username || username.trim().length === 0) {
        setError('Please enter a username');
        return false;
      }
      if (username.length > 10) {
        setError(`Username is ${username.length - 15} characters too long`);
        return false;
      }
      const validUsername = /^[a-zA-Z0-9_-]+$/.test(username);
      if (!validUsername) {
        setError('Username can only contain letters, numbers, - and _');
        return false;
      }

      const deviceId = getDeviceId();
      let userData;
      try {
        const apiResponse = await getUserByDevice(deviceId);
        userData = normalizeUser(apiResponse);
        setMessage(`Welcome back ${userData.name || ''}!`);
      } catch (e) {
        // Not found, sign up
        const signupResponse = await signupUser({ name: username.trim(), device: deviceId });
        userData = normalizeUser(signupResponse);
        setMessage('Welcome, new player!');
      }

      setUser(userData);
      setIsAuthenticated(true);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Clear all stored data
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('highScores');

      setUser(null);
      setIsAuthenticated(false);
      setMessage('');
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(
    async (updates) => {
      try {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error updating user:', err);
        setError('Failed to update user');
      }
    },
    [user]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  const isGuest = useCallback(() => {
    return !user;
  }, [user]);

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    error,
    message,

    // Actions
    login,
    logout,
    updateUser,
    clearError,
    clearMessage,
    isGuest,

    // Computed values
    username: user?.name || '',
    userId: user?.id || null,
    deviceId: user?.device || getDeviceId(),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export { UserProvider };
