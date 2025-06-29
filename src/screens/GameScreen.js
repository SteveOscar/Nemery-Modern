import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import GameBoard from '../components/GameBoard';
import Button from '../components/Button';
import { colors } from '../constants/colors';
import { useGameLogic } from '../hooks/useGameLogic';
import { useSound } from '../hooks/useSound';

const GameScreen = ({ onGameOver, onBackToMenu }) => {
  const {
    board,
    score,
    bestScore,
    gameOver,
    move,
    resetGame,
    canUndo,
    undo,
  } = useGameLogic();

  const { playSound } = useSound();

  useEffect(() => {
    if (gameOver) {
      playSound('gameOver');
      Alert.alert(
        'Game Over!',
        `Final Score: ${score}\nBest Score: ${bestScore}`,
        [
          { text: 'New Game', onPress: resetGame },
          { text: 'Menu', onPress: onBackToMenu },
        ]
      );
    }
  }, [gameOver, score, bestScore, resetGame, onBackToMenu, playSound]);

  const handleTilePress = (row, col) => {
    // This would be used for special tile interactions if needed
    console.log(`Tile pressed at ${row}, ${col}`);
  };

  const handleSwipe = (direction) => {
    const moved = move(direction);
    if (moved) {
      playSound('move');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Menu"
          onPress={onBackToMenu}
          variant="secondary"
          style={styles.menuButton}
        />
        
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Best</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <GameBoard
          board={board}
          onTilePress={handleTilePress}
          disabled={gameOver}
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <Button
            title="↑"
            onPress={() => handleSwipe('up')}
            style={styles.controlButton}
          />
        </View>
        <View style={styles.controlRow}>
          <Button
            title="←"
            onPress={() => handleSwipe('left')}
            style={styles.controlButton}
          />
          <Button
            title="→"
            onPress={() => handleSwipe('right')}
            style={styles.controlButton}
          />
        </View>
        <View style={styles.controlRow}>
          <Button
            title="↓"
            onPress={() => handleSwipe('down')}
            style={styles.controlButton}
          />
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Undo"
          onPress={undo}
          disabled={!canUndo}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="New Game"
          onPress={resetGame}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuButton: {
    minWidth: 80,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  controlButton: {
    width: 60,
    height: 60,
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default GameScreen; 