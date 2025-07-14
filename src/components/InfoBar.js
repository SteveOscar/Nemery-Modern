// src/components/InfoBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';

const InfoBar = ({ score, level }) => (
  <View style={styles.infoBar}>
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
      style={styles.infoContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.infoItem}>
        <AppText style={styles.infoLabel}>SCORE</AppText>
        <AppText style={styles.infoValue}>{score}</AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.infoItem}>
        <AppText style={styles.infoLabel}>LEVEL</AppText>
        <AppText style={styles.infoValue}>{level}</AppText>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  infoBar: {
    width: '100%',
    marginBottom: 32,
    marginTop: 75,
    paddingHorizontal: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'System',
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'System',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
});

export default InfoBar;