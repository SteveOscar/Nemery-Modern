import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

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
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={[styles.logo, getSize()]}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { fontSize: getTextSize() }]}>
          Nemery
        </Text>
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
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default Logo; 