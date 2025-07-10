// src/screens/GameScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants/colors';
import { useSound } from '../contexts/SoundContext';
import { useGame } from '../contexts/GameContext';
import CardFlip from 'react-native-card-flip';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const CELL_SIZE = Math.floor(width * 0.2);
const CELL_PADDING = Math.floor(CELL_SIZE * 0.07);
const BORDER_RADIUS = CELL_PADDING * 1;
const TILE_SIZE = CELL_SIZE - CELL_PADDING * 2;
const LETTER_SIZE = Math.floor(TILE_SIZE * 0.70);

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
  
  // If we need more unique numbers than available, use a larger range
  const actualMax = Math.max(max, length);
  
  // Generate all possible numbers and shuffle them
  let allNumbers = [];
  for (let i = 0; i < actualMax; i++) {
    allNumbers.push(i);
  }
  
  // Fisher-Yates shuffle
  for (let i = allNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
  }
  
  // Take the first 'length' numbers
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

function levelTimeAdjustment(baseTime, level) {
  let result = 100;
  for (let i = 0; i < level; i++) {
    result = result * 0.9;
  }
  return result / 100;
}

// Overlay component for success/failure messages
const Overlay = ({ visible, message, type, anim }) => {
  if (!visible) return null;
  return (
    <Animated.View
      style={[
        styles.overlay,
        type === 'success' ? styles.overlaySuccess : styles.overlayFail,
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1.1],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.overlayText}>{message}</Text>
    </Animated.View>
  );
};

