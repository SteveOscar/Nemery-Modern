import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
// TODO
// import { colors } from '../constants/colors';

const Tile = ({ value, size, onPress, disabled = false }) => {
  const getTileColor = (value) => {
    const tileColors = {
      0: '#CDC1B4',
      2: '#EEE4DA',
      4: '#EDE0C8',
      8: '#F2B179',
      16: '#F59563',
      32: '#F67C5F',
      64: '#F65E3B',
      128: '#EDCF72',
      256: '#EDCC61',
      512: '#EDC850',
      1024: '#EDC53F',
      2048: '#EDC22E',
    };
    return tileColors[value] || '#3C3A32';
  };

  const getTextColor = (value) => {
    return value <= 4 ? '#776E65' : '#F9F6F2';
  };

  const getFontSize = (value) => {
    if (value < 100) return size * 0.4;
    if (value < 1000) return size * 0.35;
    return size * 0.3;
  };

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        {
          width: size - 8,
          height: size - 8,
          backgroundColor: getTileColor(value),
        },
        value === 0 && styles.emptyTile,
      ]}
      onPress={onPress}
      disabled={disabled || value === 0}
      activeOpacity={0.7}
    >
      {value !== 0 && (
        <Text
          style={[
            styles.text,
            {
              fontSize: getFontSize(value),
              color: getTextColor(value),
            },
          ]}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    margin: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTile: {
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Tile; 