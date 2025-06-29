import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Tile from './Tile';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 40, 350);
const TILE_SIZE = BOARD_SIZE / 4;

const GameBoard = ({ board, onTilePress, disabled = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              value={value}
              size={TILE_SIZE}
              onPress={() => onTilePress(rowIndex, colIndex)}
              disabled={disabled}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#BBADA0',
    borderRadius: 8,
    padding: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default GameBoard; 