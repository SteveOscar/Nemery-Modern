// src/components/QuitButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const QuitButton = ({ onPress }) => (
  <TouchableOpacity style={styles.quitButton} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
      style={styles.buttonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.quitButtonText}>✕</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quitButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
  },
});

export default QuitButton;