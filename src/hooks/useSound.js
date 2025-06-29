// src/hooks/useSound.js
import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const soundFiles = {
  button: require('../../assets/sounds/button.mp3'),
  tap: require('../../assets/sounds/tap.mp3'),
  whoosh: require('../../assets/sounds/whoosh.mp3'),
  whoosh2: require('../../assets/sounds/whoosh2.mp3'),
  bell: require('../../assets/sounds/button.mp3'),
  bell3: require('../../assets/sounds/button.mp3'),
  buzzer: require('../../assets/sounds/tap.mp3'),
  beep: require('../../assets/sounds/button.mp3'),
  exhale: require('../../assets/sounds/whoosh.mp3'),
  scream: require('../../assets/sounds/tap.mp3'),
};

const soundVolumes = {
  button: 0.2,
  tap: 0.7,
  whoosh: 1.0,
  whoosh2: 1.0,
  bell: 0.4,
  bell3: 0.4,
  buzzer: 0.2,
  beep: 0.3,
  exhale: 0.3,
  scream: 0.2,
};

export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const loadedSounds = useRef({});

  // Load sound settings on mount
  useEffect(() => {
    loadSoundSettings();
  }, []);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      Object.values(loadedSounds.current).forEach(async (sound) => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.warn('Error unloading sound:', error);
        }
      });
    };
  }, []);

  const loadSoundSettings = async () => {
    try {
      const savedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
      if (savedSoundEnabled !== null) {
        setSoundEnabled(savedSoundEnabled === 'true');
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  };

  const playSound = useCallback(async (soundName, options = {}) => {
    if (!soundEnabled || !soundFiles[soundName]) {
      return;
    }

    try {
      // Check if sound is already loaded
      let sound = loadedSounds.current[soundName];
      
      if (!sound) {
        // Load the sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          soundFiles[soundName],
          {
            shouldPlay: false,
            volume: soundVolumes[soundName] || 0.5,
          }
        );
        
        loadedSounds.current[soundName] = newSound;
        sound = newSound;
      }
      
      // Stop any previous playback
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Apply options
      if (options.volume !== undefined) {
        await sound.setVolumeAsync(options.volume);
      }
      
      // Play the sound
      await sound.playAsync();
      
      // For one-shot sounds, unload after playing
      if (options.oneShot) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            delete loadedSounds.current[soundName];
          }
        });
      }
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }, [soundEnabled]);

  const stopSound = useCallback(async (soundName) => {
    const sound = loadedSounds.current[soundName];
    if (sound) {
      try {
        await sound.stopAsync();
      } catch (error) {
        console.warn(`Error stopping sound ${soundName}:`, error);
      }
    }
  }, []);

  const stopAllSounds = useCallback(async () => {
    const promises = Object.values(loadedSounds.current).map(async (sound) => {
      try {
        await sound.stopAsync();
      } catch (error) {
        console.warn('Error stopping sound:', error);
      }
    });
    
    await Promise.all(promises);
  }, []);

  const preloadSounds = useCallback(async (soundNames = []) => {
    const promises = soundNames.map(async (soundName) => {
      if (!loadedSounds.current[soundName] && soundFiles[soundName]) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            soundFiles[soundName],
            {
              shouldPlay: false,
              volume: soundVolumes[soundName] || 0.5,
            }
          );
          loadedSounds.current[soundName] = sound;
        } catch (error) {
          console.error(`Error preloading sound ${soundName}:`, error);
        }
      }
    });
    
    await Promise.all(promises);
  }, []);

  const toggleSound = useCallback(async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      await AsyncStorage.setItem('soundEnabled', String(newValue));
    } catch (error) {
      console.error('Error saving sound setting:', error);
    }
  }, [soundEnabled]);

  // Convenience methods for common sounds
  const playMoveSound = useCallback(() => playSound('whoosh'), [playSound]);
  const playButtonSound = useCallback(() => playSound('tap'), [playSound]);
  const playGameOverSound = useCallback(() => playSound('buzzer'), [playSound]);
  const playVictorySound = useCallback(() => playSound('bell'), [playSound]);

  return {
    soundEnabled,
    playSound,
    playMoveSound,
    playButtonSound,
    playGameOverSound,
    playVictorySound,
    stopSound,
    stopAllSounds,
    preloadSounds,
    toggleSound,
  };
};