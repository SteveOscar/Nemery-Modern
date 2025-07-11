// src/components/QuitButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const QuitButton = ({ onPress }) => (
  <TouchableOpacity style={styles.quitButton} onPress={onPress}>
    <Text style={styles.quitButtonText}>Quit</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quitButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
    backgroundColor: colors.secondaryLight,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  quitButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default QuitButton;