// src/components/Overlay.js
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

const Overlay = ({ visible, message, type, anim }) => {
  if (!visible) return null;
  return (
    <Animated.View
      style={[
        styles.overlay,
        type === 'success' ? styles.overlaySuccess : styles.overlayFail,
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
      <Text style={styles.overlayText}>{message}</Text>
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
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlaySuccess: {
    backgroundColor: 'rgba(50, 205, 50, 0.95)',
  },
  overlayFail: {
    backgroundColor: 'rgba(220, 20, 60, 0.95)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default Overlay;