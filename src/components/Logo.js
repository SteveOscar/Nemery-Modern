import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AppText from './AppText';
import { colors } from '../constants/colors';

const Logo = ({ size = 'medium', showText = true, style }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40 };
      case 'large':
        return { width: 120, height: 120 };
      default:
        return { width: 80, height: 80 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'large':
        return 42;
      default:
        return 36;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* <Image
        source={require('../../assets/images/icon.png')}
        style={[styles.logo, getSize()]}
        resizeMode="contain"
      /> */}
      {showText && (
        <AppText style={[styles.text, { fontSize: getTextSize() }]}>
          Nemery
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 8,
  },
  text: {
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default Logo; 