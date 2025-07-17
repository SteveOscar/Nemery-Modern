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

export const UserProvider = ({ children }) => {
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

      // Check for saved user
      const savedUser = await SecureStore.getItemAsync('user');
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setMessage(`Welcome back ${userData.name}!`);
        
        // Verify user still exists on server
        const result = await apiService.checkUser();
        if (!result.success) {
          // User no longer exists on server, clear local data
          await logout();
        }
      } else {
        // Check if device has existing user
        const deviceId = Device.osBuildId || Device.modelId || 'unknown';
        const result = await apiService.checkUser();
        
        if (result.success && result.data) {
          setUser(result.data);
          setIsAuthenticated(true);
          setMessage(`Welcome back ${result.data.name}!`);
          await SecureStore.setItemAsync('user', JSON.stringify(result.data));
        }
      }
    } catch (err) {
      console.error('Error initializing user:', err);
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
        setError(`Username is ${username.length - 10} characters too long`);
        return false;
      }
      const validUsername = /^[a-zA-Z0-9_-]+$/.test(username);
      if (!validUsername) {
        setError('Username can only contain letters, numbers, - and _');
        return false;
      }

      // Get device ID
      const deviceId = Device.osBuildId || Device.modelId || Device.osInternalBuildId || Device.deviceName || 'unknown';
      let userData;
      try {
        userData = await getUserByDevice(deviceId);
        // Optionally update username if changed (not implemented here)
        setMessage(`Welcome back ${userData.name}!`);
      } catch (e) {
        // Not found, sign up
        userData = await signupUser({ name: username.trim(), device: deviceId });
        setMessage('Welcome, new player!');
      }
      setUser(userData);
      setIsAuthenticated(true);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      return true;
    } catch (err) {
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

  const updateUser = useCallback(async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  const isGuest = useCallback(() => {
    return !user || user.name === 'Anonymous';
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
    username: user?.name || 'Guest',
    userId: user?.id || null,
    deviceId: user?.device || Device.osBuildId || 'unknown',
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};