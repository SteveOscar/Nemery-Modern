// src/components/InfoBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { colors } from '../constants/colors';

function InfoBar({ score, level }) {
  return (
    <View style={styles.infoBar}>
      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
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
}

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
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
    backgroundColor: colors.surface,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'System',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  infoValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    fontFamily: 'System',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primary,
    marginHorizontal: 20,
  },
});

export default InfoBar;
