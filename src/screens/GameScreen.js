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
} from 'react-native';
import { colors } from '../constants/colors';
import { useSound } from '../contexts/SoundContext';
import { useGame } from '../contexts/GameContext';
import CardFlip from 'react-native-card-flip';

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

const GameScreen = ({
  sound = true,
  updateScore = () => {},
  deliverVerdict = () => {},
  endGame = () => {},
}) => {
  const { difficulty, level, getCurrentConfig } = useGame();
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

  // // Sound
  const { playSound } = useSound();
  
  // // Convenience sound functions
  const playMoveSound = useCallback(() => playSound('whoosh'), [playSound]);
  const playButtonSound = useCallback(() => playSound('tap'), [playSound]);
  const playGameOverSound = useCallback(() => playSound('buzzer'), [playSound]);
  const playVictorySound = useCallback(() => playSound('bell'), [playSound]);

  // // CardFlip refs for each tile
  const cardRefs = useRef(Array(size[0] * size[1]).fill().map(() => React.createRef()));

  // // Show/hide tile helpers
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

  // Show/hide tiles in sequence
  const showTiles = useCallback(
    (shouldHide) => {
      const totalTiles = size[0] * size[1];
      
      // Show all tiles at once
      setTimeout(() => {
        for (let i = 0; i < totalTiles; i++) {
          initialSingleTileShow(i);
        }
      }, 500);
      
      if (shouldHide) hideTiles();
    },
    [size, initialSingleTileShow, hideTiles]
  );

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
    
    // Hide all tiles at once after the delay
    setTimeout(() => {
      for (let i = 0; i < totalTiles; i++) {
        tileHide(i);
      }
    }, 2500 * difficultyFactor);
    
    // Start the game after tiles are hidden
    setTimeout(() => {
      console.log('Setting inPlay to true and starting timer');
      setInPlay(true);
      startTimer();
    }, 3500 * gameStartDelay(difficulty, difficultyFactor));
  }, [difficulty, size, tileHide, timerHeight, timerText]);

  // Timer logic
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
  }, [difficulty, level, progress, timerText]);

  // On mount: fade in and show tiles
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1300,
      useNativeDriver: false,
    }).start();
    showTiles(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tile click logic
  const alreadyClicked = useCallback(
    (id) => {
      if (beenClicked.indexOf(id) !== -1) return true;
      setBeenClicked((prev) => [...prev, id]);
      return false;
    },
    [beenClicked]
  );

  const clickTile = useCallback(
    (id) => {
      console.log('clickTile called with id:', id, 'inPlay:', inPlay);
      if (!inPlay) {
        console.log('Game not in play, returning');
        return;
      }
      if (alreadyClicked(id)) {
        console.log('Tile already clicked, returning');
        return;
      }
      console.log('Processing tile click');
      playButtonSound();
      
      // Flip the card to show the number
      if (cardRefs.current[id] && cardRefs.current[id].current) {
        cardRefs.current[id].current.flip();
      }
      
      setNumbers((prev) => {
        const next = [...prev];
        next[id] = hiddenLetters[id];
        // Inline checkSelection logic
        const selected = next[id];
        console.log('selected:', selected, 'prevSelection:', prevSelection, 'numbers:', next, 'id:', id);
        if (selected >= prevSelection) {
          setPrevSelection(selected);
          updateScore(next.filter((n) => n !== '').length);
        } else {
          playGameOverSound();
          deliverVerdict(false);
          setInPlay(false);
          showTiles(false);
          endGame();
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
    [inPlay, alreadyClicked, playButtonSound, hiddenLetters, boardTilt, cardRefs, prevSelection, updateScore, playGameOverSound, deliverVerdict, setInPlay, showTiles, endGame]
  );

  // Timer end
  const handleTimerEnd = useCallback(() => {
    const length = size[0] * size[1];
    if (!inPlay || beenClicked.length === length) return;
    playGameOverSound();
    deliverVerdict(false);
    setInPlay(false);
    showTiles(false);
    endGame();
  }, [inPlay, beenClicked, size, playGameOverSound, deliverVerdict, showTiles, endGame]);

  // Render tiles
  const renderTiles = () => {
    let result = [];
    for (let row = 0; row < size[1]; row++) {
      for (let col = 0; col < size[0]; col++) {
        let id = row * size[0] + col;
        let letter = numbers[id];
        result.push(
          <View
            key={id}
            style={[
              styles.tile,
              {
                left: col * CELL_SIZE + CELL_PADDING,
                top: row * CELL_SIZE + CELL_PADDING,
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
      }
    }
    return result;
  };

  // // Main render
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
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
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
});

export default GameScreen;
