// src/contexts/SoundContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';

const SoundContext = createContext({});

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

// Sound file mappings
const SOUND_FILES = {
  button: require('../../assets/sounds/button.mp3'),
  tap: require('../../assets/sounds/tap.mp3'),
  whoosh: require('../../assets/sounds/whoosh.mp3'),
  whoosh2: require('../../assets/sounds/whoosh2.mp3'),
  bell: require('../../assets/sounds/bell.mp3'),
  bell3: require('../../assets/sounds/bell3.mp3'),
  buzzer: require('../../assets/sounds/buzzer.mp3'),
  beep: require('../../assets/sounds/beep.mp3'),
  exhale: require('../../assets/sounds/exhale.mp3'),
  scream: require('../../assets/sounds/scream.mp3'),
};

// Default volume levels for each sound
const SOUND_VOLUMES = {
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

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const loadedSounds = useRef({});
  const soundQueue = useRef([]);
  const isPlaying = useRef({});

  // Initialize audio settings
  useEffect(() => {
    initializeAudio();
    return () => {
      // Cleanup all sounds on unmount
      cleanupAllSounds();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      // Load saved sound settings
      const savedSoundEnabled = await SecureStore.getItemAsync('soundEnabled');
      const savedVolume = await SecureStore.getItemAsync('masterVolume');
      
      if (savedSoundEnabled !== null) {
        setSoundEnabled(savedSoundEnabled === 'true');
      }
      
      if (savedVolume !== null) {
        setMasterVolume(parseFloat(savedVolume));
      }

      // Preload common sounds
      await preloadSounds(['button', 'tap', 'whoosh']);
      
    } catch (error) {
      console.error('Error initializing audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupAllSounds = async () => {
    const sounds = Object.values(loadedSounds.current);
    await Promise.all(sounds.map(async (sound) => {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Error cleaning up sound:', error);
      }
    }));
    loadedSounds.current = {};
    isPlaying.current = {};
  };

  const playSound = useCallback(async (soundName, options = {}) => {
    if (!soundEnabled || !SOUND_FILES[soundName]) {
      return null;
    }

    try {
      // Check if sound is already playing
      if (isPlaying.current[soundName] && !options.overlap) {
        return null;
      }

      let sound = loadedSounds.current[soundName];
      
      if (!sound) {
        // Load the sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          SOUND_FILES[soundName],
          {
            shouldPlay: false,
            volume: (SOUND_VOLUMES[soundName] || 0.5) * masterVolume,
          }
        );
        
        loadedSounds.current[soundName] = newSound;
        sound = newSound;
      } else {
        // Reset the sound position
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
      
      // Apply custom volume if provided
      if (options.volume !== undefined) {
        await sound.setVolumeAsync(options.volume * masterVolume);
      }
      
      // Apply playback rate if provided (for pitch effects)
      if (options.rate !== undefined) {
        await sound.setRateAsync(options.rate, true);
      }
      
      // Mark as playing
      isPlaying.current[soundName] = true;
      
      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          isPlaying.current[soundName] = false;
          
          // Unload one-shot sounds
          if (options.oneShot) {
            sound.unloadAsync();
            delete loadedSounds.current[soundName];
          }
          
          // Call completion callback if provided
          if (options.onComplete) {
            options.onComplete();
          }
        }
      });
      
      // Play the sound
      await sound.playAsync();
      
      return sound;
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      isPlaying.current[soundName] = false;
      return null;
    }
  }, [soundEnabled, masterVolume]);

  const playRandomSound = useCallback(async (soundNames, options = {}) => {
    const randomIndex = Math.floor(Math.random() * soundNames.length);
    return playSound(soundNames[randomIndex], options);
  }, [playSound]);

  const playSequence = useCallback(async (soundSequence) => {
    for (const item of soundSequence) {
      if (typeof item === 'string') {
        await playSound(item, { oneShot: true });
        await new Promise(resolve => setTimeout(resolve, 300)); // Default delay
      } else {
        const { sound, delay = 300, ...options } = item;
        await playSound(sound, options);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [playSound]);

  const stopSound = useCallback(async (soundName) => {
    const sound = loadedSounds.current[soundName];
    if (sound) {
      try {
        await sound.stopAsync();
        isPlaying.current[soundName] = false;
      } catch (error) {
        console.warn(`Error stopping sound ${soundName}:`, error);
      }
    }
  }, []);

  const stopAllSounds = useCallback(async () => {
    const promises = Object.entries(loadedSounds.current).map(async ([name, sound]) => {
      try {
        await sound.stopAsync();
        isPlaying.current[name] = false;
      } catch (error) {
        console.warn('Error stopping sound:', error);
      }
    });
    
    await Promise.all(promises);
  }, []);

  const preloadSounds = useCallback(async (soundNames = []) => {
    const promises = soundNames.map(async (soundName) => {
      if (!loadedSounds.current[soundName] && SOUND_FILES[soundName]) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            SOUND_FILES[soundName],
            {
              shouldPlay: false,
              volume: (SOUND_VOLUMES[soundName] || 0.5) * masterVolume,
            }
          );
          loadedSounds.current[soundName] = sound;
        } catch (error) {
          console.error(`Error preloading sound ${soundName}:`, error);
        }
      }
    });
    
    await Promise.all(promises);
  }, [masterVolume]);

  const toggleSound = useCallback(async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    await SecureStore.setItemAsync('soundEnabled', String(newValue));
    
    // Stop all sounds when disabling
    if (!newValue) {
      await stopAllSounds();
    }
  }, [soundEnabled, stopAllSounds]);

  const setVolume = useCallback(async (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolume(clampedVolume);
    await SecureStore.setItemAsync('masterVolume', String(clampedVolume));
    
    // Update volume for all loaded sounds
    const promises = Object.values(loadedSounds.current).map(async (sound) => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setVolumeAsync(status.volume * clampedVolume);
        }
      } catch (error) {
        console.warn('Error updating sound volume:', error);
      }
    });
    
    await Promise.all(promises);
  }, []);

  const value = {
    // State
    soundEnabled,
    masterVolume,
    isLoading,
    
    // Actions
    playSound,
    playRandomSound,
    playSequence,
    stopSound,
    stopAllSounds,
    preloadSounds,
    toggleSound,
    setVolume,
    
    // Constants
    SOUND_NAMES: Object.keys(SOUND_FILES),
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};