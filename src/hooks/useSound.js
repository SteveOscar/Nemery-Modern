import { useState, useEffect, useCallback } from 'react';
import soundService from '../services/sound';
import storageService from '../services/storage';

export const useSound = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    initializeSound();
  }, []);

  const initializeSound = async () => {
    try {
      await soundService.initialize();
      const soundEnabled = await storageService.isSoundEnabled();
      setIsEnabled(soundEnabled);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to initialize sound:', error);
    }
  };

  const playSound = useCallback(async (soundName) => {
    if (!isEnabled || !isLoaded) {
      return;
    }

    try {
      await soundService.playSound(soundName);
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error);
    }
  }, [isEnabled, isLoaded]);

  const playBackgroundMusic = useCallback(async () => {
    if (!isEnabled || !isLoaded) {
      return;
    }

    try {
      await soundService.playBackgroundMusic();
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }, [isEnabled, isLoaded]);

  const stopBackgroundMusic = useCallback(async () => {
    try {
      await soundService.stopBackgroundMusic();
    } catch (error) {
      console.error('Failed to stop background music:', error);
    }
  }, []);

  const enableSound = useCallback(async () => {
    try {
      await soundService.enableSound();
      setIsEnabled(true);
    } catch (error) {
      console.error('Failed to enable sound:', error);
    }
  }, []);

  const disableSound = useCallback(async () => {
    try {
      await soundService.disableSound();
      setIsEnabled(false);
    } catch (error) {
      console.error('Failed to disable sound:', error);
    }
  }, []);

  const setVolume = useCallback(async (volume) => {
    try {
      await soundService.setVolume(volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }, []);

  // Convenience methods for common sounds
  const playMoveSound = useCallback(() => playSound('move'), [playSound]);
  const playMergeSound = useCallback(() => playSound('merge'), [playSound]);
  const playGameOverSound = useCallback(() => playSound('gameOver'), [playSound]);
  const playVictorySound = useCallback(() => playSound('victory'), [playSound]);
  const playButtonSound = useCallback(() => playSound('button'), [playSound]);

  return {
    // State
    isEnabled,
    isLoaded,
    
    // Methods
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    enableSound,
    disableSound,
    setVolume,
    
    // Convenience methods
    playMoveSound,
    playMergeSound,
    playGameOverSound,
    playVictorySound,
    playButtonSound,
  };
}; 