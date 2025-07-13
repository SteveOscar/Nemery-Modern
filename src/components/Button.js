import React, { useCallback } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';

const { height } = Dimensions.get('window');


const Button = ({ text, onPress, sound = true, style, textStyle }) => {
  const playButtonSound = useCallback(async () => {
    if (!sound) return;
    
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/button.mp3'),
        { 
          shouldPlay: true,
          volume: 0.2,
        }
      );
      
      // Clean up sound after playing
      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          audioSound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn('Error playing button sound:', error);
    }
  }, [sound]);

  const handlePress = useCallback(async () => {
    // Haptic feedback for better UX
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playButtonSound();
    onPress?.();
  }, [onPress, playButtonSound]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={handlePress}
      android_ripple={{ color: colors.accent }}
    >
      <Text 
        style={[styles.buttonText, textStyle]} 
        allowFontScaling={false}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: 15,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    // Modern shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Modern shadow for Android
    elevation: 5,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.9 }],
  },
  buttonText: {
    fontSize: 36,
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'system'
  },
});

export default Button;