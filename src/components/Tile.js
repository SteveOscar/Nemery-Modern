// src/components/Tile.js
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import CardFlip from 'react-native-card-flip';
import { colors } from '../constants/colors';
import { TILE_SIZE, BORDER_RADIUS, NUMBER_SIZE } from '../constants/game';

const Tile = ({ left, top, scale, number, cardRef, onPress }) => {
  return (
    <Animated.View
      style={[
        styles.tile,
        {
          left,
          top,
          transform: [{ scale }],
        },
      ]}
    >
      <CardFlip
        ref={cardRef}
        style={styles.cardFlip}
        duration={600}
        flipDirection="y"
        perspective={1000}
      >
        <TouchableOpacity style={styles.tileFace} onPress={onPress}>
          <Text allowFontScaling={false} style={styles.backText}>
            ?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tileFace} onPress={onPress}>
          <Text allowFontScaling={false} style={styles.number}>
            {number}
          </Text>
        </TouchableOpacity>
      </CardFlip>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFlip: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  tileFace: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  number: {
    color: colors.secondary,
    fontSize: NUMBER_SIZE,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    fontWeight: 'bold',
  },
  backText: {
    color: colors.primary,
    fontSize: NUMBER_SIZE,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
    fontWeight: 'bold',
  },
});

export default Tile;