const GameScreen = ({
  sound = true,
  updateScore = () => {},
  deliverVerdict = () => {},
  endGame = () => {},
}) => {
  // --- State ---
  const { difficulty, level, getCurrentConfig, score, nextLevel } = useGame();
  const navigation = useNavigation();
  const config = getCurrentConfig();
  const size = config.gridSize;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(width)).current;
  const timerHeight = useRef(new Animated.Value(0)).current;
  const timerText = useRef(new Animated.Value(0)).current;

  // Board state
  const [boardTilt, setBoardTilt] = useState(() =>
    Array(size[0] * size[1])
      .fill(0)
      .map(() => new Animated.Value(0))
  );
  const [prevSelection, setPrevSelection] = useState('');
  const [numbers, setNumbers] = useState(Array(size[0] * size[1]).fill(''));
  const [hiddenLetters, setHiddenLetters] = useState(() => generateNumbers(size, difficulty, level));
  const [beenClicked, setBeenClicked] = useState([]);
  const [inPlay, setInPlay] = useState(false);

  // --- Overlay State ---
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const [overlayType, setOverlayType] = useState('success'); // 'success' or 'fail'
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // --- Sound ---
  const { playSound } = useSound();
  const playMoveSound = useCallback(() => playSound('whoosh'), [playSound]);
  const playButtonSound = useCallback(() => playSound('tap'), [playSound]);
  const playGameOverSound = useCallback(() => playSound('buzzer'), [playSound]);
  const playVictorySound = useCallback(() => playSound('bell'), [playSound]);

  // --- Tile helpers ---
  const cardRefs = useRef(Array(size[0] * size[1]).fill().map(() => React.createRef()));

  // Show a single tile
  const initialSingleTileShow = useCallback(
    (id) => {
      if (beenClicked.indexOf(id) !== -1) return;
      if (cardRefs.current[id] && cardRefs.current[id].current) {
        cardRefs.current[id].current.flip();
      }
      setNumbers((prev) => {
        const next = [...prev];
        next[id] = hiddenLetters[id];
        return next;
      });
    },
    [beenClicked, cardRefs, hiddenLetters]
  );

  // Hide a single tile
  const tileHide = useCallback(
    (id) => {
      if (cardRefs.current[id] && cardRefs.current[id].current) {
        cardRefs.current[id].current.flip();
      }
      setNumbers((prev) => {
        const next = [...prev];
        next[id] = '';
        return next;
      });
    },
    [cardRefs]
  );

  // Show all tiles, then optionally hide them
  const showTiles = useCallback(
    (shouldHide) => {
      const totalTiles = size[0] * size[1];
      setTimeout(() => {
        for (let i = 0; i < totalTiles; i++) {
          initialSingleTileShow(i);
        }
      }, 500);
      if (shouldHide) hideTiles();
    },
    [size, initialSingleTileShow, hideTiles]
  );

  // Hide all tiles after a delay, then start the game
  const hideTiles = useCallback(() => {
    const difficultyFactor = timeAdjustment(difficulty) * 1.3;
    const totalTiles = size[0] * size[1];
    setTimeout(() => {
      Animated.timing(timerText, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
      Animated.timing(timerHeight, {
        toValue: height * 0.05,
        duration: 1800,
        useNativeDriver: false,
      }).start();
    }, 2500 * difficultyFactor);
    setTimeout(() => {
      for (let i = 0; i < totalTiles; i++) {
        tileHide(i);
      }
    }, 2500 * difficultyFactor);
    setTimeout(() => {
      setInPlay(true);
      startTimer();
    }, 3500 * gameStartDelay(difficulty, difficultyFactor));
  }, [difficulty, size, tileHide, timerHeight, timerText, startTimer]);

  // --- Overlay logic ---
  const showOverlay = (message, type = 'success', callback) => {
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
  };

  // --- Effects ---
  // Fade in and show tiles on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: false,
    }).start();
    showTiles(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show tiles for new level when level changes (not on initial mount)
  useEffect(() => {
    if (level > 1) {
      showTiles(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // Animate the timer and call handleTimerEnd after timer duration
  const startTimer = useCallback(() => {
    Animated.timing(timerText, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    const baseTime = 3500;
    const difficultyFactor = timeAdjustment(difficulty) * 1.2;
    const timerDuration = baseTime * difficultyFactor * levelTimeAdjustment(baseTime, level);
    Animated.timing(progress, {
      toValue: 0,
      duration: timerDuration,
      useNativeDriver: false,
    }).start();
    setTimeout(() => {
      handleTimerEnd();
    }, timerDuration);
  }, [difficulty, level, progress, timerText, handleTimerEnd]);

  // --- Tile click logic ---
  const alreadyClicked = useCallback(
    (id) => {
      if (beenClicked.indexOf(id) !== -1) return true;
      setBeenClicked((prev) => [...prev, id]);
      return false;
    },
    [beenClicked]
  );

  // Handle tile click
  const clickTile = useCallback(
    (id) => {
      if (!inPlay) return;
      if (alreadyClicked(id)) return;
      playButtonSound();
      if (cardRefs.current[id] && cardRefs.current[id].current) {
        cardRefs.current[id].current.flip();
      }
      setNumbers((prev) => {
        const next = [...prev];
        next[id] = hiddenLetters[id];
        const selected = next[id];
        if (selected >= prevSelection) {
          setPrevSelection(selected);
          updateScore(next.filter((n) => n !== '').length);
          if (next.every((n) => n !== '')) {
            setInPlay(false);
            playVictorySound();
            showOverlay('Level Complete!', 'success', () => {
              nextLevel();
              setPrevSelection('');
              setBeenClicked([]);
              setNumbers(Array(size[0] * size[1]).fill(''));
              setHiddenLetters(generateNumbers(size, difficulty, level + 1));
              setInPlay(false);
            });
          }
        } else {
          playGameOverSound();
          deliverVerdict(false);
          setInPlay(false);
          showOverlay('Game Over', 'fail', () => {
            showTiles(false);
            endGame();
            navigation.navigate('Menu');
          });
        }
        return next;
      });
      const tilt = boardTilt[id];
      tilt.setValue(1);
      Animated.timing(tilt, {
        toValue: 2,
        duration: 300,
        easing: Easing.spring,
        useNativeDriver: false,
      }).start();
    },
    [inPlay, alreadyClicked, playButtonSound, hiddenLetters, boardTilt, cardRefs, prevSelection, updateScore, playGameOverSound, deliverVerdict, setInPlay, showTiles, endGame, playVictorySound, nextLevel, navigation, size, difficulty, level]
  );

  // Timer end logic
  const handleTimerEnd = useCallback(() => {
    const length = size[0] * size[1];
    if (!inPlay || beenClicked.length === length) return;
    playGameOverSound();
    deliverVerdict(false);
    setInPlay(false);
    showOverlay('Game Over', 'fail', () => {
      showTiles(false);
      endGame();
      navigation.navigate('Menu');
    });
  }, [inPlay, beenClicked, size, playGameOverSound, deliverVerdict, showTiles, endGame, navigation]);

  // Handle quit button
  const handleQuit = () => {
    endGame();
    navigation.navigate('Menu');
  };

  // --- Render helpers ---
  // Render a single tile
  const renderTile = (id, letter) => (
    <View
      key={id}
      style={[
        styles.tile,
        {
          left: (id % size[0]) * CELL_SIZE + CELL_PADDING,
          top: Math.floor(id / size[0]) * CELL_SIZE + CELL_PADDING,
        },
      ]}
    >
      <CardFlip
        ref={cardRefs.current[id]}
        style={styles.cardFlip}
        duration={800}
        flipDirection="y"
        perspective={600}
      >
        <View
          style={styles.tileFace}
          onStartShouldSetResponder={() => {
            clickTile(id);
            return true;
          }}
        >
          {/* Hidden side (back) */}
        </View>
        <View
          style={styles.tileFace}
          onStartShouldSetResponder={() => {
            clickTile(id);
            return true;
          }}
        >
          <Text allowFontScaling={false} style={styles.letter}>
            {letter}
          </Text>
        </View>
      </CardFlip>
    </View>
  );

  // Render all tiles
  const renderTiles = () => {
    const result = [];
    for (let id = 0; id < size[0] * size[1]; id++) {
      result.push(renderTile(id, numbers[id]));
    }
    return result;
  };

  // --- Main render ---
  const dimensionWidth = CELL_SIZE * size[0];
  const dimensionHeight = CELL_SIZE * size[1];
  return (
    <View style={{ width: width, flex: 1 }}>
      <Image
        source={require('../../assets/images/backgroundBottom.png')}
        style={styles.backgroundBottom}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/images/backgroundTop.png')}
        style={styles.backgroundTop}
        resizeMode="cover"
      />
      {/* Quit button in top right */}
      <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
        <Text style={styles.quitButtonText}>Quit</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}> 
        {/* Overlay for success/failure */}
        <Overlay
          visible={overlayVisible}
          message={overlayMessage}
          type={overlayType}
          anim={overlayAnim}
        />
        {/* Score and Level above timer */}
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Score: {score}</Text>
          <Text style={styles.infoText}>Level: {level}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.timer,
              { height: timerHeight, width: progress },
            ]}
          >
            <Animated.Text style={[styles.timerText, { opacity: timerText }]}>TIMER</Animated.Text>
          </Animated.View>
        </View>
        <View
          style={{
            width: dimensionWidth,
            height: dimensionHeight,
            alignSelf: 'center',
          }}
        >
          {renderTiles()}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 3,
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
  },
  letter: {
    color: colors.secondary,
    fontSize: LETTER_SIZE,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    textShadowColor: 'black',
    textShadowOffset: { width: 1, height: 1 },
  },
  timerContainer: {
    width: '100%',
    height: height * 0.1,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    height: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 5,
    opacity: 0.9,
  },
  timerText: {
    color: colors.secondary,
    backgroundColor: 'transparent',
    fontFamily: 'System',
    fontSize: width * 0.05,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 1, height: 1 },
  },
  backgroundBottom: {
    position: 'absolute',
    width: width,
    left: 0,
    right: 0,
    bottom: height * -0.2,
  },
  backgroundTop: {
    position: 'absolute',
    width: width,
    left: 0,
    right: 0,
    top: height * -0.3,
  },
  infoBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 8,
  },
  infoText: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    fontFamily: 'System',
    textShadowColor: colors.primary,
    textShadowOffset: { width: 1, height: 1 },
  },
  quitButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
    backgroundColor: colors.secondaryLight,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  quitButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    zIndex: 20,
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlaySuccess: {
    backgroundColor: 'rgba(50, 205, 50, 0.95)',
  },
  overlayFail: {
    backgroundColor: 'rgba(220, 20, 60, 0.95)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#222',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default GameScreen;
