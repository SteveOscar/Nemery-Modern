// src/screens/GameScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../contexts/SoundContext';
import { useGame } from '../contexts/GameContext';
import { useNavigation } from '@react-navigation/native';
import Board from '../components/Board';
import Overlay from '../components/Overlay';
import InfoBar from '../components/InfoBar';
import QuitButton from '../components/QuitButton';

const { width, height } = Dimensions.get('window');

function maxNumber(difficulty, level) {
  if (difficulty === 'Extreme') return Math.min(16 * level, 99);
  if (difficulty === 'Hard') return 12;
  if (difficulty === 'Medium') return 9;
  if (difficulty === 'Easy') return Math.min(6 * level, 99);
  return 29;
}

function generateNumbers(size, difficulty, level) {
  const length = size[0] * size[1];
  const max = maxNumber(difficulty, level);
  const actualMax = Math.max(max, length);
  let allNumbers = Array.from({ length: actualMax }, (_, i) => i);
  for (let i = allNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
  }
  return allNumbers.slice(0, length);
}

function timeAdjustment(difficulty) {
  if (difficulty === 'Easy') return 1.5;
  if (difficulty === 'Medium') return 2;
  if (difficulty === 'Hard') return 3;
  if (difficulty === 'Extreme') return 3;
  return 2;
}

function gameStartDelay(difficulty, difficultyFactor) {
  if (difficulty === 'Easy') return difficultyFactor;
  if (difficulty === 'Medium') return difficultyFactor - 0.2;
  if (difficulty === 'Hard') return difficultyFactor - 0.5;
  if (difficulty === 'Extreme') return difficultyFactor - 0.3;
  return difficultyFactor;
}

const GameScreen = () => {
  const { difficulty, level, getCurrentConfig, score, nextLevel, updateScore, endGame } = useGame();
  const navigation = useNavigation();
  const config = getCurrentConfig();
  const size = config.gridSize;
  const totalTiles = size[0] * size[1];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [tileScales, setTileScales] = useState(Array(totalTiles).fill().map(() => new Animated.Value(1)));
  // Remove cardRefs, use tileFlipped state
  const [tileFlipped, setTileFlipped] = useState(Array(totalTiles).fill(false));
  const [prevSelection, setPrevSelection] = useState(-1);
  const [numbers, setNumbers] = useState(Array(totalTiles).fill(''));
  const [hiddenNumbers, setHiddenNumbers] = useState(generateNumbers(size, difficulty, level));
  const [beenClicked, setBeenClicked] = useState([]);
  const [inPlay, setInPlay] = useState(false);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [overlayType, setOverlayType] = useState('success');

  const { playSound } = useSound();
  const playButtonSound = useCallback(() => playSound('tap'), [playSound]);
  const playGameOverSound = useCallback(() => playSound('buzzer'), [playSound]);
  const playVictorySound = useCallback(() => playSound('bell'), [playSound]);

  // Remove flipTile and ref logic

  // Show all numbers (unflipped)
  const showAllNumbers = useCallback(() => {
    setTileFlipped(Array(totalTiles).fill(false));
    setNumbers(hiddenNumbers);
  }, [totalTiles, hiddenNumbers]);

  // Hide all numbers (flipped)
  const hideAllNumbers = useCallback(() => {
    setTileFlipped(Array(totalTiles).fill(true));
    setNumbers(Array(totalTiles).fill(''));
  }, [totalTiles]);

  // Show/hide tiles with memorization delay
  const showTiles = useCallback(
    (shouldHide) => {
      setTimeout(() => {
        showAllNumbers();
        if (shouldHide) {
          const difficultyFactor = timeAdjustment(difficulty) * 1.3;
          setTimeout(() => {
            hideAllNumbers();
            setInPlay(true);
          }, 2500 * difficultyFactor);
        }
      }, 500);
    },
    [difficulty, showAllNumbers, hideAllNumbers]
  );

  const showOverlay = useCallback((message, type = 'success', callback) => {
    setOverlayMessage(message);
    setOverlayType(type);
    setOverlayVisible(true);
    overlayAnim.setValue(0);
    Animated.spring(overlayAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setOverlayVisible(false);
          if (callback) callback();
        });
      }, 1200);
    });
  }, [overlayAnim]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: true,
    }).start();
    showTiles(true);
  }, [showTiles]);

  useEffect(() => {
    if (level > 1) {
      showTiles(true);
    }
  }, [level, showTiles]);

  useEffect(() => {
    setTileScales(Array(totalTiles).fill().map(() => new Animated.Value(1)));
  }, [totalTiles]);

  const alreadyClicked = useCallback(
    (id) => {
      if (beenClicked.includes(id)) return true;
      setBeenClicked((prev) => [...prev, id]);
      return false;
    },
    [beenClicked]
  );

  const clickTile = useCallback(
    (id) => {
      if (!inPlay) return;
      if (alreadyClicked(id)) return;
      playButtonSound();
      // Unflip the tile to show the number
      setTileFlipped((prev) => {
        const next = [...prev];
        next[id] = false;
        return next;
      });
      const scale = tileScales[id];
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setNumbers((prev) => {
        const next = [...prev];
        next[id] = hiddenNumbers[id];
        return next;
      });
      setBeenClicked((prev) => [...prev, id]);
    },
    [inPlay, alreadyClicked, playButtonSound, tileScales, hiddenNumbers]
  );

  // Side effect for win/lose/game logic
  useEffect(() => {
    // Only run if inPlay is true
    if (!inPlay) return;
    // Find the most recently revealed tile
    const lastClicked = beenClicked[beenClicked.length - 1];
    if (lastClicked === undefined) return;
    const selected = numbers[lastClicked];
    if (selected === undefined || selected === '') return;
    // Check if the selection is valid
    if (selected >= prevSelection) {
      // Valid selection
      const uniqueRevealed = new Set(beenClicked);
      if (uniqueRevealed.size === totalTiles) {
        // All unique tiles revealed, level complete
        setInPlay(false);
        playVictorySound();
        showOverlay('Level Complete!', 'success', () => {
          nextLevel();
          setPrevSelection(-1);
          setBeenClicked([]);
          setNumbers(Array(totalTiles).fill(''));
          setTileFlipped(Array(totalTiles).fill(false));
          setHiddenNumbers(generateNumbers(size, difficulty, level + 1));
          setInPlay(false);
        });
      } else {
        // Not done yet, update score and prevSelection
        updateScore();
        setPrevSelection(selected);
      }
    } else {
      // Invalid selection, game over
      playGameOverSound();
      setInPlay(false);
      showOverlay('Game Over', 'fail', () => {
        showTiles(false);
        endGame(score);
        navigation.navigate('Menu');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beenClicked]);

  const handleQuit = () => {
    endGame(score);
    navigation.navigate('Menu');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#f5576c']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <QuitButton onPress={handleQuit} />
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
        <Overlay
          visible={overlayVisible}
          message={overlayMessage}
          type={overlayType}
          anim={overlayAnim}
        />
        <InfoBar score={score} level={level} />
        <Board
          size={size}
          numbers={numbers}
          tileScales={tileScales}
          tileFlipped={tileFlipped}
          onTilePress={clickTile}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
});

export default GameScreen;