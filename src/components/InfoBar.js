// src/components/InfoBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const InfoBar = ({ score, level }) => (
  <View style={styles.infoBar}>
    <Text style={styles.infoText}>Score: {score}</Text>
    <Text style={styles.infoText}>Level: {level}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 8,
  },
  infoText: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    fontFamily: 'System',
    textShadowColor: colors.primary,
    textShadowOffset: { width: 1, height: 1 },
  },
});

export default InfoBar;