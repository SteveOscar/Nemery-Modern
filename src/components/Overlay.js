// src/components/Overlay.js
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { colors } from '../constants/colors';

const Overlay = ({ visible, message, type, anim }) => {
  if (!visible) return null;

  const gradientColors =
    type === 'success' ? ['white', colors.accentGlow, colors.glow] : [colors.error, '#FF6B6B'];

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1.1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AppText style={styles.overlayText}>{message}</AppText>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    zIndex: 20,
    borderRadius: 24,
    shadowColor: colors.glow,
    shadowOffset: { width: 2, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  overlayGradient: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  overlayText: {
    color: 'black',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontFamily: 'System',
  },
});

export default Overlay;
