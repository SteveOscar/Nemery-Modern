// src/components/Board.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import FlippableTile from './FlippableTile';
import { CELL_SIZE, CELL_PADDING } from '../constants/game';

const Board = ({ size, numbers, tileScales, tileFlipped, onTilePress }) => {
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
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => onTilePress(id)}>
              <Text allowFontScaling={false} style={{ fontSize: 32, fontWeight: 'bold' }}>{number}</Text>
            </TouchableOpacity>
          }
          backContent={
            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => onTilePress(id)}>
              <Text allowFontScaling={false} style={{ fontSize: 32, fontWeight: 'bold' }}>?</Text>
            </TouchableOpacity>
          }
          style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, borderColor: '#ccc', overflow: 'hidden' }}
        />
      </Animated.View>
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