// src/components/Overlay.js
import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';

const Overlay = ({ visible, message, type, anim }) => {
  if (!visible) return null;
  
  const gradientColors = type === 'success' 
    ? ['rgba(76, 175, 80, 0.9)', 'rgba(129, 199, 132, 0.9)']
    : ['rgba(244, 67, 54, 0.9)', 'rgba(239, 83, 80, 0.9)'];
    
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
    top: '40%',
    left: '10%',
    right: '10%',
    zIndex: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  overlayGradient: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
  },
});

export default Overlay;