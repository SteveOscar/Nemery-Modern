// src/components/Board.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FlippableTile from './FlippableTile';
import { CELL_SIZE, CELL_PADDING } from '../constants/game';
import AppText from './AppText';
import { colors } from '../constants/colors';

const TILE_SPACING = 10;

const { width, height } = Dimensions.get('window');

const Board = ({ size, numbers, tileScales, tileFlipped, onTilePress }) => {
  const [cols, rows] = size;
  const boardWidth = width * 0.9;
  const boardHeight = height * 0.7;

  // Calculate grid size (tiles area, not the board)
  const gridWidth = CELL_SIZE * cols + TILE_SPACING * (cols - 1) + CELL_PADDING * 2;
  const gridHeight = CELL_SIZE * rows + TILE_SPACING * (rows - 1) + CELL_PADDING * 2;
  // Calculate offsets to center the grid within the board
  const offsetX = (boardWidth - gridWidth) / 2;
  const offsetY = (boardHeight - gridHeight) / 2;

  const tiles = [];
  for (let id = 0; id < cols * rows; id++) {
    const col = id % cols;
    const row = Math.floor(id / cols);
    // Add TILE_SPACING between tiles
    const left = col * (CELL_SIZE + TILE_SPACING) + CELL_PADDING + offsetX;
    const top = row * (CELL_SIZE + TILE_SPACING) + CELL_PADDING + offsetY;
    const number = numbers[id];
    tiles.push(
      <Animated.View
        key={id}
        style={{
          position: 'absolute',
          left,
          top,
          transform: [{ scale: tileScales[id] }],
          width: CELL_SIZE,
          height: CELL_SIZE,
        }}
      >
        <FlippableTile
          isFlipped={tileFlipped[id]}
          frontContent={
            <TouchableOpacity
              style={styles.tileButton}
              onPress={() => onTilePress(id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primaryDark, colors.primary, colors.accentGlow]}
                style={styles.tileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppText style={styles.tileNumber}>{number}</AppText>
              </LinearGradient>
            </TouchableOpacity>
          }
          backContent={
            <TouchableOpacity
              style={styles.tileButton}
              onPress={() => onTilePress(id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.background, colors.primaryDark]}
                style={styles.tileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <AppText style={styles.tileQuestion}>?</AppText>
              </LinearGradient>
            </TouchableOpacity>
          }
          style={styles.tileContainer}
          duration={400}
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { width: boardWidth, height: boardHeight }]}>
      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
        style={styles.boardBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {tiles}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  boardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tileContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 16,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  tileButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tileNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primaryDark,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tileQuestion: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primary,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default Board;
