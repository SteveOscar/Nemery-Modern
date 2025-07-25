import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Dimensions, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSound } from '../contexts/SoundContext';
import { useGame } from '../contexts/GameContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Board from '../components/Board';
import Overlay from '../components/Overlay';
import InfoBar from '../components/InfoBar';
import BackButton from '../components/BackButton';
import AppText from '../components/AppText';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

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

const GameScreen = () => {
  const { difficulty, level, getCurrentConfig, score, nextLevel, updateScore, endGame } = useGame();
  const navigation = useNavigation();
  const config = getCurrentConfig();
  const size = config.gridSize;
  const totalTiles = size[0] * size[1];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [tileScales, setTileScales] = useState(
    Array(totalTiles)
      .fill()
      .map(() => new Animated.Value(1))
  );
  // Remove cardRefs, use tileFlipped state
  const [tileFlipped, setTileFlipped] = useState(Array(totalTiles).fill(false));
  const [prevSelection, setPrevSelection] = useState(-1);
  const [numbers, setNumbers] = useState(Array(totalTiles).fill(''));
  const [hiddenNumbers, setHiddenNumbers] = useState(generateNumbers(size, difficulty, level));
  const [beenClicked, setBeenClicked] = useState([]);
  const [inPlay, setInPlay] = useState(false);
  const [showTimerBar, setShowTimerBar] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef(null);
  const memorizationTimeoutRef = useRef(null);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [overlayType, setOverlayType] = useState('success');

  const { playSound, playBackgroundMusic, stopBackgroundMusic, backgroundMusicEnabled } =
    useSound();
  const playButtonSound = useCallback(() => playSound('tap', { overlap: true }), [playSound]);
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
    setShowTimerBar(false);
  }, [totalTiles]);

  // Show/hide tiles with memorization delay
  const showTiles = useCallback(
    (shouldHide) => {
      // First, show all tiles as flipped (question mark) for 0.5s
      setTileFlipped(Array(totalTiles).fill(true));
      setNumbers(Array(totalTiles).fill(''));
      if (memorizationTimeoutRef.current) {
        clearTimeout(memorizationTimeoutRef.current);
        memorizationTimeoutRef.current = null;
      }
      memorizationTimeoutRef.current = setTimeout(() => {
        memorizationTimeoutRef.current = null;
        showAllNumbers();
        if (shouldHide) {
          const difficultyFactor = timeAdjustment(difficulty) * 1.3;
          const duration = 2500 * difficultyFactor;
          setShowTimerBar(true);
          setTimerSeconds(Math.ceil(duration / 1000));
          timerBarAnim.setValue(1);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          let start = Date.now();
          timerIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, duration - elapsed);
            setTimerSeconds(Math.ceil(remaining / 1000));
            if (remaining <= 0) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
          }, 100);
          Animated.timing(timerBarAnim, {
            toValue: 0,
            duration,
            useNativeDriver: false,
          }).start();
          if (memorizationTimeoutRef.current) {
            clearTimeout(memorizationTimeoutRef.current);
            memorizationTimeoutRef.current = null;
          }
          memorizationTimeoutRef.current = setTimeout(() => {
            memorizationTimeoutRef.current = null;
            hideAllNumbers();
            setInPlay(true);
            setTimerSeconds(0);
            setShowTimerBar(false);
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
          }, duration);
        }
      }, 500); // 0.5s with all tiles flipped before showing numbers
    },
    [difficulty, showAllNumbers, hideAllNumbers, timerBarAnim, totalTiles]
  );

  const showOverlay = useCallback(
    (message, type = 'success', callback) => {
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
    },
    [overlayAnim]
  );

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
    setTileScales(
      Array(totalTiles)
        .fill()
        .map(() => new Animated.Value(1))
    );
  }, [totalTiles]);

  // Reset all per-board state when GameScreen is focused (prevents stale arrays)
  useFocusEffect(
    React.useCallback(() => {
      setTileScales(
        Array(totalTiles)
          .fill()
          .map(() => new Animated.Value(1))
      );
      setTileFlipped(Array(totalTiles).fill(false));
      setNumbers(Array(totalTiles).fill(''));
      setHiddenNumbers(generateNumbers(size, difficulty, level));
      setBeenClicked([]);
      setPrevSelection(-1);
      setInPlay(false);
      setShowTimerBar(false);
      setTimerSeconds(0);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (memorizationTimeoutRef.current) {
        clearTimeout(memorizationTimeoutRef.current);
        memorizationTimeoutRef.current = null;
      }
    }, [size[0], size[1], difficulty, level])
  );

  // Start/stop background music when GameScreen is focused/unfocused
  useFocusEffect(
    React.useCallback(() => {
      if (backgroundMusicEnabled) {
        playBackgroundMusic();
      }
      return () => {
        stopBackgroundMusic();
      };
    }, [backgroundMusicEnabled, playBackgroundMusic, stopBackgroundMusic])
  );

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
          // Show the new level transition: all tiles flipped for 0.5s, then memorization
          showTiles(true);
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

  const ready =
    tileScales.length === totalTiles &&
    tileFlipped.length === totalTiles &&
    numbers.length === totalTiles &&
    hiddenNumbers.length === totalTiles;

  // Helper to immediately end memorization phase
  const skipMemorization = useCallback(() => {
    if (memorizationTimeoutRef.current) {
      clearTimeout(memorizationTimeoutRef.current);
      memorizationTimeoutRef.current = null;
    }
    hideAllNumbers();
    setInPlay(true);
    setTimerSeconds(0);
    setShowTimerBar(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [hideAllNumbers]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.gameBoard, colors.primaryDark, colors.primary]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[colors.overlay, colors.overlayLight]}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BackButton
        text="← Quit"
        onPress={handleQuit}
        style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }}
      />
      {showTimerBar && (
        <View style={styles.timerBarContainer}>
          <AppText style={styles.timerBarText}>
            Game starts in: {timerSeconds > 0 ? timerSeconds : ''}
          </AppText>
          <Animated.View
            style={[
              styles.timerBar,
              {
                width: timerBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width * 0.7],
                }),
              },
            ]}
          />
          <AppText style={styles.skipButton} onPress={skipMemorization}>
            Start Now
          </AppText>
        </View>
      )}
      {ready && (
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
      )}
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
  timerBarContainer: {
    position: 'absolute',
    top: 250,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  skipButton: {
    backgroundColor: colors.primaryDark,
    color: colors.white,
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    textAlign: 'center',
    alignSelf: 'center',
    elevation: 2,
  },
  timerBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.primary,
    shadowColor: colors.glow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  timerBarText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default GameScreen;
