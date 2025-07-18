import React, { useCallback } from 'react';
import { Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import AppText from './AppText';
import { theme } from '../constants/theme';

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
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
      onPress={handlePress}
      android_ripple={{ color: colors.accent }}
    >
      <AppText
        style={[styles.buttonText, { fontFamily: theme.fontFamilyBold }, textStyle]}
        allowFontScaling={false}
      >
        {text}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    marginBottom: 15,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    // Modern shadow for iOS
    shadowColor: colors.glow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    // Modern shadow for Android
    elevation: 10,
    borderWidth: 2,
    borderColor: colors.accentGlow,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.primaryDark,
    shadowColor: colors.accentGlow,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '600',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default Button;
