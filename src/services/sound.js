import { Audio } from 'expo-av';
import storageService from './storage';

class SoundService {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
    this.isLoaded = false;
  }

  async initialize() {
    try {
      // Check if sound is enabled in settings
      this.isEnabled = await storageService.isSoundEnabled();
      
      // Load sound files
      await this.loadSounds();
      
      this.isLoaded = true;
      console.log('Sound service initialized');
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
    }
  }

  async loadSounds() {
    const soundFiles = {
      move: require('../../assets/sounds/move.mp3'),
      merge: require('../../assets/sounds/merge.mp3'),
      gameOver: require('../../assets/sounds/gameOver.mp3'),
      victory: require('../../assets/sounds/victory.mp3'),
      button: require('../../assets/sounds/button.mp3'),
      background: require('../../assets/sounds/background.mp3'),
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, {
          shouldPlay: false,
          isLooping: key === 'background',
        });
        this.sounds[key] = sound;
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
      }
    }
  }

  async playSound(soundName) {
    if (!this.isEnabled || !this.isLoaded) {
      return;
    }

    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      await sound.replayAsync();
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error);
    }
  }

  async playBackgroundMusic() {
    if (!this.isEnabled || !this.isLoaded) {
      return;
    }

    const backgroundSound = this.sounds.background;
    if (!backgroundSound) {
      return;
    }

    try {
      await backgroundSound.setIsLoopingAsync(true);
      await backgroundSound.playAsync();
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  async stopBackgroundMusic() {
    const backgroundSound = this.sounds.background;
    if (backgroundSound) {
      try {
        await backgroundSound.stopAsync();
      } catch (error) {
        console.error('Failed to stop background music:', error);
      }
    }
  }

  async setVolume(volume) {
    // volume should be between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        try {
          await sound.setVolumeAsync(clampedVolume);
        } catch (error) {
          console.error('Failed to set volume:', error);
        }
      }
    }
  }

  async enableSound() {
    this.isEnabled = true;
    await storageService.setSoundEnabled(true);
  }

  async disableSound() {
    this.isEnabled = false;
    await storageService.setSoundEnabled(false);
    
    // Stop background music if playing
    await this.stopBackgroundMusic();
  }

  isSoundEnabled() {
    return this.isEnabled;
  }

  // Convenience methods for common sounds
  async playMoveSound() {
    await this.playSound('move');
  }

  async playMergeSound() {
    await this.playSound('merge');
  }

  async playGameOverSound() {
    await this.playSound('gameOver');
  }

  async playVictorySound() {
    await this.playSound('victory');
  }

  async playButtonSound() {
    await this.playSound('button');
  }

  async cleanup() {
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Failed to unload sound:', error);
        }
      }
    }
    this.sounds = {};
    this.isLoaded = false;
  }
}

export default new SoundService(); 