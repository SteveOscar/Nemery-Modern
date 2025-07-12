// src/components/Board.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tile from './Tile';
import { CELL_SIZE, CELL_PADDING } from '../constants/game';

const Board = ({ size, numbers, tileScales, cardRefs, onTilePress }) => {
  const [cols, rows] = size;
  const boardWidth = CELL_SIZE * cols;
  const boardHeight = CELL_SIZE * rows;

  const tiles = [];
  for (let id = 0; id < cols * rows; id++) {
    const col = id % cols;
    const row = Math.floor(id / cols);
    const left = col * CELL_SIZE + CELL_PADDING;
    const top = row * CELL_SIZE + CELL_PADDING;
    const number = numbers[id];
    tiles.push(
      <Tile
        key={id}
        left={left}
        top={top}
        scale={tileScales[id]}
        number={number}
        cardRef={cardRefs[id]}
        onPress={() => onTilePress(id)}
      />
    );
  }

  return (
    <View style={[styles.container, { width: boardWidth, height: boardHeight }]}>
      {tiles}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
});

export default Board;